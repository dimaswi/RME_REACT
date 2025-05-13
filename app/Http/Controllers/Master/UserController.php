<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::select('id', 'nama', 'nip')->get();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully!');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:255|unique:users,nip',
            'password' => 'required|string|min:3',
        ]);

        User::create([
            'nama' => $request->nama,
            'nip' => $request->nip,
            'password' => bcrypt($request->password),
        ]);

        return redirect()->back()->with('message', 'User created successfully!');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:255|unique:users,nip,' . $user->id,
            'password' => 'nullable|string|min:3', // Password opsional
        ]);

        $data = [
            'nama' => $request->nama,
            'nip' => $request->nip,
        ];

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password); // Hash password jika diisi
        }

        $user->update($data);

        return redirect()->back()->with('message', 'User updated successfully!');
    }
}
