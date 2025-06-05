import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "../../css/SearchableDropdown.css";

export default function SearchableDropdown({
    data,
    value,
    setValue,
    placeholder,
    disabled = false,
    warning = false,
    getOptionLabel = (item) => (item && item.DESKRIPSI ? item.DESKRIPSI : ""),
    getOptionValue = (item) => (item && item.ID ? item.ID : ""),
    autoFocus = false,
    onSearch, // Tambahkan properti onSearch
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlighted, setHighlighted] = useState(0);
    const ref = useRef(null);

    const filtered = data.filter((item) =>
        item &&
        (!search
            ? true
            : getOptionLabel(item)?.toLowerCase().includes(search.toLowerCase()))
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

    const handleSearchChange = (e) => {
        const keyword = e.target.value;
        setSearch(keyword);

        // Jangan setValue("") di sini!
        // setValue("");

        if (onSearch) {
            onSearch(keyword);
        }

        setOpen(true);
    };

    return (
        <div className="relative searchable-dropdown" ref={ref}>
            <div
                className={`flex items-center border rounded-lg px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-gray-400 transition
                    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                    ${warning ? "border-red-500" : "border-gray-300"}
                `}
            >
                <input
                    className="flex-1 outline-none bg-transparent py-1 px-0 text-sm text-gray-700 placeholder-gray-400"
                    placeholder={placeholder}
                    value={
                        open
                            ? search
                            : (
                                value
                                    ? (
                                        getOptionLabel(
                                            data.find((item) =>
                                                getOptionValue(item).toString() === value
                                            )
                                        ) || ""
                                    )
                                    : ""
                            )
                    }
                    onFocus={() => !disabled && setOpen(true)}
                    onChange={handleSearchChange}
                    onKeyDown={disabled ? undefined : handleKeyDown}
                    autoComplete="off"
                    disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    autoFocus={autoFocus}
                />
                <button
                    type="button"
                    className="chevron-button"
                    tabIndex={-1}
                    onClick={() => !disabled && setOpen((v) => !v)}
                    disabled={disabled}
                >
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                            open ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>
            {open && !disabled && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                    {filtered.length === 0 ? (
                        <div className="p-3 text-gray-400 text-sm text-center">
                            Tidak ditemukan hasil untuk "<span className="font-semibold">{search}</span>"
                        </div>
                    ) : (
                        filtered.map((item, idx) => (
                            <div
                                key={getOptionValue(item)}
                                className={`px-4 py-2 cursor-pointer transition truncate ${
                                    idx === highlighted
                                        ? "bg-gray-200 text-gray-900"
                                        : "hover:bg-gray-100 hover:text-gray-700"
                                }`}
                                onMouseDown={() => {
                                    setValue(getOptionValue(item).toString());
                                    setSearch("");
                                    setOpen(false);
                                }}
                                onMouseEnter={() => setHighlighted(idx)}
                            >
                                {getOptionLabel(item)}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
