import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TeamPage from "./pages/TeamPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import CartPage from "./pages/CartPage";
import TrackPage from "./pages/TrackPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import KYCVerificationPage from "./pages/KYCVerificationPage";

import Navbar from "./components/Navbar";
import { useUserStore } from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import "./i18n";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();

	useEffect(() => {
		checkAuth();
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
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
					<Route path='/admin-dashboard' element={<AdminPage />} />
					<Route path='/about' element={<AboutPage />} />
					<Route path='/contact' element={<ContactPage />} />
					<Route path='/team' element={<TeamPage />} />
					<Route path='/testimonials' element={<TestimonialsPage />} />
					<Route path='/cart' element={<CartPage />} />
					<Route path='/track' element={<TrackPage />} />
					<Route path='/shipments' element={user ? <ShipmentsPage /> : <Navigate to='/login' />} />
					<Route path='/kyc-verification/:token' element={<KYCVerificationPage />} />
				</Routes>
			</div>
			<Toaster />
		</div>
	);
}

export default App;