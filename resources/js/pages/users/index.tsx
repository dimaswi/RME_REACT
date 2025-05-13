import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import * as React from 'react';
import { toast } from 'sonner';

type User = {
    id: number;
    nama: string;
    nip: string;
    password?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function UsersIndex() {
    const { props } = usePage<{ users: User[]; flash?: { message?: string } }>();
    const [search, setSearch] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(5);
    const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State untuk modal edit
    const [newUser, setNewUser] = useState<User>({ id: 0, nama: '', nip: '' });
    const [editUser, setEditUser] = useState<User | null>(null); // State untuk data user yang akan diedit
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State untuk melacak status loading

    // Filter data berdasarkan pencarian
    const filteredUsers = props.users.filter(
        (user) =>
            user.nama.toLowerCase().includes(search.toLowerCase()) ||
            user.nip.toLowerCase().includes(search.toLowerCase())
    );

    // Hitung total halaman
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Data pengguna untuk halaman saat ini
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fungsi untuk berpindah halaman
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Fungsi untuk memilih semua pengguna di halaman saat ini
    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            const currentPageUserIds = paginatedUsers.map((user) => user.id);
            setSelectedUsers((prev) => [...prev, ...currentPageUserIds]);
        } else {
            const currentPageUserIds = paginatedUsers.map((user) => user.id);
            setSelectedUsers((prev) => prev.filter((id) => !currentPageUserIds.includes(id)));
        }
    };

    // Fungsi untuk memilih satu pengguna
    const handleSelectUser = (id: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedUsers((prev) => [...prev, id]);
        } else {
            setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
        }
    };

    // Fungsi untuk menghapus pengguna yang dipilih
    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) {
            toast.error('No users selected for deletion.');
            return;
        }

        if (confirm('Are you sure you want to delete the selected users?')) {
            console.log(`Users with IDs ${selectedUsers.join(', ')} deleted`);
            setSelectedUsers([]);
            toast.success('Selected users deleted successfully!');
        }
    };

    // Fungsi untuk membuat pengguna baru
    const handleCreateUser = () => {
        if (!newUser.nama || !newUser.nip || !password || !confirmPassword) {
            toast.error('Nama, NIP, Password, dan Confirm Password harus diisi.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Password dan Confirm Password tidak cocok.');
            return;
        }

        setIsLoading(true); // Set loading menjadi true

        // Kirim data ke backend menggunakan Inertia
        router.post('/master/user', { ...newUser, password }, {
            onSuccess: () => {
                setNewUser({ id: 0, nama: '', nip: '' });
                setPassword('');
                setConfirmPassword('');
                setIsCreateModalOpen(false);
                toast.success('User created successfully!');
            },
            onError: (errors) => {
                toast.error('Failed to create user: ' + errors);
            },
            onFinish: () => {
                setIsLoading(false); // Set loading menjadi false setelah selesai
            },
        });
    };

    // Fungsi untuk menghapus pengguna
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/master/users/${id}`, {
                onSuccess: () => {
                    setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
                    toast.success('User deleted successfully!');
                },
                onError: (errors) => {
                    toast.error('Failed to delete user: ' + errors);
                },
            });
        }
    };

    // Fungsi untuk membuka modal edit
    const handleEdit = (user: User) => {
        setEditUser(user);
        setIsEditModalOpen(true);
    };

    // Fungsi untuk menyimpan perubahan pengguna
    const handleUpdateUser = () => {
        if (!editUser?.nama || !editUser?.nip) {
            toast.error('Nama dan NIP harus diisi.');
            return;
        }

        setIsLoading(true); // Set loading menjadi true

        // Kirim data ke backend menggunakan Inertia
        const payload = {
            nama: editUser.nama,
            nip: editUser.nip,
            ...(editUser.password ? { password: editUser.password } : {}), // Sertakan password jika diisi
        };

        router.put(`/master/users/${editUser.id}`, payload, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                toast.success('User updated successfully!');
            },
            onError: (errors) => {
                toast.error('Failed to update user: ' + errors);
            },
            onFinish: () => {
                setIsLoading(false); // Set loading menjadi false setelah selesai
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search Input dan Tombol Create */}
                <div className="flex justify-between items-center">
                    <div className="relative max-w-sm">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoComplete="off"
                            className="pr-10"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {selectedUsers.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                Delete Selected
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create User
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Checkbox
                                        onCheckedChange={(isChecked) => handleSelectAll(isChecked as boolean)}
                                        checked={
                                            paginatedUsers.every((user) => selectedUsers.includes(user.id)) &&
                                            paginatedUsers.length > 0
                                        }
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead style={{ width: '5%' }}>#</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIP</TableHead>
                                <TableHead style={{ width: '1%' }}>
                                    <center>Actions</center>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                onCheckedChange={(isChecked) =>
                                                    handleSelectUser(user.id, isChecked as boolean)
                                                }
                                                checked={selectedUsers.includes(user.id)}
                                                aria-label={`Select user ${user.nama}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell>{user.nama}</TableCell>
                                        <TableCell>{user.nip}</TableCell>
                                        <TableCell>
                                            <center>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            Actions
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-500"
                                                            disabled={isLoading} // Nonaktifkan tombol jika sedang loading
                                                        >
                                                            {isLoading ? (
                                                                <span className="flex items-center">
                                                                    <svg
                                                                        className="animate-spin h-4 w-4 mr-2 text-red-500"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <circle
                                                                            className="opacity-25"
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                            stroke="currentColor"
                                                                            strokeWidth="4"
                                                                        ></circle>
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        ></path>
                                                                    </svg>
                                                                    Deleting...
                                                                </span>
                                                            ) : (
                                                                'Delete'
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </center>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Nama user tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                    {/* Informasi Halaman */}
                    <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </div>

                    {/* Selector untuk jumlah item per halaman dan Tombol Pagination */}
                    <div className="flex items-center space-x-4">
                        {/* Selector Jumlah Item Per Halaman */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="border rounded-md p-1 text-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        {/* Tombol Pagination */}
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Create User */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className='top-72'>
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        <Input
                            placeholder="Nama"
                            value={newUser.nama}
                            onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                        />
                        <Input
                            placeholder="NIP"
                            value={newUser.nip}
                            onChange={(e) => setNewUser({ ...newUser, nip: e.target.value })}
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="p-4">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleCreateUser}
                            disabled={isLoading} // Nonaktifkan tombol jika sedang loading
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin h-4 w-4 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Edit User */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        <Input
                            placeholder="Nama"
                            value={editUser?.nama || ''}
                            onChange={(e) =>
                                setEditUser((prev) => prev && { ...prev, nama: e.target.value })
                            }
                        />
                        <Input
                            placeholder="NIP"
                            value={editUser?.nip || ''}
                            onChange={(e) =>
                                setEditUser((prev) => prev && { ...prev, nip: e.target.value })
                            }
                        />
                        <Input
                            type="password"
                            placeholder="Password (optional)"
                            onChange={(e) =>
                                setEditUser((prev) => prev && { ...prev, password: e.target.value })
                            }
                        />
                    </div>
                    <DialogFooter className="p-4">
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleUpdateUser}
                            disabled={isLoading} // Nonaktifkan tombol jika sedang loading
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin h-4 w-4 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
