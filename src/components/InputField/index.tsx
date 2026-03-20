import React from "react";
import { cn } from "../../utils/helper";

interface FormInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label: string;
  startContent?: React.ReactNode;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelPlacement?: "inside" | "outside" | "outside-left";
  variant?: string;
  required?: boolean;
  classNames?: {
    base?: string;
    label?: string;
    inputWrapper?: string;
    input?: string;
  };
}

export const FormInput = ({
  label,
  startContent,
  onValueChange,
  onChange,
  classNames,
  required = false,
  ...props
}: FormInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <div className={cn("flex flex-col gap-1.5 h-fit w-full", classNames?.base)}>
      <label
        className={cn(
          "text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 block",
          classNames?.label,
        )}
      >
        {label}
        {required && <span className="text-rose-500 text-sm mx-1">*</span>}
      </label>

      <div
        className={cn(
          "relative flex items-center w-full h-12 px-4 shadow bg-slate-50 border border-slate-100/60 rounded-lg transition-all duration-200 group focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10",
          classNames?.inputWrapper,
        )}
      >
        {startContent && (
          <div className="mr-3 flex items-center justify-center pointer-events-none text-indigo-500">
            {startContent}
          </div>
        )}

        <input
          {...props}
          onChange={handleChange}
          className={cn(
            "w-full h-full bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-normal outline-none border-none p-0",
            classNames?.input,
            props.className,
          )}
        />
      </div>
    </div>
  );
};
