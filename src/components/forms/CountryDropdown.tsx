import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react";
import { COUNTRIES } from "@/lib/constants/countries";

interface CountryDropdownProps {
  value: string;
  onChange: (country: string) => void;
  disabled?: boolean;
}

export function CountryDropdown({ value, onChange, disabled }: CountryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>(COUNTRIES);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // filter list whenever value changes
    const text = value.toLowerCase();
    setFiltered(
      COUNTRIES.filter((c) => c.toLowerCase().includes(text))
    );
    setActiveIndex(-1);
  }, [value]);

  // close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => Math.min(idx + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const selection = filtered[activeIndex];
      onChange(selection);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleSelect = (country: string) => {
    onChange(country);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!disabled) setOpen(true);
        }}
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Select or type country"
        disabled={disabled}
        className="pr-10" // space for dropdown arrow/button
      />
      {/* chevron button, clickable to toggle list */}
      <button
        type="button"
        disabled={disabled}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <ChevronDownIcon
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {filtered.map((c, i) => (
            <li
              key={c}
              className={`cursor-pointer px-3 py-2 text-sm flex items-center justify-between ${
                i === activeIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onMouseDown={(e) => {
                // prevent blur before click
                e.preventDefault();
              }}
              onClick={() => handleSelect(c)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
