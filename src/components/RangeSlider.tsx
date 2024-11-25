import React, { useState } from "react";

export const RangeSlider = ({
  defaultValue = [0, 100],
  onChange,
}: {
  defaultValue: [number, number];
  onChange?: (value: [number, number]) => void;
}) => {
  const [modelSizeRange, setModelSizeRange] = useState(defaultValue);
  const [initialRange] = useState(defaultValue); // 初始值

  const applyChanges = () => {
    console.log("Applied range:", modelSizeRange);

    onChange?.(modelSizeRange);
  };

  const resetRange = () => {
    setModelSizeRange(initialRange);
    onChange?.(initialRange);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 rounded shadow-md max-w-sm">
      <div className="flex flex-col w-full">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            className="w-full"
            min={0}
            max={500}
            value={modelSizeRange[0]}
            onChange={(e) =>
              setModelSizeRange([Number(e.target.value), modelSizeRange[1]])
            }
          />
          <span className="text-sm font-medium">{modelSizeRange[0]}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="range"
            className="w-full"
            min={0}
            max={500}
            value={modelSizeRange[1]}
            onChange={(e) =>
              setModelSizeRange([modelSizeRange[0], Number(e.target.value)])
            }
          />
          <span className="text-sm font-medium">{modelSizeRange[1]}</span>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition"
          onClick={applyChanges}
        >
          Apply
        </button>
        <button
          className="bg-gray-500 text-white py-1 px-4 rounded hover:bg-gray-600 transition"
          onClick={resetRange}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
