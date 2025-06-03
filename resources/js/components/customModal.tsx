import { X } from "lucide-react";
import { Button } from "./ui/button";

// Custom Modal Component
const CustomModal = ({
    isOpen,
    onClose,
    children
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto pt-16 pb-16"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white rounded-lg shadow-lg min-w-[500px] max-w-[90%] animate-in fade-in zoom-in"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

// Modal Header Component
const CustomModalHeader = ({
    children,
    onClose
}: {
    children: React.ReactNode;
    onClose: () => void;
}) => (
    <div className="flex justify-between items-center border-b p-4">
        <h2 className="text-xl font-semibold">{children}</h2>
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose} // Gunakan onClose yang diterima sebagai prop
        >
            <X className="h-4 w-4" />
        </Button>
    </div>
);

// Modal Content Component
const CustomModalContent = ({ children }: { children: React.ReactNode }) => (
    <div className="p-6">{children}</div>
);

// Modal Footer Component
const CustomModalFooter = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-between items-center border-t p-4">{children}</div>
);

export {
    CustomModal,
    CustomModalHeader,
    CustomModalContent,
    CustomModalFooter
}
