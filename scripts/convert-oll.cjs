/**
 * 这个脚本用于转换 oll 榜单
 */

const fs = require("fs");

const [input_file, output_file] = process.argv.slice(2);

if (!input_file || !output_file) {
  console.error("Usage: node pt1.js <input_file> <output_file>");
  process.exit(1);
}

fs.readFile(input_file, "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read the file:", err);
    return;
  }

  let jsonData = JSON.parse(data);
  console.log(jsonData[0]);

  const cleanedData = jsonData.map((item) => ({
    model: item.fullname,
    average: item["Average ⬆️"],
    size: item["#Params (B)"],
    IFEval: item.IFEval,
    BBH: item.BBH,
    "MATH Lvl 5": item["MATH Lvl 5"],
    GPQA: item.GPQA,
    MUSR: item.MUSR,
    "MMLU-PRO": item["MMLU-PRO"],
  }));

  fs.writeFile(output_file, JSON.stringify(cleanedData, null, 2), (err) => {
    if (err) {
      console.error("Failed to write the file:", err);
      return;
    }

    console.log("File cleaned and saved successfully!");
  });
});
