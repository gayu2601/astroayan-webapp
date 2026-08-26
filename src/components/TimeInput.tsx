import { useRef, useEffect, useState } from "react";

const TimeInput = ({ value, onChange, className = "" }) => {
  const [parts, setParts] = useState({ hh: "", mm: "", ampm: "AM" });
  const hhRef = useRef(null);
  const mmRef = useRef(null);
  const ampmRef = useRef(null);
  
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      const parsedH = parseInt(h);
      if (!isNaN(parsedH)) {
        const ampm = parsedH >= 12 ? 'PM' : 'AM';
        let hours = parsedH > 12 ? parsedH - 12 : parsedH;
        if (hours === 0) hours = 12;
        setParts({ hh: String(hours).padStart(2, '0'), mm: m || '', ampm });
      }
    } else if (!value) {
      setParts({ hh: '', mm: '', ampm: 'AM' });
    }
  }, [value]);

  const fireChange = (updated: { hh: string; mm: string; ampm: string }) => {
    const { hh, mm, ampm } = updated;
    if (hh.length === 2 && mm.length === 2) {
      let hours = parseInt(hh);
      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      const h = String(hours).padStart(2, "0");
      onChange({ target: { value: `${h}:${mm}` } });
    } else {
      onChange({ target: { value: "" } });
    }
  };

  const handleChange = (field: string, val: string, nextRef: any, maxLen: number) => {
	  const digits = val.replace(/\D/g, "").slice(0, maxLen);
	  
	  setParts(prev => {
		const updated = { ...prev, [field]: digits };

		// Auto-advance
		if (digits.length === maxLen && nextRef) {
		  nextRef.current?.focus();
		}

		// Fire onChange when complete
		fireChange(updated);

		return updated;
	  });
	};

  const handleKeyDown = (e, prevRef) => {
    if (e.key === "Backspace" && e.target.value === "" && prevRef) {
      prevRef.current?.focus();
    }
  };

  // Pad a lone digit with a leading zero once the user leaves the field,
  // e.g. typing "2" into HH becomes "02" on blur.
  const handleBlur = (field: "hh" | "mm") => {
    setParts((prev) => {
      const val = prev[field];
      if (val.length === 0 || val.length === 2) return prev;
      const padded = val.padStart(2, "0");
      const updated = { ...prev, [field]: padded };
      fireChange(updated);
      return updated;
    });
  };

  const toggleAmPm = () => {
    const newAmPm = parts.ampm === "AM" ? "PM" : "AM";
    const updated = { ...parts, ampm: newAmPm };
    setParts(updated);
    fireChange(updated);
  };

  const baseClass = "bg-transparent outline-none border-none text-sm text-center";

  return (
    <div className={`w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 flex items-center gap-0.5 transition-all focus-within:border-violet-500 ${className}`}>
      <input
        ref={hhRef}
        type="text"
        inputMode="numeric"
        placeholder="HH"
        maxLength={2}
        value={parts.hh}
        onChange={(e) => handleChange("hh", e.target.value, mmRef, 2)}
        onKeyDown={(e) => handleKeyDown(e, null)}
        onBlur={() => handleBlur("hh")}
        className={`${baseClass} w-7 text-gray-900 dark:text-white placeholder:text-gray-400`}
        style={{ border: "none" }}
      />
      <span className="select-none text-gray-400 dark:text-gray-500">:</span>
      <input
        ref={mmRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        value={parts.mm}
        onChange={(e) => handleChange("mm", e.target.value, ampmRef, 2)}
        onKeyDown={(e) => handleKeyDown(e, hhRef)}
        onBlur={() => handleBlur("mm")}
        className={`${baseClass} w-7 text-gray-900 dark:text-white placeholder:text-gray-400`}
        style={{ border: "none" }}
      />
      <button
        ref={ampmRef}
        type="button"
        onClick={toggleAmPm}
        className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
      >
        {parts.ampm}
      </button>
    </div>
  );
};

export default TimeInput;