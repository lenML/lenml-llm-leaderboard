import { unquant } from "./data/unquant";

// TODO: 支持其他自定义 column
type ExtraColumn =
  | {
      type: "formula";
      // 列名
      name: string;
      // 公式
      formula: string;
    }
  | {
      // 应用于多个列
      type: "formula-map";
      column: string[];
      name: string;
    }
  | {
      // 分配权重计算出新分数
      type: "weight";
      name: string;
      // 这里面不列出来的不计算
      weights: Record<string, number>;
    };

/**
 * 元数据
 */
interface LeaderboardMetadata {
  hidden_columns?: string[];
  extra_columns?: ExtraColumn[];
}

/**
 * 保留 t 位小数
 */
function n_fixed(n: number, t = 2) {
  return Number(n.toFixed(t));
}

function obj_null_to_zero(obj: Record<string, unknown>) {
  const ret = { ...obj };
  for (const k of Object.keys(ret)) {
    if (ret[k] === null) {
      ret[k] = 0;
    }
  }
  return ret;
}

/**
 * 排行榜类
 *
 * 主要是处理数据，提供预处理，公式之类的
 */
export class LeaderboardData<T extends object> {
  // 前三列，所有数据前三列都应该是这三个
  static readonly f3_cols = ["model", "size", "quantization"];

  data: T[] = [];
  columns: string[] = [];

  default_hidden = [] as string[];
  metadata: LeaderboardMetadata = {};

  constructor(readonly raw: T[]) {
    this.collect_columns();
    this.load_data();
    this.null_fixed();
    this.parse();

    this.add_pb_score();
    this.add_uq_score();

    this.hidden_quant_if_empty();
    this.data_fixed();
  }

  public get_column_visibility(): Record<string, boolean> {
    return Object.fromEntries(
      this.columns.map((x) => [x, !this.default_hidden.includes(x)])
    );
  }

  protected collect_columns() {
    const columns = [] as string[];
    for (const x of this.raw) {
      for (const k of Object.keys(x)) {
        if (!columns.includes(k)) {
          columns.push(k);
        }
      }
    }
    this.columns = columns.filter((x) => !x.startsWith("_"));
  }

  /**
   * 加载数据
   */
  protected load_data() {
    this.data = this.raw.map(
      (x) =>
        Object.fromEntries(
          Object.entries(x).filter(([k, v]) => !k.startsWith("_"))
        ) as T
    );
  }

  /**
   * 解析出元数据，并处理 raw 数据为 data
   */
  protected parse() {
    const item0 = this.raw[0];
    if (!item0) {
      throw new Error("没有数据");
    }
    const meta = item0["__meta__"] as LeaderboardMetadata;
    if (meta) {
      this.apply_metadata(meta);
    }
  }

  /**
   * 计算 pb 分数
   *
   * 就是非常简单的计算每个分数除以模型大小
   */
  protected add_pb_score() {
    if (!this.columns.includes("size")) {
      // 如果没有 size 列，则直接返回
      return;
    }
    this.columns.forEach((k) => {
      if (LeaderboardData.f3_cols.includes(k)) return;
      if (k.startsWith("pb-")) return;
      if (k.startsWith("uq-")) return;
      const key = `pb-${k}`;
      this.columns.push(key);
      this.default_hidden.push(key);
    });
    this.data = this.data.map((x) => {
      const size = Number(x["size"]);
      if (Number.isNaN(size)) {
        return x;
      }
      for (const [k, v] of Object.entries(x)) {
        if (LeaderboardData.f3_cols.includes(k)) continue;
        if (k.startsWith("pb-")) continue;
        if (k.startsWith("uq-")) continue;
        const key = `pb-${k}`;
        x[key] = Number(v) / size;
      }
      return x;
    });
  }

  /**
   * 计算 uq 分数
   *
   * 使用非常简单的 ppl 分数曲线（折线）来近似推算完全模型的分数
   */
  protected add_uq_score() {
    if (!this.columns.includes("quantization")) {
      // 如果没有 quantization 列，则直接返回
      return;
    }
    this.columns.forEach((k) => {
      if (LeaderboardData.f3_cols.includes(k)) return;
      if (k.startsWith("pb-")) return;
      if (k.startsWith("uq-")) return;
      const key = `uq-${k}`;
      this.columns.push(key);
      this.default_hidden.push(key);
    });
    this.data = this.data.map((x) => {
      const quant = x["quantization"];
      for (const [k, v] of Object.entries(x)) {
        if (LeaderboardData.f3_cols.includes(k)) continue;
        if (k.startsWith("pb-")) continue;
        if (k.startsWith("uq-")) continue;
        if (typeof v !== "number") continue;

        const key = `uq-${k}`;
        x[key] = unquant(v, quant);
      }
      return x;
    });
  }

  /**
   * 如果所有列都没有 quantization 列，那么隐藏
   */
  protected hidden_quant_if_empty() {
    const has_quant = this.raw.some((x) => x["quantization"]);
    if (!has_quant) {
      this.default_hidden.push("quantization");
    }
  }

  /**
   * 保留所有 number 为 2 位
   */
  protected data_fixed() {
    this.data = this.data.map((x) => {
      return Object.fromEntries(
        Object.entries(x).map(([k, v]) => [
          k,
          typeof v === "number" ? n_fixed(v) : v,
        ])
      ) as T;
    });
  }

  /**
   * 缺少的数据使用 null 填充
   */
  protected null_fixed() {
    this.data = this.data.map((x) => {
      for (const col of this.columns) {
        if (!(col in x)) {
          x[col] = null;
        }
      }
      return x;
    });
  }

  /**
   * 应用元数据
   */
  protected apply_metadata(meta: LeaderboardMetadata) {
    this.metadata = meta;
    this.default_hidden = [
      ...this.default_hidden,
      ...(meta.hidden_columns ?? []),
    ];

    if (meta.extra_columns) {
      for (const extra of meta.extra_columns) {
        switch (extra.type) {
          case "formula":
            this.apply_extra_formula(extra.name, extra.formula);
            break;
          case "formula-map":
            this.apply_extra_formula_map(extra.column, extra.name);
            break;
          case "weight":
            this.apply_extra_weight(extra.name, extra.weights);
            break;
          default: {
            throw new Error("未知的 extra 类型");
          }
        }
      }
    }
  }

  /**
   * 应用公式
   */
  protected apply_extra_formula(name: string, formula: string) {
    this.data = this.data.map((x) => {
      const x_zero = obj_null_to_zero(x as any);
      return {
        ...x,
        [name]: new Function("x", `return (${formula})`)(x_zero),
      };
    });
  }

  /**
   * 应用公式
   */
  protected apply_extra_formula_map(column: string[], name: string) {
    this.data = this.data.map((x) => {
      const x_zero = obj_null_to_zero(x as any);
      for (const col of column) {
        const col_key = name.replace(/\{\{column\}\}/g, col);
        x[col_key] = new Function("x", `return x["${col}"]`)(x_zero);
      }
      return x;
    });
  }

  /**
   * 应用权重
   */
  protected apply_extra_weight(name: string, weights: Record<string, number>) {
    this.data = this.data.map((x) => {
      const x_zero = obj_null_to_zero(x as any);
      const w_sum = Object.values(weights).reduce((a, b) => a + b, 0);
      const sum = Object.entries(x_zero)
        .filter(([k, v]) => k in weights)
        .map(([k, v]) => (typeof v === "number" ? v * weights[k] : 0))
        .reduce((a, b) => a + b, 0);
      return {
        ...x,
        [name]: sum / w_sum,
      };
    });
  }
}
