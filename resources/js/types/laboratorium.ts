export interface HasilLab {
    ID: string;
    TINDAKAN_MEDIS: string;
    PARAMETER_TINDAKAN: string | number;
    TANGGAL: string;
    HASIL: string;
    NILAI_NORMAL: string;
    SATUAN: string;
    KETERANGAN: string;
    OLEH: string | number;
    OTOMATIS: number;
    STATUS: number;
}

export interface TindakanLab {
    ID: string;
    KUNJUNGAN: string;
    TINDAKAN: string | number;
    TANGGAL: string;
    OLEH: string | number;
    STATUS: number;
    OTOMATIS: number;
    hasil_lab: HasilLab[];
}