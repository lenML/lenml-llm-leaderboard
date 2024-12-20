import React, { useState } from "react";

const NumInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        className="w-10 border border-gray-300 rounded"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

export const RangeSlider = ({
  defaultValue = [0, 100],
  onChange,
  min = 0,
  max = 500,
}: {
  defaultValue: [number, number];
  onChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
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
            min={min}
            max={max}
            value={modelSizeRange[0]}
            onChange={(e) =>
              setModelSizeRange([Number(e.target.value), modelSizeRange[1]])
            }
          />
          <span className="text-sm font-medium">
            <NumInput
              value={modelSizeRange[0]}
              onChange={(value) =>
                setModelSizeRange([value, modelSizeRange[1]])
              }
            />
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="range"
            className="w-full"
            min={min}
            max={max}
            value={modelSizeRange[1]}
            onChange={(e) =>
              setModelSizeRange([modelSizeRange[0], Number(e.target.value)])
            }
          />
          <span className="text-sm font-medium">
            <NumInput
              value={modelSizeRange[1]}
              onChange={(value) =>
                setModelSizeRange([modelSizeRange[0], value])
              }
            />
          </span>
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
