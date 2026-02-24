export const pickerStyles = {
  label: "text-[10px] font-bold text-indigo-600 uppercase ml-1",
  inputWrapper:
    "bg-slate-50 !bg-opacity-100 border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 transition-all focus:ring focus:ring-indigo-600",
  popoverContent: "bg-white border border-slate-200 shadow-xl rounded-xl",
  calendar: "bg-red-500",
  errorMessage:
    "text-rose-500 text-[10px] font-medium mt-1 bg-rose-50 px-2 py-1 rounded-md border border-rose-100",
  helperText: "text-slate-400 text-[10px]",
  input: "text-slate-800 font-medium",
};

export const selectorStyles = {
  base: "w-full",
  trigger: [
    "bg-slate-50 border-1.5 border-slate-200 rounded-2xl transition-all shadow-sm ",
    " data-[focused=true]:bg-white data-[focused=true]:border-indigo-500 data-[focused=true]:ring-4",
    "data-[focused=true]:ring-indigo-50 hover:bg-slate-100 hover:border-indigo-300",
  ],
  value: "text-slate-700 font-bold text-sm ml-1",
  placeholder: "text-slate-400 font-medium text-sm ml-1",
  popoverContent: [
    "bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow rounded-[24px] p-2",
  ],
  listbox: "gap-1",
  selectorIcon: "text-indigo-500 w-5 h-5",
};
