
import { Package, UserPlus, LogIn, LogOut, Lock, Truck, Menu, X, Fingerprint } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import BiometricSetup from "./BiometricSetup";
import { isWebAuthnSupported, isUserVerifyingPlatformAuthenticatorAvailable } from "../utils/webauthn";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const [isOpen, setIsOpen] = useState(false);
	const [showBiometricSetup, setShowBiometricSetup] = useState(false);
	const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
	const [biometricSupported, setBiometricSupported] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		const checkBiometricAndPrompt = async () => {
			if (user) {
				const supported = isWebAuthnSupported();
				if (supported) {
					const available = await isUserVerifyingPlatformAuthenticatorAvailable();
					setBiometricSupported(available);
					
					// Check if user has just logged in and hasn't set up biometric yet
					const lastLoginEmail = localStorage.getItem('lastLoginEmail');
					const biometricPromptShown = localStorage.getItem(`biometricPrompt_${user.email}`);
					
					if (available && lastLoginEmail === user.email && !biometricPromptShown) {
						setTimeout(() => setShowBiometricPrompt(true), 2000);
						localStorage.removeItem('lastLoginEmail');
					}
				}
			}
		};
		
		checkBiometricAndPrompt();
	}, [user]);

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-95 backdrop-blur-md z-50 border-b border-gray-800'>
			<div className='container mx-auto px-4 h-16'>
				<div className='flex items-center justify-between h-full'>
					<Link to='/' className='flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors'>
						<img src='/logo.png' alt='Reptile Global Logo' className='h-10 w-10' />
						<span className='font-bold text-xl'>Reptile Global</span>
					</Link>

					{/* Desktop Navigation */}
					

					{/* Desktop Actions */}
					<div className='hidden md:flex items-center space-x-4'>
						<LanguageSwitcher />
						
						{user ? (
							<div className='flex items-center space-x-4'>
								{user.role === 'admin' && (
									<Link
										to='/admin-dashboard'
										className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition duration-300 ease-in-out flex items-center'
									>
										<Lock className='mr-2 h-4 w-4' />
										{t('nav.dashboard')}
									</Link>
								)}
								
								<button
									onClick={logout}
									className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 ease-in-out flex items-center'
								>
									<LogOut className='mr-2 h-4 w-4' />
									{t('nav.logOut')}
								</button>
							</div>
						) : (
							<div className='flex items-center space-x-4'>
								
								<Link
									to='/login'
									className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
								>
									<LogIn className='mr-2 h-4 w-4' />
									{t('nav.login')}
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className='md:hidden flex items-center space-x-4'>
						<LanguageSwitcher />
						<button
							onClick={() => setIsOpen(!isOpen)}
							className='text-gray-300 hover:text-emerald-400 focus:outline-none focus:text-emerald-400'
						>
							{isOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isOpen && (
					<div className='md:hidden'>
						<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 bg-opacity-95 backdrop-blur-md'>
							{user ? (
								<div className='border-t border-gray-700 pt-4 mt-4'>
									{user.role === 'admin' && (
										<Link
											to='/admin-dashboard'
											className='block px-3 py-2 text-emerald-400 hover:text-emerald-300 transition duration-300 ease-in-out'
											onClick={() => setIsOpen(false)}
										>
											<Lock className='inline mr-2 h-4 w-4' />
											{t('nav.dashboard')}
										</Link>
									)}
									<Link
										to='/login'
										className='block px-3 py-2 text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
										onClick={() => setIsOpen(false)}
									>
										<Lock className='inline mr-2 h-4 w-4' />
										{t('nav.login')}
									</Link>
									<button
										onClick={() => {
											logout();
											setIsOpen(false);
										}}
										className='block w-full text-left px-3 py-2 text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
									>
										<LogOut className='inline mr-2 h-4 w-4' />
										{t('nav.logOut')}
									</button>
								</div>
							) : (
								<div className='border-t border-gray-700 pt-4 mt-4'>
									<Link
										to='/signup'
										className='block px-3 py-2 text-emerald-400 hover:text-emerald-300 transition duration-300 ease-in-out'
										onClick={() => setIsOpen(false)}
									>
										<UserPlus className='inline mr-2 h-4 w-4' />
										{t('nav.signUp')}
									</Link>
									<Link
										to='/login'
										className='block px-3 py-2 text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
										onClick={() => setIsOpen(false)}
									>
										<LogIn className='inline mr-2 h-4 w-4' />
										{t('nav.login')}
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Biometric Setup Prompt */}
			{showBiometricPrompt && biometricSupported && (
				<div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-40">
					<div className="flex items-start space-x-3">
						<Fingerprint className="h-6 w-6 text-emerald-500 mt-1" />
						<div className="flex-1">
							<h4 className="font-medium text-gray-900 text-sm">
								{t('biometric.setup.offer')}
							</h4>
							<p className="text-xs text-gray-600 mt-1">
								Use Face ID, Touch ID, or fingerprint for faster login.
							</p>
							<div className="flex space-x-2 mt-3">
								<button
									onClick={() => {
										setShowBiometricSetup(true);
										setShowBiometricPrompt(false);
									}}
									className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors"
								>
									Enable
								</button>
								<button
									onClick={() => {
										setShowBiometricPrompt(false);
										localStorage.setItem(`biometricPrompt_${user?.email}`, 'shown');
									}}
									className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-colors"
								>
									Later
								</button>
							</div>
						</div>
						<button
							onClick={() => {
								setShowBiometricPrompt(false);
								localStorage.setItem(`biometricPrompt_${user?.email}`, 'shown');
							}}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* Biometric Setup Modal */}
			{showBiometricSetup && (
				<BiometricSetup
					onClose={() => setShowBiometricSetup(false)}
					onSuccess={() => {
						localStorage.setItem(`biometricPrompt_${user?.email}`, 'shown');
						localStorage.setItem('lastBiometricEmail', user?.email);
					}}
				/>
			)}
		</header>
	);
};

export default Navbar;
