import axios from 'axios';
import React, { useState } from 'react';

type Pasien = {
    NORM: string;
    NAMA: string;
    TANGGAL_LAHIR: string;
    ALAMAT: string;
    nomor_b_p_j_s?: { NOMOR: string };
};

type Props = {
    value: string;
    onChange: (val: Pasien | null) => void;
};

export default function SearchableDropdownPasien({ value, onChange }: Props) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Pasien[]>([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const fetchPasien = async (q: string) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/pasien/search', {
                params: { q, limit: 10 },
            });
            setResults(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (search.length > 0) {
            fetchPasien(search);
        } else {
            setResults([]);
        }
    }, [search]);

    return (
        <div className="relative">
            <input
                type="text"
                className="w-full rounded border px-3 py-2"
                placeholder="Cari Nomor RM..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShow(true);
                }}
                onFocus={() => setShow(true)}
            />
            {show && (results.length > 0 || loading) && (
                <div className="absolute right-0 left-0 z-[9999] mt-1 max-h-60 overflow-y-auto rounded border bg-white shadow">
                    {loading && <div className="p-2 text-sm text-gray-400">Loading...</div>}
                    {results.map((pasien) => (
                        <div
                            key={pasien.NAMA}
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                            onMouseDown={() => {
                                onChange(pasien);
                                setSearch(pasien.NAMA);
                                setShow(false);
                            }}
                        >
                            <div className="font-semibold">{pasien.NAMA}</div>
                            <div className="text-xs text-gray-500">
                                {pasien.NORM} | {pasien.ALAMAT} | {pasien.TANGGAL_LAHIR} | {pasien.nomor_b_p_j_s?.NOMOR}
                            </div>
                        </div>
                    ))}
                    {!loading && results.length === 0 && <div className="p-2 text-sm text-gray-400">Tidak ditemukan</div>}
                </div>
            )}
        </div>
    );
}
