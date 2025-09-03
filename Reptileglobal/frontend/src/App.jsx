import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/Navbar";
import { useUserStore } from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import PWASessionManager from "./utils/pwaUtils";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import "./i18n";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();

	useEffect(() => {
		checkAuth();
		// Register service worker for PWA
		PWASessionManager.registerServiceWorker();
	}, [checkAuth]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

			<div className='relative z-50'>
				<Navbar />
				<PWAInstallPrompt />
				<Routes>
					<Route path='/' element={!user ? <LoginPage /> : <Navigate to='/admin-dashboard' />} />

					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/admin-dashboard' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/admin-dashboard' />} />
					<Route
						path='/admin-dashboard'
						element={user ? <AdminPage /> : <Navigate to='/' />}
					/>
				</Routes>
			</div>
			<Toaster />
		</div>
	);
}

export default App;