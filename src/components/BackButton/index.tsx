import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/helper";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BackButton = ({ onClick, className }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "group flex items-center rounded-xl text-slate-500 hover:text-indigo-600 transition-all duration-200",
        className,
      )}
    >
      <div className="ml-1 p-1.5 rounded-lg bg-slate-200 hover:bg-slate-100 cursor-pointer  transition-colors">
        <ChevronLeft size={22} className=" transition-transform" />
      </div>
    </button>
  );
};
