import { Input } from "@/components/ui/input";

export default function DiagnosaModal({
    open,
    onClose,
    diagnosaOptions,
    diagnosaSearch,
    setDiagnosaSearch,
    fetchDiagnosa,
    selectedDiagnosa,
    setSelectedDiagnosa,
}: {
    open: boolean;
    onClose: () => void;
    diagnosaOptions: any[];
    diagnosaSearch: string;
    setDiagnosaSearch: (val: string) => void;
    fetchDiagnosa: (val: string) => void;
    selectedDiagnosa: any[];
    setSelectedDiagnosa: (val: any[]) => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative mt-10">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Pilih Diagnosa</h2>
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4">
                    <Input
                        type="text"
                        className="w-full mb-4"
                        placeholder="Cari Diagnosa"
                        value={diagnosaSearch}
                        autoFocus={true}
                        onChange={(e) => {
                            setDiagnosaSearch(e.target.value);
                            fetchDiagnosa(e.target.value);
                        }}
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedDiagnosa.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                    setDiagnosaSearch(item.id.split('-')[0]);
                                    fetchDiagnosa(item.id);
                                }}
                            >
                                <span>{`${item.id} - ${item.description}`}</span>
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDiagnosa((prev) =>
                                            prev.filter((_, i) => i !== index)
                                        );
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <table className="w-full border border-gray-300 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border-b border-gray-300 px-4 py-2 text-left">ID</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-left">Deskripsi</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(diagnosaOptions) && diagnosaOptions.length > 0 ? (
                                diagnosaOptions.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border-b border-gray-300 px-4 py-2">{item[1]}</td>
                                        <td className="border-b border-gray-300 px-4 py-2">{item[0]}</td>
                                        <td className="border-b border-gray-300 px-4 py-2">
                                            <button
                                                className="text-blue-500 hover:underline"
                                                onClick={() => {
                                                    setSelectedDiagnosa((prev) => [
                                                        ...prev,
                                                        { id: item[1], description: item[0] },
                                                    ]);
                                                }}
                                            >
                                                Tambah
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="border-b border-gray-300 px-4 py-2 text-center">
                                        Tidak ada data diagnosa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={onClose}
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}