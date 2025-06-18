import SearchableDropdown from '@/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GroupingOneCollapse({ pengajuanKlaim }) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true); // Tambahkan state loading
    // Tambahkan state untuk value dropdown
    const [specialProcedure, setSpecialProcedure] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Mulai loading
            try {
                const result = await axios(
                    `grouper/one/${pengajuanKlaim.id}`
                );
                setData(result.data);
            } finally {
                setLoading(false); // Selesai loading
            }
        };

        fetchData();
    }, [pengajuanKlaim.id]);

    function formatRupiah(value: number) {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 });
    }

    // Hitung total kolom ke-4 dari hasil grouping
    const totalGrouping =
        (
            (data?.grouperone?.cbg || []).reduce((sum: number, item: any) => sum + (Number(item.tariff) || 0), 0) +
            (data?.grouperone?.subacute || []).reduce((sum: number, item: any) => sum + (Number(item.tariff) || 0), 0) +
            (data?.grouperone?.chronic || []).reduce((sum: number, item: any) => sum + (Number(item.tariff) || 0), 0)
        );

    // Tampilkan loading jika data sedang di-load
    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500 font-semibold">
                <Loader className="animate-spin h-6 w-6 inline-block mr-2" />
                Loading data grouping...
            </div>
        );
    }

    return (
        <>
            <div className="p-4">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 border border-black rounded-lg">
                    <tr className='border border-black'>
                        <td colSpan={4} className='font-bold text-center text-black py-2'>
                            Hasil Grouper V5
                        </td>
                    </tr>

                    {/* KODE CBG */}
                    {data && data.grouperone && data.grouperone.cbg && Array.isArray(data.grouperone.cbg) && data.grouperone.cbg.length > 0 ? (
                        data.grouperone.cbg.map((cbgItem: any, idx: number) => (
                            <tr key={idx}>
                                <td className="font-semibold text-black py-1 px-2 py-2">GROUP</td>
                                <td className="py-1 px-2 py-2">: {cbgItem.description}</td>
                                <td className="py-1 px-2 py-2"> {cbgItem.code}</td>
                                <td className="py-1 px-2 py-2 text-end">{formatRupiah(Number(cbgItem.tariff) || 0)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="font-semibold text-black py-1 px-2 py-2">GROUP</td>
                            <td className="py-1 px-2 py-2">: - </td>
                            <td className="py-1 px-2 py-2"> - </td>
                            <td className="py-1 px-2 py-2 text-end"> - </td>
                        </tr>
                    )}

                    {/* SUB ACUTE */}
                    {data && data.grouperone && data.grouperone.subacute && Array.isArray(data.grouperone.subacute) && data.grouperone.subacute.length > 0 ? (
                        data.grouperone.subacute.map((subacuteItem: any, idx: number) => (
                            <tr key={idx}>
                                <td className="font-semibold text-black py-1 px-2 py-2">SUB ACUTE</td>
                                <td className="py-1 px-2 py-2">: {subacuteItem.description}</td>
                                <td className="py-1 px-2 py-2"> {subacuteItem.code}</td>
                                <td className="py-1 px-2 py-2 text-end">{formatRupiah(Number(subacuteItem.tariff) || 0)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="font-semibold text-black py-1 px-2 py-2">SUB ACUTE</td>
                            <td className="py-1 px-2 py-2">: - </td>
                            <td className="py-1 px-2 py-2"> - </td>
                            <td className="py-1 px-2 py-2 text-end">{formatRupiah(Number(0))}</td>
                        </tr>
                    )}

                    {/* CHRONIC */}
                    {data && data.grouperone && data.grouperone.chronic && Array.isArray(data.grouperone.chronic) && data.grouperone.chronic.length > 0 ? (
                        data.grouperone.chronic.map((chronicItem: any, idx: number) => (
                            <tr key={idx}>
                                <td className="font-semibold text-black py-1 px-2 py-2">CHRONIC</td>
                                <td className="py-1 px-2 py-2">: {chronicItem.description}</td>
                                <td className="py-1 px-2 py-2">{chronicItem.code}</td>
                                <td className="py-1 px-2 py-2 text-end">{formatRupiah(Number(chronicItem.tariff) || 0)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="font-semibold text-black py-1 px-2 py-2">CHRONIC</td>
                            <td className="py-1 px-2 py-2">: - </td>
                            <td className="py-1 px-2 py-2"> - </td>
                            <td className="py-1 px-2 py-2 text-end">{formatRupiah(Number(0))}</td>
                        </tr>
                    )}

                    {/* SPECIAL PROCEDURE */}
                    <tr>
                        <td className="font-semibold text-black py-1 px-2 py-2">SPECIAL PROCEDURE</td>
                        <td className="py-1 px-2 py-2">
                            {
                                data && data.grouperone && data.grouperone.grouperOneSpecialCmg ? (
                                    <SearchableDropdown
                                        data={data && data.grouperone && data.grouperone.grouperOneSpecialCmg ? data.grouperone.grouperOneSpecialCmg : []}
                                        value={specialProcedure}
                                        setValue={setSpecialProcedure}
                                        placeholder="Pilih Special Procedure"
                                        getOptionLabel={item => item?.description || ''}
                                        getOptionValue={item => item?.code || ''}

                                    />
                                ) : (
                                    ': - '
                                )
                            }
                        </td>
                        <td className="py-1 px-2 py-2">
                            {specialProcedure}
                        </td>
                        <td className="py-1 px-2 py-2 text-end">
                            {formatRupiah(Number(0))}
                        </td>
                    </tr>

                    {/* Special Prosthesis */}
                    <tr>
                        <td className="font-semibold text-black py-1 px-2 py-2">SPECIAL PROSTHESIS</td>
                        <td className="py-1 px-2 py-2">
                            : -
                        </td>
                        <td className="py-1 px-2 py-2">
                            -
                        </td>
                        <td className="py-1 px-2 py-2 text-end">
                            {formatRupiah(Number(0))}
                        </td>
                    </tr>

                    {/* Special Investigation */}
                    <tr>
                        <td className="font-semibold text-black py-1 px-2 py-2">SPECIAL INVESTIGATION</td>
                        <td className="py-1 px-2 py-2">
                            : -
                        </td>
                        <td className="py-1 px-2 py-2">
                            -
                        </td>
                        <td className="py-1 px-2 py-2 text-end">
                            {formatRupiah(Number(0))}
                        </td>
                    </tr>

                    {/* SPECIAL DRUG */}
                    <tr>
                        <td className="font-semibold text-black py-1 px-2 py-2">SPECIAL DRUG</td>
                        <td className="py-1 px-2 py-2">
                            : -
                        </td>
                        <td className="py-1 px-2 py-2">
                            -
                        </td>
                        <td className="py-1 px-2 py-2 text-end">
                            {formatRupiah(Number(0))}
                        </td>
                    </tr>

                    {/* TOTAL */}
                    <tr style={{ borderTop: '1px solid black' }}>
                        <td colSpan={3} className='font-semibold text-black py-1 px-2 py-2'>Total</td>
                        <td className='py-1 px-2 py-2 text-end'>{formatRupiah(totalGrouping)}</td>
                    </tr>
                </table>
            </div>

            <div className="p-4">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 border border-black rounded-lg">
                    <tr className='border border-black' >
                        <td colSpan={3} className='font-bold text-center text-black py-2'>
                            Hasil Grouper V6
                        </td>
                    </tr>

                    {/* Hasil InaGrouper */}
                    {data && data.grouperOneInagrouper && data.grouperOneInagrouper.length > 0 ? (
                        data.grouperOneInagrouper.map((item: any, idx: number) => (
                            <>
                                <tr key={idx}>
                                    <td className="font-semibold text-black py-1 px-2 py-2">MDC</td>
                                    <td className="font-semibold text-black py-1 px-2 py-2">{item.mdc_description}</td>
                                    <td className="font-semibold text-black py-1 px-2 py-2">{item.mdc_number}</td>
                                </tr>
                                <tr key={idx}>
                                    <td className="font-semibold text-black py-1 px-2 py-2">DRG</td>
                                    <td className="font-semibold text-black py-1 px-2 py-2">{item.drg_description}</td>
                                    <td className="font-semibold text-black py-1 px-2 py-2">{item.drg_code}</td>
                                </tr>
                            </>
                        ))
                    ) : (
                        <tr>
                            <td className="font-semibold text-black py-1 px-2 py-2"> - </td>
                            <td className="py-1 px-2 py-2 text-end"> - </td>
                        </tr>
                    )}
                </table>
            </div>

            <div className="flex justify-end px-4 py-2">
                <Button
                    variant="outline"
                    className="bg-red-400 hover:bg-red-500 text-white"
                    onClick={() => {
                        // Logika untuk membatalkan atau menutup collapsible
                        console.log('Batal diklik');
                    }}
                >
                    Batal
                </Button>
                <Button
                    variant="outline"
                    className="bg-blue-400 hover:bg-blue-500 text-white ml-2"
                    onClick={() => {
                        // Logika untuk menyimpan perubahan
                        console.log('Simpan diklik');
                    }}
                >
                    Grouper Stage 2
                </Button>
            </div>
        </>

    );
}