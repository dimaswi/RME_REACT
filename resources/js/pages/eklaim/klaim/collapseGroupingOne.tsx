import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Loader, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

type GrouperOneData = {
    grouperone?: {
        cbg?: any[];
        sub_acute?: any[];
        chronic?: any[];
        special_cmg?: any[];
    };
    grouperOneSpecialCmgOption?: any[];
    grouperOneInagrouper?: any[];
    refreshData: () => void;
};

export default function GroupingOneCollapse({ pengajuanKlaim, refreshData }: { pengajuanKlaim: any; refreshData: () => void }) {
    const [data, setData] = useState<GrouperOneData | null>(null);
    const [loading, setLoading] = useState(true);
    const [specialProcedure, setSpecialProcedure] = useState<string[]>([]);
    const [specialProsthesis, setSpecialProsthesis] = useState<string[]>([]);
    const [loadingGrouper, setLoadingGrouper] = useState(false);
    const [loadingFinal, setLoadingFinal] = useState(false);
    const [loadingHapus, setLoadingHapus] = useState(false);

    const specialCmgCombinedString = [...specialProcedure, ...specialProsthesis].join('#');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await axios(`klaim/grouper/one/${pengajuanKlaim.id}`);
                setData(result.data);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [pengajuanKlaim.id]);

    function formatRupiah(value: number) {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 });
    }

    const totalGrouping =
        (data?.grouperone?.cbg || []).reduce((sum: number, item: any) => sum + (Number(item.tariff) || 0), 0) +
        (data?.grouperone?.sub_acute || []).reduce((sum: number, item: any) => sum + (Number(item.tariff) || 0), 0) +
        (data?.grouperone?.chronic || []).reduce((sum: number, item: any) => sum + (Number(item.tariff) || 0), 0);

    if (loading) {
        return (
            <div className="p-8 text-center font-semibold text-gray-500">
                <Loader className="mr-2 inline-block h-6 w-6 animate-spin" />
                Loading data grouping...
            </div>
        );
    }

    return (
        <>
            <div className="p-4">
                <table className="w-full rounded-lg border border-black text-left text-sm text-gray-500 dark:text-gray-400">
                    <tr className="border border-black">
                        <td colSpan={4} className="py-2 text-center font-bold text-black">
                            Hasil Grouper V5
                        </td>
                    </tr>

                    {/* KODE CBG */}
                    {data && data.grouperone && data.grouperone.cbg && Array.isArray(data.grouperone.cbg) && data.grouperone.cbg.length > 0 ? (
                        data.grouperone.cbg.map((cbgItem: any, idx: number) => (
                            <tr key={idx}>
                                <td className="px-2 py-1 py-2 font-semibold text-black">GROUP</td>
                                <td className="px-2 py-1 py-2">: {cbgItem.description}</td>
                                <td className="px-2 py-1 py-2"> {cbgItem.code}</td>
                                <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(cbgItem.tariff) || 0)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="px-2 py-1 py-2 font-semibold text-black">GROUP</td>
                            <td className="px-2 py-1 py-2">: - </td>
                            <td className="px-2 py-1 py-2"> - </td>
                            <td className="px-2 py-1 py-2 text-end"> - </td>
                        </tr>
                    )}

                    {/* SUB ACUTE */}
                    {data &&
                        data.grouperone &&
                        data.grouperone.sub_acute &&
                        Array.isArray(data.grouperone.sub_acute) &&
                        data.grouperone.sub_acute.length > 0 ? (
                        data.grouperone.sub_acute.map((subacuteItem: any, idx: number) => (
                            <tr key={idx}>
                                <td className="px-2 py-1 py-2 font-semibold text-black">SUB ACUTE</td>
                                <td className="px-2 py-1 py-2">: {subacuteItem.description}</td>
                                <td className="px-2 py-1 py-2"> {subacuteItem.code}</td>
                                <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(subacuteItem.tariff) || 0)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="px-2 py-1 py-2 font-semibold text-black">SUB ACUTE</td>
                            <td className="px-2 py-1 py-2">: - </td>
                            <td className="px-2 py-1 py-2"> - </td>
                            <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(0))}</td>
                        </tr>
                    )}

                    {/* CHRONIC */}
                    {data &&
                        data.grouperone &&
                        data.grouperone.chronic &&
                        Array.isArray(data.grouperone.chronic) &&
                        data.grouperone.chronic.length > 0 ? (
                        data.grouperone.chronic.map((chronicItem: any, idx: number) => (
                            <tr key={idx}>
                                <td className="px-2 py-1 py-2 font-semibold text-black">CHRONIC</td>
                                <td className="px-2 py-1 py-2">: {chronicItem.description}</td>
                                <td className="px-2 py-1 py-2">{chronicItem.code}</td>
                                <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(chronicItem.tariff) || 0)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="px-2 py-1 py-2 font-semibold text-black">CHRONIC</td>
                            <td className="px-2 py-1 py-2">: - </td>
                            <td className="px-2 py-1 py-2"> - </td>
                            <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(0))}</td>
                        </tr>
                    )}

                    {/* SPECIAL PROCEDURE */}
                    <tr>
                        <td className="px-2 py-1 py-2 font-semibold text-black">SPECIAL PROCEDURE</td>
                        <td className="px-2 py-1 py-2">
                            {data && Array.isArray(data.grouperOneSpecialCmgOption) && data.grouperOneSpecialCmgOption.length > 0 ? (
                                <MultiSelectDropdown
                                    data={data.grouperOneSpecialCmgOption.filter((item: any) => item.type === 'Special Procedure')}
                                    value={Array.isArray(specialProcedure) ? specialProcedure : []}
                                    setValue={setSpecialProcedure}
                                    placeholder="Pilih Special Procedure"
                                    getOptionLabel={(item) => item?.description || ''}
                                    getOptionValue={(item) => item?.code || ''}
                                />
                            ) : (
                                ': - '
                            )}
                        </td>
                        <td className="px-2 py-1 py-2">{specialCmgCombinedString}</td>
                        <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(0))}</td>
                    </tr>
                    <tr>
                        <td className="px-2 py-1 py-2 font-semibold text-black">SPECIAL PROSTHESIS</td>
                        <td className="px-2 py-1 py-2">
                            {data && Array.isArray(data.grouperOneSpecialCmgOption) && data.grouperOneSpecialCmgOption.length > 0 ? (
                                <MultiSelectDropdown
                                    data={data.grouperOneSpecialCmgOption.filter((item: any) => item.type === 'Special Prosthesis')}
                                    value={Array.isArray(specialProsthesis) ? specialProsthesis : []}
                                    setValue={setSpecialProsthesis}
                                    placeholder="Pilih Special Prosthesis"
                                    getOptionLabel={(item) => item?.description || ''}
                                    getOptionValue={(item) => item?.code || ''}
                                />
                            ) : (
                                ': - '
                            )}
                        </td>
                        <td className="px-2 py-1 py-2">{specialCmgCombinedString}</td>
                        <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(0))}</td>
                    </tr>

                    {/* Special Investigation */}
                    <tr>
                        <td className="px-2 py-1 py-2 font-semibold text-black">SPECIAL INVESTIGATION</td>
                        <td className="px-2 py-1 py-2">: -</td>
                        <td className="px-2 py-1 py-2">-</td>
                        <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(0))}</td>
                    </tr>

                    {/* SPECIAL DRUG */}
                    <tr>
                        <td className="px-2 py-1 py-2 font-semibold text-black">SPECIAL DRUG</td>
                        <td className="px-2 py-1 py-2">: -</td>
                        <td className="px-2 py-1 py-2">-</td>
                        <td className="px-2 py-1 py-2 text-end">{formatRupiah(Number(0))}</td>
                    </tr>

                    {/* TOTAL */}
                    <tr style={{ borderTop: '1px solid black' }}>
                        <td colSpan={3} className="px-2 py-1 py-2 font-semibold text-black">
                            Total
                        </td>
                        <td className="px-2 py-1 py-2 text-end">{formatRupiah(totalGrouping)}</td>
                    </tr>
                </table>
            </div>

            <div className="p-4">
                <table className="w-full rounded-lg border border-black text-left text-sm text-gray-500 dark:text-gray-400">
                    <tr className="border border-black">
                        <td colSpan={3} className="py-2 text-center font-bold text-black">
                            Hasil Grouper V6
                        </td>
                    </tr>

                    {/* Hasil InaGrouper */}
                    {data && data.grouperOneInagrouper && data.grouperOneInagrouper.length > 0 ? (
                        data.grouperOneInagrouper.map((item: any, idx: number) => (
                            <>
                                <tr key={idx}>
                                    <td className="px-2 py-1 py-2 font-semibold text-black">MDC</td>
                                    <td className="px-2 py-1 py-2 font-semibold text-black">{item.mdc_description}</td>
                                    <td className="px-2 py-1 py-2 font-semibold text-black">{item.mdc_number}</td>
                                </tr>
                                <tr key={idx}>
                                    <td className="px-2 py-1 py-2 font-semibold text-black">DRG</td>
                                    <td className="px-2 py-1 py-2 font-semibold text-black">{item.drg_description}</td>
                                    <td className="px-2 py-1 py-2 font-semibold text-black">{item.drg_code}</td>
                                </tr>
                            </>
                        ))
                    ) : (
                        <tr>
                            <td className="px-2 py-1 py-2 font-semibold text-black"> - </td>
                            <td className="px-2 py-1 py-2 text-end"> - </td>
                        </tr>
                    )}
                </table>
            </div>

            {pengajuanKlaim.status == 3 ? (
                <></>
            ) : (
                <div className="flex justify-end gap-2 px-4 py-2">
                    {data &&
                        data.grouperOneSpecialCmgOption &&
                        Array.isArray(data.grouperone?.special_cmg) &&
                        data.grouperone.special_cmg.length === 0 &&
                        data.grouperOneSpecialCmgOption.length > 0 ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setLoadingGrouper(true);
                                router.post(
                                    `klaim/${pengajuanKlaim.id}/grouper/two`,
                                    { specialCmgCombinedString },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        onStart: () => {
                                            setLoadingGrouper(true);
                                        },
                                        onSuccess: (page) => {
                                            setLoadingGrouper(false);
                                            if (typeof refreshData === 'function') {
                                                refreshData();
                                            }
                                        },
                                        onError: (errors) => {
                                            setLoadingGrouper(false);
                                            if (typeof refreshData === 'function') {
                                                refreshData();
                                            }
                                        },
                                        onFinish: () => setLoadingGrouper(false),
                                    },
                                );
                            }}
                            disabled={loadingGrouper || loadingFinal}
                        >
                            {loadingGrouper ? (
                                <Loader className="mr-2 inline-block h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 inline-block h-4 w-4 text-blue-500" />
                            )}
                            Grouper Stage 2
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setLoadingFinal(true);
                                router.post(
                                    `klaim/${pengajuanKlaim.id}/grouper/final`,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        onStart: () => {
                                            setLoadingFinal(true);
                                        },
                                        onSuccess: (page) => {
                                            setLoadingFinal(false);
                                            if (typeof refreshData === 'function') {
                                                refreshData();
                                            }
                                        },
                                        onError: (errors) => {
                                            setLoadingFinal(false);
                                            if (typeof refreshData === 'function') {
                                                refreshData();
                                            }
                                        },
                                        onFinish: () => setLoadingFinal(false),
                                    },
                                );
                            }}
                            disabled={loadingGrouper || loadingFinal}
                        >
                            {loadingFinal ? (
                                <Loader className="mr-2 inline-block h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 inline-block h-4 w-4 text-blue-500" />
                            )}
                            Final
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}
