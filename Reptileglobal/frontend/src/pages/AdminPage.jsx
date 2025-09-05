

import { Package } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AdminPage = () => {
	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden pt-20'>
			<div className='relative z-10 container mx-auto px-4 py-16'>
				<motion.div
					className='text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<Package className='mx-auto h-16 w-16 text-emerald-400 mb-4' />
					<h1 className='text-4xl font-bold mb-4 text-emerald-400'>
						Access Restricted
					</h1>
					<p className='text-xl text-gray-300 mb-8'>
						Admin functionality has been moved to a separate admin portal.
					</p>
					<Link
						to='/'
						className='inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition duration-300'
					>
						Return to Home
					</Link>
				</motion.div>
			</div>
		</div>
	);
};

export default AdminPage;

