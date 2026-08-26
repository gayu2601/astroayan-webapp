import { useRef, useEffect, useState } from "react";

const DateInput = ({ value, onChange, required }) => {
  const [parts, setParts] = useState({ dd: "", mm: "", yyyy: "" });
  const ddRef = useRef(null);
  const mmRef = useRef(null);
  const yyyyRef = useRef(null);

  useEffect(() => {
    if (value && value.includes('-')) {
      const [yyyy, mm, dd] = value.split('-');
      if (yyyy && mm && dd) setParts({ dd, mm, yyyy });
    } else if (!value) {
      setParts({ dd: '', mm: '', yyyy: '' });
    }
  }, [value]);

  const fireChange = (updated) => {
    const { dd, mm, yyyy } = updated;
    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
      onChange({ target: { value: `${yyyy}-${mm}-${dd}` } });
    } else {
      onChange({ target: { value: "" } });
    }
  };

  const handleChange = (field, val, nextRef, maxLen, max) => {
    // Only allow digits
    const digits = val.replace(/\D/g, "").slice(0, maxLen);
    const updated = { ...parts, [field]: digits };
    setParts(updated);

    // Auto-advance when field is full
    if (digits.length === maxLen && nextRef) {
      nextRef.current?.focus();
      nextRef.current?.select();
    }

    // Fire parent onChange with yyyy-mm-dd (HTML date format) when complete
    fireChange(updated);
  };

  const handleKeyDown = (e, field, prevRef) => {
    if (e.key === "Backspace" && e.target.value === "" && prevRef) {
      prevRef.current?.focus();
    }
  };

  // Pad a lone digit with a leading zero once the user leaves the field,
  // e.g. typing "2" into DD becomes "02" on blur.
  const handleBlur = (field, maxLen) => {
    setParts((prev) => {
      const val = prev[field];
      if (val.length === 0 || val.length === maxLen) return prev;
      const padded = val.padStart(maxLen, "0");
      const updated = { ...prev, [field]: padded };
      fireChange(updated);
      return updated;
    });
  };

  const baseClass =
    "bg-transparent outline-none text-gray-900 dark:text-white text-sm text-center";

  return (
    <div className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/30 rounded-lg pl-9 pr-4 py-2.5 flex items-center gap-0.5 transition-all">
      <input
        ref={ddRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        maxLength={2}
        value={parts.dd}
        required={required}
        onChange={(e) => handleChange("dd", e.target.value, mmRef, 2, 31)}
        onKeyDown={(e) => handleKeyDown(e, "dd", null)}
        onBlur={() => handleBlur("dd", 2)}
        className={`${baseClass} w-7`}
      />
      <span className="text-gray-400 dark:text-gray-500 select-none">-</span>
      <input
        ref={mmRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        value={parts.mm}
        onChange={(e) => handleChange("mm", e.target.value, yyyyRef, 2, 12)}
        onKeyDown={(e) => handleKeyDown(e, "mm", ddRef)}
        onBlur={() => handleBlur("mm", 2)}
        className={`${baseClass} w-7`}
      />
      <span className="text-gray-400 dark:text-gray-500 select-none">-</span>
      <input
        ref={yyyyRef}
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        maxLength={4}
        value={parts.yyyy}
        onChange={(e) => handleChange("yyyy", e.target.value, null, 4, 9999)}
        onKeyDown={(e) => handleKeyDown(e, "yyyy", mmRef)}
        className={`${baseClass} w-10`}
      />
    </div>
  );
};

export default DateInput;