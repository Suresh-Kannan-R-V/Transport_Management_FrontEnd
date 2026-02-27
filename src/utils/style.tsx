export const pickerStyles = {
  label: "text-[10px] font-bold text-indigo-600 uppercase ml-1",
  inputWrapper:
    "bg-slate-50 !bg-opacity-100 border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 transition-all focus:ring focus:ring-indigo-600",
  popoverContent: "bg-white border border-slate-200 shadow-xl rounded-xl",
  calendar: "bg-white",
  errorMessage:
    "text-rose-500 text-[10px] font-medium mt-1 bg-rose-50 px-2 py-1 rounded-md border border-rose-100",
  helperText: "text-slate-400 text-[10px]",
  input: "text-slate-800 font-medium",
};

export const DateRangePickerStyles = {
  label:
    "text-[11px] font-extrabold text-slate-500 uppercase tracking-wider ml-1 mb-1",
  inputWrapper: [
    "bg-white border-2 border-white rounded-2xl shadow transition-all duration-200 hover:border-indigo-400",
    "hover:bg-slate-50/50 group-data-[focus=true]:border-indigo-500 group-data-[focus=true]:ring-4",
    "group-data-[focus=true]:ring-indigo-500/10 !bg-opacity-100 min-h-[52px]",
  ],
  input: "text-slate-700 font-bold text-sm p-0",
  segment: [
    "text-slate-700 font-bold data-[placeholder=true]:text-slate-400 ",
    "data-[placeholder=true]:font-medium focus:bg-indigo-100 focus:text-indigo-700 rounded-md px-0.5",
  ],
  popoverContent:
    "bg-white border border-slate-200 shadow-md rounded-[24px] p-2",

  calendar: "bg-white",
  errorMessage:
    "text-rose-500 text-[10px] font-bold mt-1 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm",
  helperText: "text-slate-400 text-[10px] font-medium ml-1",
};

export const selectorStyles = {
  base: "w-full",
  trigger: [
    " h-[52px] border-2 border-white rounded-2xl transition-all shadow-sm ",
    " data-[focused=true]:bg-white data-[focused=true]:border-indigo-500 data-[focused=true]:ring-4",
    "data-[focused=true]:ring-indigo-50 hover:bg-slate-50 hover:border-indigo-500",
  ],
  value: "text-slate-700 font-bold text-sm ml-1",
  placeholder: "text-slate-400 font-medium text-sm ml-1",
  popoverContent: [
    "bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow rounded-[24px] p-2",
  ],
  listbox: "gap-1",
  selectorIcon: "text-indigo-500 w-5 h-5",
};
