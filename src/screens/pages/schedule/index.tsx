import { Button, Card } from "@heroui/react";
import { cn } from "../../../utils/helper";
import { ChevronRight, User } from "lucide-react";

const leaves = [
  {
    name: "John Doe",
    duration: "Nov 01 - Nov 03",
    days: "3 Days",
    status: "Approved",
  },
  {
    name: "Mike Ross",
    duration: "Nov 05 - Nov 05",
    days: "1 Day",
    status: "Pending",
  },
  {
    name: "Harvey Specter",
    duration: "Nov 07 - Nov 08",
    days: "2 Days",
    status: "Approved",
  },
];

const Schedule = () => {
  return (
    <div className="col-span-12 lg:col-span-3">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-semibold text-slate-500">Leaves Request</h2>
        <Button
          size="sm"
          // onPress={() => navigate("/request/leave-approve")}
          className="flex items-center pr-0 gap-1 text-indigo-500 font-semibold rounded-lg text-xs hover:underline hover:text-indigo-600 cursor-pointer duration-200"
        >
          View All <ChevronRight size={16} />
        </Button>
      </div>

      <div className="bg-slate-100/50 p-3 rounded-3xl border border-white space-y-2 shadow-inner">
        {leaves.map((leave, idx) => (
          <Card
            isPressable
            key={idx}
            className="bg-white p-3 rounded-2xl border border-slate-200/60 hover:border-indigo-400 hover:shadow-md transition-all w-full"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shadow-sm">
                  <User size={18} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 leading-tight">
                    {leave.name}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500">
                    {leave.duration} •{" "}
                    <span className="text-indigo-600">{leave.days}</span>
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold capitalize tracking-wider shadow-sm",
                  leave.status === "Approved"
                    ? "bg-green-50 text-green-600"
                    : "bg-orange-50 text-orange-400",
                )}
              >
                {leave.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Schedule;
