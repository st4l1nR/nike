import React from "react";
import type {UseFormRegisterReturn} from "react-hook-form";

type props = React.HTMLProps<HTMLInputElement> & UseFormRegisterReturn & {
  label?: string;
  error?: string;
};

const index = React.forwardRef(
  ({ error, label, ...props }: props, ref: any) => {
    return (
      <div className="flex flex-col space-y-2">
        <span className="text-md">{label}</span>
        <input
          className={`w-full h-12 border ${
            error
              ? "border-red-500 focus:border-red-500 placeholder:border-red-500 focus:ring-red-500"
              : "border-gray-400 placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400"
          }`}
          type="text"
          ref={ref}
          {...props}
        />
        <span className="text-sm text-red-500 ">{error}</span>
      </div>
    )
  }
);

export default index;
