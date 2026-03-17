export const NoDataFound = ({
  data = "No Results Found",
}: {
  data?: string | React.ReactNode;
}) => {
  return (
    <div className="flex flex-1 items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 h-full">
      <h3 className="text-xl font-bold text-slate-800 mb-2">{data}</h3>
    </div>
  );
};
