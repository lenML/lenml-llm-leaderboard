import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnOrderState,
  FilterFn,
  Cell,
  Column,
} from "@tanstack/react-table";
import { rankItem, compareItems } from "@tanstack/match-sorter-utils";

import evalData from "./data/eval-data.json";
import ollData from "./data/open-llm-leaderboard-1122-fixed.json";
import { unquant } from "./data/unquant";
import Dropdown from "./components/Dropdown";
import { useMemo, useState } from "react";
import {
  calculateColor,
  getComplementaryColor,
  getContrastColor,
} from "./components/colors";

// 通用类型定义
type JsonData = Record<string, any>;

// 模糊搜索过滤器
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// 防抖输入组件
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 列过滤器组件
function ColumnFilter({ column }: { column: Column<JsonData, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <input
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search ${column.id}...`}
      className="w-full border p-0 text-xs"
    />
  );
}

const isNone = (x: any): x is undefined | null => x === null || x === undefined;

interface EnhancedTableProps {
  data: JsonData[];
}

function EnhancedTable({ data }: EnhancedTableProps) {
  const minmaxs = useMemo(() => {
    // 统计各个列的最大最小值
    const num_headers = Object.keys(data[0]).filter(
      (key) => !isNaN(Number(data[0][key]))
    );
    const ret = {} as Record<string, { max: number; min: number }>;

    for (const header of num_headers) {
      const max = Math.max(
        ...data.map((d) => d[header]).filter(Number.isFinite)
      );
      const min = Math.min(
        ...data.map((d) => d[header]).filter(Number.isFinite)
      );
      ret[header] = { max, min };
    }

    return ret;
  }, [data]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 25,
  });

  // 自动生成列配置
  const generateColumns = React.useMemo(() => {
    if (data.length === 0) return [];

    const columnHelper = createColumnHelper<JsonData>();
    return Object.keys(data[0]).map((key) => {
      return columnHelper.accessor(key, {
        header: () =>
          key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        cell: (info) => {
          if (key === "model") {
            // 如果是model，就尝试创建 huggingface 链接
            const val = info.getValue();
            if (typeof val === "string" && val.match(/.+?\/.+?/)) {
              return (
                <a
                  className="text-blue-300 w-60 flex break-all"
                  href={`https://huggingface.co/${val}`}
                  target="_blank"
                  title={`https://huggingface.co/${val}`}
                >
                  {val}
                </a>
              );
            }
          }
          return info.getValue();
        },
        enableSorting: true,
        sortingFn: (rowA, rowB, columnId) => {
          const valueA = rowA.getValue(columnId);
          const valueB = rowB.getValue(columnId);

          // 如果值为 null 或 undefined，将其视为 Infinity
          const a = isNone(valueA) ? -Infinity : valueA;
          const b = isNone(valueB) ? -Infinity : valueB;

          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        },
        // enableFiltering: true,
      });
    });
  }, [data]);

  const table = useReactTable({
    data,
    columns: generateColumns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function getCellColor(cell: Cell<JsonData, unknown>) {
    const val = cell.getValue();
    if (typeof val !== "number") {
      return "#000";
    }
    return minmaxs[cell.column.id]
      ? calculateColor(
          val,
          minmaxs[cell.column.id].min,
          minmaxs[cell.column.id].max,
          "#440154",
          "#f6e61f"
        ).toString()
      : undefined;
  }

  return (
    <div className="p-2 flex flex-col flex-1 overflow-hidden text-xs">
      {/* 全局搜索 */}
      <div className="mb-4">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="p-2 font-lg shadow border border-block w-full"
          placeholder="Search all columns..."
        />
      </div>

      {/* 列可见性控制 */}
      <div className="mb-4 p-2 border rounded">
        <div className="font-bold mb-2">Toggle Columns:</div>
        <div className="flex flex-wrap gap-2">
          {table.getAllLeafColumns().map((column) => (
            <div className="inline" key={column.id}>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                <span className="ml-2">{column.id}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto overflow-y-auto flex flex-col flex-1 border">
        <table className="min-w-full">
          <thead className="sticky top-0 ">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border bg-gray-900 p-2">
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none text-nowrap break-keep overflow-hidden "
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <ColumnFilter column={header.column} />
                        ) : null}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border p-1"
                    style={{
                      backgroundColor: getCellColor(cell),
                      color: getCellColor(cell)
                        ? getContrastColor(getCellColor(cell)!).toString()
                        : undefined,
                    }}
                    title={`value: ${cell.getValue() ?? "none"}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页控制 */}
      <div className="flex items-center gap-2 mt-4">
        <button
          className="border p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
}

const n_fixed = (n: number, t = 2) => {
  return Number(n.toFixed(t));
};

function dataPrepare(data: Record<string, any>) {
  const { size, model, quantization, ...others } = data;

  // 计算 每个b的分数
  const pbs = Object.entries(others)
    .map(([k, v]) => {
      if (typeof v !== "number") {
        return null;
      }
      if (size <= 0) {
        return [`pb-${k}`, 0];
      }
      return [`pb-${k}`, v / size];
    })
    .filter(Boolean) as any[];
  // 计算 量化分数，如果有量化的话
  const unquants = quantization
    ? (Object.entries(others)
        .map(([k, v]) => {
          if (typeof v !== "number") {
            return null;
          }
          return [`un-${k}`, unquant(v, quantization)];
        })
        .filter(Boolean) as any[])
    : [];

  const o1 = {
    model,
    size,
    quantization,
    ...others,
    ...Object.fromEntries(pbs),
    // ...Object.fromEntries(unquants),
  };

  for (const [k, v] of Object.entries(o1)) {
    if (typeof v !== "number") {
      continue;
    }
    o1[k] = n_fixed(v);
  }

  return o1;
}

function header_key_fix<T>(items: T[]) {
  let header_keys = items.map((x) => Object.keys(x)).flat();
  header_keys = [...new Set(header_keys)];

  for (const item of items) {
    for (const k of header_keys) {
      if (k in (item as any)) continue;
      item[k] = null;
    }
  }

  return items;
}

const datasets = [
  {
    name: "LenML-eval",
    data: evalData,
  },
  {
    name: "open-llm-leaderboard-241122",
    data: ollData,
  },
] as {
  name: string;
  data: Record<string, any>[];
}[];

// 使用示例
const ExamplePage = () => {
  // const data = evalData.map((x) => ({
  //   ...x,
  //   // 每个b的得分
  //   "pblh-eval(~)": n_fixed(x["lh-eval"] / x.size),
  //   "pblr-eval(~)": n_fixed(x["lr-eval"] / x.size),
  //   "un-lh-eval(~)": n_fixed(unquant(x["lh-eval"], x.quantization)),
  //   "un-lr-eval(~)": n_fixed(unquant(x["lr-eval"], x.quantization)),
  //   "un-pblh-eval(~)": n_fixed(unquant(x["lh-eval"], x.quantization) / x.size),
  //   "un-pblr-eval(~)": n_fixed(unquant(x["lr-eval"], x.quantization) / x.size),
  // }));
  const [_data, setData] = useState<any[]>(datasets[0].data);
  const data = useMemo(() => header_key_fix(_data.map(dataPrepare)), [_data]);
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <header className="bg-slate-600 flex gap-2 px-2">
        <span>🥇</span>
        <h1>LenML Leaderboard</h1>
        <Dropdown
          defaultValue={datasets[0].name}
          label="select leaderboard"
          items={datasets.map((d) => ({
            label: d.name,
            value: d.name,
            onClick: () => {
              setData(d.data);
            },
          }))}
        ></Dropdown>
        <div style={{ flex: 1 }}></div>
        <a
          href="https://github.com/lenML/lenml-leaderboard"
          target="_blank"
          rel="noreferrer"
          className="text-slate-200 hover:bg-slate-300 hover:text-slate-900 transition-colors flex px-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="23"
            height="23"
            viewBox="0 0 30 30"
            color="currentColor"
          >
            <path
              fill="currentColor"
              d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"
            ></path>
          </svg>
          github
        </a>
      </header>
      <EnhancedTable data={data} />
    </div>
  );
};

export default ExamplePage;
