import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useUserStore } from "./stores/useUserStore";

import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
					<div className='absolute top-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
					<div className='absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>
				</div>
			</div>

			<div className='relative z-50'>
				<Navbar />
				<Routes>
					<Route path='/' element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />} />
					<Route path='/login' element={!user ? <LoginPage /> : user.role === "admin" ? <Navigate to='/' /> : <Navigate to='/login' />} />
					<Route path='*' element={<Navigate to='/' />} />
				</Routes>
			</div>

			<Toaster />
		</div>
	);
}

export default App;