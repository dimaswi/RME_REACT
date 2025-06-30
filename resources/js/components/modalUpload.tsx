import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";

interface ModalUploadProps {
    open: boolean;
    onClose: () => void;
    uploadUrl: string;
    fileClass?: string;
    dokumen?: File | null;
    onFileChange?: (file: File | null) => void;
    onSuccess?: (response: any) => void;
    title?: string;
    description?: string;
}

export const ModalUpload: React.FC<ModalUploadProps> = ({
    open,
    onClose,
    uploadUrl,
    fileClass,
    dokumen,
    onFileChange,
    onSuccess,
    title = "Upload Dokumen",
    description = "Pilih file yang akan diupload.",
}) => {
    const [file, setFile] = useState<File | null>(dokumen || null);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; url?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [show, setShow] = useState(open);
    const [leaving, setLeaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

    // Reset file saat modal dibuka/tutup
    useEffect(() => {
        if (open && !show) {
            setShow(true);
            setLeaving(false);
            setFile(dokumen || null);
            setUploadedFile(null);
            setError(null);
            if (inputRef.current) inputRef.current.value = "";
        } else if (!open && show && !leaving) {
            setLeaving(true);
            const timeout = setTimeout(() => {
                setShow(false);
                setLeaving(false);
                setFile(null);
                setUploadedFile(null);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
            }, 350);
            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line
    }, [open]);

    // Sync file ke parent jika berubah
    useEffect(() => {
        if (onFileChange) onFileChange(file);
        // eslint-disable-next-line
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Silakan pilih file terlebih dahulu.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (fileClass) formData.append("file_class", fileClass);

            router.post(uploadUrl, formData, {
                forceFormData: true,
                onSuccess: (data) => {
                    if (onSuccess) onSuccess(data);
                    setUploadedFile({ name: file.name });
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                },
                onError: (errors) => {
                    setError(errors?.file || "Terjadi kesalahan saat upload.");
                },
                onFinish: () => setLoading(false),
            });
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat upload.");
            setLoading(false);
        }
    };

    // Handler untuk klik di luar modal
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === backdropRef.current && !leaving) {
            onClose();
        }
    };

    if (!show) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto"
            onMouseDown={handleBackdropClick}
        >
            <div
                className={cn(
                    "bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative mt-10",
                    leaving ? "animate-modal-fade-out" : "animate-modal-fade-in"
                )}
                onMouseDown={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                        <Upload size={20} className="text-blue-500" />
                        {title}
                    </h2>
                    <button
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        onClick={onClose}
                        type="button"
                    >
                        <X size={22} />
                    </button>
                </div>
                {/* Body */}
                <form onSubmit={handleUpload} className="px-6 py-4">
                    <div className="mb-3">
                        <label className="block text-sm mb-1 font-medium text-gray-700">{description}</label>
                        <div className="flex items-center gap-2">
                            <Input
                                ref={inputRef}
                                type="file"
                                className={cn(
                                    "file:bg-blue-100 file:text-blue-700 file:rounded-md file:border-0 file:mr-4 file:py-2 file:px-4",
                                    "border border-gray-300 rounded-md p-1 w-full"
                                )}
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    {file && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                            <FileText size={16} className="text-blue-500" />
                            <span className="font-semibold">{file.name}</span>
                            <Badge variant="secondary">Belum diupload</Badge>
                        </div>
                    )}
                    {uploadedFile && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-green-700">
                            <FileText size={16} className="text-green-600" />
                            <span className="font-semibold">{uploadedFile.name}</span>
                            <Badge variant="success">Sudah diupload</Badge>
                            {uploadedFile.url && (
                                <a
                                    href={uploadedFile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline ml-2"
                                >
                                    Lihat
                                </a>
                            )}
                        </div>
                    )}
                    {error && (
                        <div className="mb-2 text-sm text-red-500">{error}</div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader className="animate-spin mr-2" size={16} />
                                    Mengupload...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Tambahkan CSS animasi di global CSS Anda, misal di app.css atau globals.css:
/*
@keyframes modal-fade-in {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes modal-fade-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(40px) scale(0.97);
  }
}
.animate-modal-fade-in {
  animation: modal-fade-in 0.35s cubic-bezier(0.4,0,0.2,1);
}
.animate-modal-fade-out {
  animation: modal-fade-out 0.35s cubic-bezier(0.4,0,0.2,1);
}
*/
