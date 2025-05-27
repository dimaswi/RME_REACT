import { usePage } from "@inertiajs/react";
import React from "react";

export default function DiagnosaTable() {
    const { diagnosaData } = usePage().props as { diagnosaData: Array<[string, string]> };

    return (
        <div className="p-4">
            <h1 className="text-lg font-semibold mb-4">Tabel Diagnosa</h1>
            <table className="w-full border border-gray-300 rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border-b border-gray-300 px-4 py-2 text-left">ID</th>
                        <th className="border-b border-gray-300 px-4 py-2 text-left">Deskripsi</th>
                    </tr>
                </thead>
                <tbody>
                    {diagnosaData.length > 0 ? (
                        diagnosaData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border-b border-gray-300 px-4 py-2">{item[1]}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{item[0]}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2} className="border-b border-gray-300 px-4 py-2 text-center">
                                Tidak ada data diagnosa.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
