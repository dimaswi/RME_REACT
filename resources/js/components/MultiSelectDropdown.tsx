// MultiSelectDropdown.tsx
import React, { useRef, useState } from 'react';

type MultiSelectDropdownProps = {
    data: any[];
    value: string[];
    setValue: (val: string[]) => void;
    getOptionLabel: (item: any) => string;
    getOptionValue: (item: any) => string;
    placeholder?: string;
};

export default function MultiSelectDropdown({
    data,
    value,
    setValue,
    getOptionLabel,
    getOptionValue,
    placeholder = "Pilih...",
}: MultiSelectDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Tutup dropdown jika klik di luar
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        if (!value.includes(optionValue)) {
            setValue([...value, optionValue]);
        }
    };

    const handleRemove = (optionValue: string) => {
        setValue(value.filter((v) => v !== optionValue));
    };

    return (
        <div className="relative" ref={ref}>
            {/* Input field with badges inside */}
            <div
                className="flex flex-wrap items-center min-h-[38px] border rounded px-2 py-1 bg-white cursor-pointer"
                onClick={() => setOpen((o) => !o)}
                tabIndex={0}
            >
                {value.length === 0 && (
                    <span className="text-gray-400">{placeholder}</span>
                )}
                {value.map((val) => {
                    const item = data.find((d) => getOptionValue(d) === val);
                    return (
                        <span
                            key={val}
                            className="flex items-center bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs mr-1 mb-1"
                        >
                            {item ? getOptionLabel(item) : val}
                            <button
                                type="button"
                                className="ml-1 text-red-500 hover:text-red-700"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRemove(val);
                                }}
                            >
                                ×
                            </button>
                        </span>
                    );
                })}
            </div>
            {/* Dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-auto">
                    {data
                        .filter((item) => !value.includes(getOptionValue(item)))
                        .map((item) => (
                            <div
                                key={getOptionValue(item)}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => {
                                    handleSelect(getOptionValue(item));
                                    setOpen(false);
                                }}
                            >
                                {getOptionLabel(item)}
                            </div>
                        ))}
                    {data.filter((item) => !value.includes(getOptionValue(item))).length === 0 && (
                        <div className="px-3 py-2 text-gray-400">Tidak ada pilihan</div>
                    )}
                </div>
            )}
        </div>
    );
}