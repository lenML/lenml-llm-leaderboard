import chroma from "chroma-js";

/**
 * 根据数值 n 以及范围，计算出对应的颜色
 * @param n - 当前值
 * @param min - 最小值
 * @param max - 最大值
 * @param minColor - 最小值对应的颜色（支持 CSS 颜色字符串）
 * @param maxColor - 最大值对应的颜色（支持 CSS 颜色字符串）
 * @returns 计算出的颜色（HEX 格式）
 */
export function calculateColor(
  n: number,
  min: number,
  max: number,
  minColor: string,
  maxColor: string
): string {
  // 防止 n 超出范围
  const clampedN = Math.max(min, Math.min(max, n));
  // 归一化 n
  const t = (clampedN - min) / (max - min);
  // 使用 chroma 插值计算颜色
  return chroma.mix(minColor, maxColor, t).hex();
}

/**
 * 获取反色（补色）
 * @param color - 输入颜色（支持 CSS 颜色格式）
 * @returns 反色（HEX 格式）
 */
export function getComplementaryColor(color: string): string {
  // 将颜色转换为 HSL
  const hsl = chroma(color).hsl();
  // 色相取反（+180°，用取模确保在 [0, 360] 范围内）
  const complementaryHue = (hsl[0] + 180) % 360;
  // 返回新的颜色
  return chroma.hsl(complementaryHue, hsl[1], hsl[2]).hex();
}

/**
 * 根据背景色计算最佳前景色（黑色或白色）
 * @param backgroundColor 背景颜色（支持各种颜色格式）
 * @param darkColor 深色前景色（默认黑色）
 * @param lightColor 浅色前景色（默认白色）
 * @param threshold 对比度阈值（默认4.5，满足WCAG 2.0标准）
 * @returns 最佳前景色
 */
export function getContrastColor(
  backgroundColor: string,
  darkColor: string = "#000000",
  lightColor: string = "#FFFFFF",
  threshold: number = 4.5
): string {
  try {
    // 将背景色转换为 chroma 对象
    const bgColor = chroma(backgroundColor);

    // 计算背景色的亮度
    const luminance = bgColor.luminance();

    // 计算深色和浅色前景色与背景色的对比度
    const darkContrast = chroma.contrast(bgColor, darkColor);
    const lightContrast = chroma.contrast(bgColor, lightColor);

    // 根据对比度选择最佳前景色
    return darkContrast >= threshold ? darkColor : lightColor;
  } catch (error) {
    console.error("Error calculating contrast color:", error);
    return "#000000"; // 默认返回黑色
  }
}
