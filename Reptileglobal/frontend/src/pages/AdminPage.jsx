import { BarChart, Plus, Package, List, Search, Truck, Key, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";


import AnalyticsTab from "../components/AnalyticsTab";
import CreateShipmentForm from "../components/CreateShipmentForm";
import ShipmentsList from "../components/ShipmentsList";
import EditShipmentForm from "../components/EditShipmentForm";
import KYCMagicLinkGenerator from "../components/KYCMagicLinkGenerator";
import { useShipmentStore } from "../stores/useShipmentStore";


const tabs = [
	{ id: "create", label: "Create Shipment", icon: Plus },
	{ id: "shipments", label: "All Shipments", icon: Package },
	{ id: "drafts", label: "Draft Shipments", icon: List },
	{ id: "scheduled", label: "Scheduled Shipments", icon: Truck },
	{ id: "search", label: "Search & Edit", icon: Search },
	{ id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const [editingShipment, setEditingShipment] = useState(null);
	const { shipments, getAllShipments, getDraftShipments, getScheduledShipments, activateDraftShipment, processScheduledShipments } = useShipmentStore();

	useEffect(() => {
		if (activeTab === "shipments") {
			getAllShipments();
		} else if (activeTab === "drafts") {
			getDraftShipments();
		} else if (activeTab === "scheduled") {
			getScheduledShipments();
		}
	}, [activeTab, getAllShipments, getDraftShipments, getScheduledShipments]);

	const handleEditShipment = (shipment) => {
		setEditingShipment(shipment);
		setActiveTab("edit");
	};

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden pt-20'>
			<div className='relative z-10 container mx-auto px-4 py-16'>
				<motion.h1
					className='text-4xl font-bold mb-8 text-emerald-400 text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					Shipment Management Dashboard
				</motion.h1>

				<div className='flex justify-center mb-8 flex-wrap gap-2'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-2 mx-1 rounded-md transition-colors duration-200 ${
								activeTab === tab.id
									? "bg-emerald-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							<tab.icon className='mr-2 h-5 w-5' />
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === "create" && <CreateShipmentForm />}
				{activeTab === "shipments" && <ShipmentsList isAdmin={true} onEditShipment={handleEditShipment} />}
				{activeTab === "drafts" && <DraftShipmentsList />}
				{activeTab === "scheduled" && <ScheduledShipmentsList />}
				{activeTab === "search" && <SearchEditShipments />}
				{activeTab === "edit" && editingShipment && (
					<EditShipmentForm 
						shipment={editingShipment} 
						onUpdate={async (shipmentId, shipmentData) => {
							// Handle update logic here
							setEditingShipment(null);
							setActiveTab("shipments");
						}}
						onClose={() => {
							setEditingShipment(null);
							setActiveTab("shipments");
						}}
						isInline={true}
					/>
				)}
				{activeTab === "analytics" && <AnalyticsTab />}
			</div>
		</div>
	);
};

const DraftShipmentsList = () => {
	const { shipments, loading, activateDraftShipment, deleteShipment } = useShipmentStore();

	const handleActivateDraft = async (shipmentId) => {
		if (window.confirm("Are you sure you want to activate this draft shipment?")) {
			await activateDraftShipment(shipmentId);
		}
	};

	const handleDeleteDraft = async (shipmentId) => {
		if (window.confirm("Are you sure you want to delete this draft shipment?")) {
			await deleteShipment(shipmentId);
		}
	};

	if (loading) return <div className="text-center">Loading draft shipments...</div>;

	return (
		<div className="bg-gray-800 rounded-lg p-6">
			<h3 className="text-xl font-semibold text-emerald-400 mb-4">Draft Shipments</h3>
			{shipments.length === 0 ? (
				<p className="text-gray-400">No draft shipments found</p>
			) : (
				<div className="space-y-4">
					{shipments.map((shipment) => (
						<div key={shipment._id} className="bg-gray-700 rounded-lg p-4">
							<div className="flex justify-between items-start">
								<div>
									<h4 className="font-semibold text-emerald-400">#{shipment.trackingNumber}</h4>
									<p className="text-sm text-gray-300">{shipment.sender.name} → {shipment.recipient.name}</p>
									<p className="text-sm text-gray-400">Created: {new Date(shipment.createdAt).toLocaleDateString()}</p>
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => handleActivateDraft(shipment._id)}
										className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm transition duration-300"
									>
										Activate
									</button>
									<button
										onClick={() => handleDeleteDraft(shipment._id)}
										className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition duration-300"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const ScheduledShipmentsList = () => {
	const { shipments, loading, processScheduledShipments, deleteShipment } = useShipmentStore();

	const handleProcessScheduled = async () => {
		if (window.confirm("Process all scheduled shipments that are due?")) {
			await processScheduledShipments();
		}
	};

	const handleDeleteScheduled = async (shipmentId) => {
		if (window.confirm("Are you sure you want to delete this scheduled shipment?")) {
			await deleteShipment(shipmentId);
		}
	};

	if (loading) return <div className="text-center">Loading scheduled shipments...</div>;

	return (
		<div className="bg-gray-800 rounded-lg p-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-xl font-semibold text-emerald-400">Scheduled Shipments</h3>
				<button
					onClick={handleProcessScheduled}
					className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition duration-300"
				>
					Process Due Shipments
				</button>
			</div>
			{shipments.length === 0 ? (
				<p className="text-gray-400">No scheduled shipments found</p>
			) : (
				<div className="space-y-4">
					{shipments.map((shipment) => (
						<div key={shipment._id} className="bg-gray-700 rounded-lg p-4">
							<div className="flex justify-between items-start">
								<div>
									<h4 className="font-semibold text-emerald-400">#{shipment.trackingNumber}</h4>
									<p className="text-sm text-gray-300">{shipment.sender.name} → {shipment.recipient.name}</p>
									<p className="text-sm text-yellow-400">
										Scheduled: {new Date(shipment.scheduledDate).toLocaleString()}
									</p>
									<p className="text-sm text-gray-400">
										Status: {new Date(shipment.scheduledDate) <= new Date() ? "Due" : "Pending"}
									</p>
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => handleDeleteScheduled(shipment._id)}
										className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition duration-300"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const SearchEditShipments = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedShipment, setSelectedShipment] = useState(null);
	const [showKYCModal, setShowKYCModal] = useState(false);
	const [selectedShipmentForKYC, setSelectedShipmentForKYC] = useState(null);
	const { shipments, trackShipment, updateShipment, deleteShipment } = useShipmentStore();

	const filteredShipments = shipments.filter(shipment => 
		shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
		shipment.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		shipment.recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleShipmentUpdate = async (shipmentId, shipmentData) => {
		try {
			await updateShipment(shipmentId, shipmentData);
			setSelectedShipment(null);
		} catch (error) {
			console.error("Failed to update shipment:", error);
		}
	};

	const handleGenerateKYCLink = (shipment) => {
		setSelectedShipmentForKYC(shipment);
		setShowKYCModal(true);
	};

	const handleDeleteShipment = async (shipmentId) => {
		if (window.confirm("Are you sure you want to delete this shipment?")) {
			await deleteShipment(shipmentId);
		}
	};

	// If a shipment is selected for editing, render the edit form
	if (selectedShipment) {
		return (
			<EditShipmentForm 
				shipment={selectedShipment} 
				onUpdate={handleShipmentUpdate}
				onClose={() => setSelectedShipment(null)}
				isInline={true}
			/>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-gray-800 rounded-lg p-6">
				<h3 className="text-xl font-semibold text-emerald-400 mb-4">Search Shipments</h3>
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search by tracking number, sender, or recipient..."
					className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>

			{searchTerm && (
				<div className="bg-gray-800 rounded-lg p-6">
					<h3 className="text-xl font-semibold text-emerald-400 mb-4">Search Results</h3>
					{filteredShipments.length === 0 ? (
						<p className="text-gray-400">No shipments found</p>
					) : (
						<div className="space-y-4">
							{filteredShipments.map((shipment) => (
								<div key={shipment._id} className="bg-gray-700 rounded-lg p-4">
									<div className="flex justify-between items-start">
										<div>
											<h4 className="font-semibold text-emerald-400">#{shipment.trackingNumber}</h4>
											<p className="text-sm text-gray-300">{shipment.sender.name} → {shipment.recipient.name}</p>
											<p className="text-sm text-gray-400 capitalize">{shipment.status.replace('_', ' ')}</p>
										</div>
										<div className="flex space-x-2">
											<button
												onClick={() => handleGenerateKYCLink(shipment)}
												className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition duration-300 flex items-center"
												title="Generate KYC Magic Link"
											>
												<Key className="w-4 h-4" />
											</button>
											<button
												onClick={() => setSelectedShipment(shipment)}
												className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm transition duration-300"
											>
												Edit
											</button>
											<button
												onClick={() => handleDeleteShipment(shipment._id)}
												className='bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition duration-300'
												title="Delete Shipment"
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{showKYCModal && selectedShipmentForKYC && (
				<KYCMagicLinkGenerator
					shipment={selectedShipmentForKYC}
					onClose={() => {
						setShowKYCModal(false);
						setSelectedShipmentForKYC(null);
					}}
				/>
			)}
		</div>
	);
};

// The EditShipmentForm component is assumed to be imported correctly and handles all editable fields.
// The previous ShipmentEditForm component is no longer used.

export default AdminPage;