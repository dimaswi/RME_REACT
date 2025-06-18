<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class DataKlaim extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'data_klaim';

    protected $fillable = [
        'pengajuan_klaim_id',
        'nomor_sep',
        'nomor_kartu',
        'tgl_masuk',
        'tgl_pulang',
        'cara_masuk',
        'jenis_rawat',
        'kelas_rawat',
        'adl_sub_acute',
        'adl_chronic',
        'icu_indikator',
        'icu_los',
        'ventilator_hour',
        'ventilator_use_ind',
        'ventilator_start_dttm',
        'ventilator_stop_dttm',
        'upgrade_class_ind',
        'upgrade_class_class',
        'upgrade_class_los',
        'upgrade_class_payor',
        'add_payment_pct',
        'birth_weight',
        'sistole',
        'diastole',
        'discharge_status',
        'diagnosa',
        'procedure',
        'diagnosa_inagrouper',
        'procedure_inagrouper',
        'pemulasaraan_jenazah',
        'kantong_jenazah',
        'peti_jenazah',
        'plastik_erat',
        'desinfektan_jenazah',
        'mobil_jenazah',
        'desinfektan_mobil_jenazah',
        'covid19_status_cd',
        'nomor_kartu_t',
        'episodes',
        'covid19_cc_ind',
        'covid19_rs_darurat_ind',
        'covid19_co_insidense_ind',
        'terapi_konvalesen',
        'akses_naat',
        'isoman_ind',
        'bayi_lahir_status_cd',
        'dializer_single_use',
        'kantong_darah',
        'alteplase_ind',
        'tarif_poli_eks',
        'nama_dokter',
        'kode_tarif',
        'payor_id',
        'payor_cd',
        'cob_cd',
        'coder_nik',
    ];

    public function tarifRs()
    {
        return $this->hasOne(DataTarifKlaim::class, 'klaim_data_id');
    }

    public function persalinan()
    {
        return $this->hasOne(DataPersalinan::class, 'klaim_data_id');
    }

    public function apgar()
    {
        return $this->hasOne(DataApgar::class, 'klaim_data_id');
    }
}
