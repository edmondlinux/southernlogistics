
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import TrackingPage from "./pages/TrackingPage";
import KYCPage from "./pages/KYCPage";

import { useUserStore } from "./stores/useUserStore";
import { useShipmentStore } from "./stores/useShipmentStore";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function App() {
	const { user, checkAuth, isCheckingAuth } = useUserStore();
	const { fetchShipments } = useShipmentStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (user) {
			fetchShipments();
		}
	}, [user, fetchShipments]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-50 text-gray-900'>
			<Navbar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/contact' element={<ContactPage />} />
				<Route path='/about' element={<AboutPage />} />
				<Route path='/team' element={<TeamPage />} />
				<Route path='/testimonials' element={<TestimonialsPage />} />
				<Route path='/track' element={<TrackingPage />} />
				<Route path='/kyc/:token' element={<KYCPage />} />
				<Route
					path='/signup'
					element={!user ? <SignUpPage /> : <Navigate to='/' />}
				/>
				<Route
					path='/login'
					element={!user ? <LoginPage /> : <Navigate to='/' />}
				/>
				<Route
					path='/admin'
					element={
						user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />
					}
				/>
			</Routes>
			<Toaster />
			<PWAInstallPrompt />
		</div>
	);
}

export default App;
