const quant_map = {
  Q1: {
    IQ1_S: {
      bits: 1.78,
      performance_ratio: 0.076,
    },
  },
  Q2: {
    IQ2_XXS: {
      bits: 2.2,
      performance_ratio: 0.299,
    },
    IQ2_XS: {
      bits: 2.43,
      performance_ratio: 0.4,
    },
    IQ2_S: {
      bits: 2.55,
      performance_ratio: 0.43,
    },
    IQ2_M: {
      bits: 2.76,
      performance_ratio: 0.47,
    },
  },
  Q3: {
    IQ3_XXS: {
      bits: 3.21,
      performance_ratio: 0.59,
    },
    IQ3_XS: {
      bits: 3.32,
      performance_ratio: 0.61,
    },
    IQ3_S: {
      bits: 3.52,
      performance_ratio: 0.67,
    },
    IQ3_M: {
      bits: 3.63,
      performance_ratio: 0.69,
    },
  },
  Q4: {
    IQ4_XS: {
      bits: 4.32,
      performance_ratio: 0.79,
    },
    IQ4_NL: {
      bits: 4.56,
      performance_ratio: 0.8,
    },
    Q4_K_S: {
      bits: 4.57,
      performance_ratio: 0.8,
    },
    Q4_K_M: {
      bits: 4.83,
      performance_ratio: 0.82,
    },
  },
  Q5: {
    Q5_K_S: {
      bits: 5.52,
      performance_ratio: 0.995,
    },
    Q5_K_M: {
      bits: 5.67,
      performance_ratio: 0.9999,
    },
  },
  Q6: {
    Q6_K: {
      bits: 6.57,
      performance_ratio: 1.0,
    },
  },
  Q8: {
    Q8_0: {
      bits: 8.0,
      performance_ratio: 1.0,
    },
  },
  F16: {
    F16: {
      bits: 16.0,
      performance_ratio: 1.0,
    },
  },
  F32: {
    F32: {
      bits: 32.0,
      performance_ratio: 1.0,
    },
  },
} as const;

// 就是简单的根据映射表估算出一个大概的原始分数
// n = 15 quant = "q3_k_m"
// 如果在 map 中找不到，则根据大分类，比如 q3 下面的平均值来作为 ratio 缩放
export const unquant = (n: number, quant: string) => {
  if (quant.toLowerCase().includes("f16")) {
    return n;
  }
  if (quant.toLowerCase().includes("f32")) {
    return n;
  }

  // 转换为小写并移除可能的下划线
  const normalizedQuant = quant.toLowerCase().replace(/_/g, "");

  // 解析量化等级和具体类型
  const quantLevel = normalizedQuant.match(/^i?(q\d+)/)?.[1];
  if (!quantLevel) {
    return n;
  }

  // 首先尝试精确匹配
  const exactMatch =
    quant_map[quantLevel.toUpperCase()]?.[normalizedQuant.toUpperCase()];
  if (exactMatch) {
    return n / exactMatch.performance_ratio;
  }

  // 如果没有精确匹配，则使用该级别的平均值
  const levelQuants = quant_map[quantLevel.toUpperCase()] as
    | (typeof quant_map)[keyof typeof quant_map]
    | undefined;
  if (levelQuants) {
    const ratios = Object.values(levelQuants).map((q) => q.performance_ratio);
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    return n / avgRatio;
  }

  // 如果完全找不到，则返回原值
  return n;
};
