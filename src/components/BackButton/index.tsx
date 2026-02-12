import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="group flex items-center rounded-xl text-slate-500 hover:text-indigo-600 transition-all duration-200"
    >
      <div className="ml-1 p-1.5 rounded-lg bg-slate-200 hover:bg-slate-100 cursor-pointer  transition-colors">
        <ChevronLeft
          size={22}
          className=" transition-transform"
        />
      </div>
    </button>
  );
};
