import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";

export const CountrySelector = ({ selectedCode, onSelect }: any) => {
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((c: any) => ({
            name: c.name.common,
            flag: c.flags.png,
            code: c.idd.root + (c.idd.suffixes?.[0] || ""),
          }))
          .filter((c: any) => c.code);
        setCountries(
          formatted.sort((a: any, b: any) => a.name.localeCompare(b.name)),
        );
      });
  }, []);

  const filtered = countries.filter(
    (c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search),
  );

  const selectedCountry: any = countries.find(
    (c: any) => c.code === selectedCode,
  );

  return (
    <div className="relative col-span-4 cursor-pointer">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full bg-transparent font-bold text-sm outline-none pt-1 cursor-pointer"
      >
        {selectedCountry ? (
          <>
            <img
              src={selectedCountry.flag}
              className="w-4 h-3 object-cover rounded-sm"
            />
            <span>{selectedCountry.code}</span>
          </>
        ) : (
          <span className="text-slate-400">+91</span>
        )}
        <ChevronDown size={14} className="ml-auto text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full left-0 mt-2 w-64 h-32 bg-white shadow-xl rounded-2xl border-2 border-indigo-500 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b border-slate-50 flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <input
              autoFocus
              className="w-full text-sm outline-none"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filtered.map((c: any, i) => (
              <div
                key={i}
                onClick={() => {
                  onSelect(c.code);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <img
                  src={c.flag}
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm font-medium text-slate-700">
                  {c.code}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
