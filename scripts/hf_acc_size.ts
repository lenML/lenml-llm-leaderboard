/**
 * 这个脚本用于修复 open llm leaderboard 数据中的模型参数，获取更加准确的数值
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch-with-proxy";

// 定义模型数据结构
interface ModelData {
  model: string;
  average: number;
  size: number;
  IFEval?: number;
  BBH?: number;
  "MATH Lvl 5"?: number;
  GPQA?: number;
  MUSR?: number;
  "MMLU-PRO"?: number;
}

// 整数 b => 带小数的b
const size_map_cache = {} as Record<number, number>;

async function fetchAccurateParams(repoId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://huggingface.co/api/models/${repoId}`,
      {
        method: "GET",
        headers: {},
      }
    );
    if (!response.ok) {
      console.error(`Failed to fetch model ${repoId}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data?.safetensors?.total || null;
  } catch (error) {
    console.error(`Error fetching model ${repoId}:`, error);
    return null;
  }
}

async function updateModelData(models: ModelData[]): Promise<ModelData[]> {
  const updatedModels = [] as any[];
  let count = 0;
  for (const model of models) {
    count += 1;
    const accurateParams = await fetchAccurateParams(model.model);
    let next_size =
      accurateParams !== null
        ? // 转为 B 为单位
          accurateParams / 1000 / 1000 / 1000
        : // 如果未获取到，则保留原值
          model.size;

    // 抓到就缓存到 cache
    if (accurateParams !== null) {
      size_map_cache[model.size] = next_size;
    } else if (size_map_cache[model.size]) {
      // 如果没抓到那就用缓存的 mapping
      next_size = size_map_cache[model.size] ?? model.size;
    }
    updatedModels.push({
      ...model,
      size: next_size,
    });
    console.log(
      `${count}/${models.length} ${model.model} ${model.size}B => ${next_size}B`
    );
    await new Promise((resolve) => setTimeout(resolve, 500 * Math.random()));
  }

  return updatedModels;
}

(async () => {
  const [input_file, output_file] = process.argv.slice(2);
  if (!input_file || !output_file) {
    console.error("Usage: node hf_acc_size.ts <input_file> <output_file>");
    process.exit(1);
  }
  const modelData = JSON.parse(fs.readFileSync(input_file, "utf8"));

  const updatedData = await updateModelData(modelData);
  fs.writeFileSync(output_file, JSON.stringify(updatedData, null, 2), "utf8");
})().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
