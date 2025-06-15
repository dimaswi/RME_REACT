import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../css/SearchableDropdown.css';

export default function SearchableDropdown({
    data,
    value,
    setValue,
    placeholder,
    disabled = false,
    warning = false,
    getOptionLabel = (item) => (item && item.DESKRIPSI ? item.DESKRIPSI : ''),
    getOptionValue = (item) => (item && item.ID ? item.ID : ''),
    autoFocus = false,
    onSearch, // Tambahkan properti onSearch
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlighted, setHighlighted] = useState(0);
    const ref = useRef(null);

    const filtered = data.filter((item) => item && (!search ? true : getOptionLabel(item)?.toLowerCase().includes(search.toLowerCase())));

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setHighlighted(0);
    }, [search, open]);

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted((prev) => (prev + 1 < filtered.length ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlighted]) {
                setValue(filtered[highlighted].ID.toString());
                setSearch('');
                setOpen(false);
            }
        } else if (e.key === 'Escape') {
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
        <div className="searchable-dropdown relative" ref={ref}>
            <div
                className={`flex items-center rounded-lg border bg-white px-2 py-1 transition focus-within:ring-2 focus-within:ring-gray-400 ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${warning ? 'border-red-500' : 'border-gray-300'} `}
            >
                <input
                    className="flex-1 bg-transparent px-0 py-1 text-sm text-gray-700 placeholder-gray-400 outline-none"
                    placeholder={placeholder}
                    value={open ? search : value ? getOptionLabel(data.find((item) => getOptionValue(item).toString() === value)) || '' : ''}
                    onFocus={() => !disabled && setOpen(true)}
                    onChange={handleSearchChange}
                    onKeyDown={disabled ? undefined : handleKeyDown}
                    autoComplete="off"
                    disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    autoFocus={autoFocus}
                />
                <button type="button" className="chevron-button" tabIndex={-1} onClick={() => !disabled && setOpen((v) => !v)} disabled={disabled}>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {open && !disabled && createPortal(
                <div
                    className="fixed z-[9999] mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                    style={(() => {
                        if (!ref.current) return {};
                        const rect = ref.current.getBoundingClientRect();
                        return {
                            top: rect.bottom + window.scrollY,
                            left: rect.left + window.scrollX,
                            width: rect.width,
                        };
                    })()}
                >
                    {filtered.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-400">
                            Tidak ditemukan hasil untuk "<span className="font-semibold">{search}</span>"
                        </div>
                    ) : (
                        filtered.map((item, idx) => (
                            <div
                                key={getOptionValue(item)}
                                className={`cursor-pointer truncate px-4 py-2 transition ${
                                    idx === highlighted ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 hover:text-gray-700'
                                }`}
                                onMouseDown={() => {
                                    setValue(getOptionValue(item).toString());
                                    setSearch('');
                                    setOpen(false);
                                }}
                                onMouseEnter={() => setHighlighted(idx)}
                            >
                                {getOptionLabel(item)}
                            </div>
                        ))
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
