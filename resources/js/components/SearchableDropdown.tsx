import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function SearchableDropdown({ data, value, setValue, placeholder }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlighted, setHighlighted] = useState(0);
    const ref = useRef(null);

    const filtered = data.filter(item =>
        !search
            ? true
            : item.DESKRIPSI &&
            item.DESKRIPSI.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setHighlighted(0);
    }, [search, open]);

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((prev) => (prev + 1 < filtered.length ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[highlighted]) {
                setValue(filtered[highlighted].ID.toString());
                setSearch("");
                setOpen(false);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 bg-gray-50 focus-within:ring-2 focus-within:ring-gray-400 transition">
                <input
                    className="flex-1 outline-none bg-transparent py-1 px-0 text-sm text-gray-700 placeholder-gray-400"
                    placeholder={placeholder}
                    value={
                        value
                            ? data.find(item => item.ID.toString() === value)?.DESKRIPSI
                            : search
                    }
                    onFocus={() => setOpen(true)}
                    onChange={e => {
                        setSearch(e.target.value);
                        setValue("");
                        setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                    onClick={() => setOpen(v => !v)}
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            </div>
            {open && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                    {filtered.length === 0 ? (
                        <div className="p-3 text-gray-400 text-sm text-center">
                            Tidak ditemukan hasil untuk "<span className="font-semibold">{search}</span>"
                        </div>
                    ) : (
                        filtered.map((item, idx) => (
                            <div
                                key={item.ID}
                                className={`px-4 py-2 cursor-pointer transition truncate ${idx === highlighted
                                        ? "bg-gray-200 text-gray-900"
                                        : "hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                                onMouseDown={() => {
                                    setValue(item.ID.toString());
                                    setSearch("");
                                    setOpen(false);
                                }}
                                onMouseEnter={() => setHighlighted(idx)}
                            >
                                {item.DESKRIPSI}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
