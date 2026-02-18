import { useEffect } from "react";
import { hourglass } from "ldrs";

interface TransportLoaderProps {
  size?: number | string;
  color?: string;
  speed?: string | number;
  bgOpacity?: string | number;
}

export const TransportLoader = ({
  size = 80,
  color = "#4f46e5",
  speed = "1.75",
  bgOpacity = "0.1",
}: TransportLoaderProps) => {
  useEffect(() => {
    hourglass.register();
  }, []);

  return (
    <div className="flex flex-col gap-3 items-center justify-center w-full h-full">
      <l-hourglass
        size={size}
        bg-opacity={bgOpacity}
        speed={speed}
        color={color}
      />
      <span className="text-slate-500 text-sm font-semibold ml-2">
        Loading...
      </span>
    </div>
  );
};
