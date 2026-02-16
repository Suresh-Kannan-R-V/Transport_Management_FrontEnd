import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const AddressSearchInput = ({
  value,
  onChange,
  placeholder,
  onSelect,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  onSelect: (address: string, lat: number, lon: number) => void;
}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    onChange(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setShowPopup(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <input
        className="bg-transparent w-full font-semibold outline-none text-sm"
        value={value}
        onChange={(e) => searchAddress(e.target.value)}
        onFocus={() => value.length >= 3 && setShowPopup(true)}
        placeholder={placeholder}
      />

      {showPopup && (results.length > 0 || loading) && (
        <div className="absolute z-[1000] top-full left-0 w-full mt-2 bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden">
          {loading && (
            <div className="p-3 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="animate-spin" size={14} /> Searching...
            </div>
          )}
          {results.map((res: any) => (
            <button
              key={res.place_id}
              onClick={() => {
                onSelect(
                  res.display_name,
                  parseFloat(res.lat),
                  parseFloat(res.lon),
                );
                setShowPopup(false);
              }}
              className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex gap-3 items-start"
            >
              <MapPin className="text-indigo-500 mt-1 shrink-0" size={14} />
              <span className="text-xs text-slate-700 truncate">
                {res.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
