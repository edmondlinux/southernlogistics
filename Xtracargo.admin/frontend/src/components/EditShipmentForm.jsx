import { useState, useEffect } from "react";
import { useShipmentStore } from "../stores/useShipmentStore";
import { User, MapPin, X } from "lucide-react";
import StatusSection from "./forms/StatusSection";
import PersonInfoSection from "./forms/PersonInfoSection";
import PackageDetailsSection from "./forms/PackageDetailsSection";
import LocationSection from "./forms/LocationSection";
import ShippingOptionsSection from "./forms/ShippingOptionsSection";
import FormButtons from "./forms/FormButtons";

const EditShipmentForm = ({ shipment, onClose, onUpdate, ...props }) => {
	const { updateShipmentStatus, loading } = useShipmentStore();
	const [coordinates, setCoordinates] = useState(
		shipment.coordinates ? {
			latitude: parseFloat(Number(shipment.coordinates.latitude).toFixed(6)),
			longitude: parseFloat(Number(shipment.coordinates.longitude).toFixed(6))
		} : null
	);
	const [formData, setFormData] = useState({
		// Sender Information
		senderName: shipment.sender.name || "",
		senderEmail: shipment.sender.email || "",
		senderPhone: shipment.sender.phone || "",
		senderAddress: "",
		senderCity: "",
		senderState: "",
		senderZip: "",
		senderCountry: "",

		// Recipient Information
		recipientName: shipment.recipient.name || "",
		recipientEmail: shipment.recipient.email || "",
		recipientPhone: shipment.recipient.phone || "",
		recipientAddress: "",
		recipientCity: "",
		recipientState: "",
		recipientZip: "",
		recipientCountry: "",

		// Shipment Details
		packageType: shipment.packageDetails.type || "box",
		weight: shipment.packageDetails.weight || "",
		dimensions: {
			length: shipment.packageDetails.dimensions?.length || "",
			width: shipment.packageDetails.dimensions?.width || "",
			height: shipment.packageDetails.dimensions?.height || "",
		},
		value: shipment.packageDetails.value || "",
		description: shipment.packageDetails.description || "",
		specialInstructions: shipment.specialInstructions || "",

		// Shipping Options
		serviceType: shipment.serviceType || "standard",
		priority: shipment.priority || "normal",
		insurance: shipment.insurance || false,
		signatureRequired: shipment.signatureRequired || false,

		// Status and Location
		status: shipment.status || "pending",
		currentLocation: shipment.currentLocation || "",

		// Delivery Information
		shippingDate: shipment.shippingDate ? new Date(shipment.shippingDate).toISOString().split('T')[0] : "",
		estimatedDeliveryDate: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString().split('T')[0] : "",
		shippingCost: shipment.shippingCost || "",
	});

	// Parse addresses on component mount
	useEffect(() => {
		// Parse sender address
		if (shipment.sender.address) {
			const senderParts = shipment.sender.address.split(', ');
			setFormData(prev => ({
				...prev,
				senderAddress: senderParts[0] || "",
				senderCity: senderParts[1] || "",
				senderState: senderParts[2]?.split(' ')[0] || "",
				senderZip: senderParts[2]?.split(' ')[1] || "",
				senderCountry: senderParts[3] || "",
			}));
		}

		// Parse recipient address
		if (shipment.recipient.address) {
			const recipientParts = shipment.recipient.address.split(', ');
			setFormData(prev => ({
				...prev,
				recipientAddress: recipientParts[0] || "",
				recipientCity: recipientParts[1] || "",
				recipientState: recipientParts[2]?.split(' ')[0] || "",
				recipientZip: recipientParts[2]?.split(' ')[1] || "",
				recipientCountry: recipientParts[3] || "",
			}));
		}
	}, [shipment]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (name.includes("dimensions.")) {
			const dimField = name.split(".")[1];
			setFormData((prev) => ({
				...prev,
				dimensions: {
					...prev.dimensions,
					[dimField]: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const updatedShipmentData = {
			sender: {
				name: formData.senderName,
				email: formData.senderEmail,
				phone: formData.senderPhone,
				address: `${formData.senderAddress}, ${formData.senderCity}, ${formData.senderState} ${formData.senderZip}, ${formData.senderCountry}`,
			},
			recipient: {
				name: formData.recipientName,
				email: formData.recipientEmail,
				phone: formData.recipientPhone,
				address: `${formData.recipientAddress}, ${formData.recipientCity}, ${formData.recipientState} ${formData.recipientZip}, ${formData.recipientCountry}`,
			},
			packageDetails: {
				type: formData.packageType,
				weight: parseFloat(formData.weight),
				dimensions: {
					length: parseFloat(formData.dimensions.length),
					width: parseFloat(formData.dimensions.width),
					height: parseFloat(formData.dimensions.height),
				},
				value: parseFloat(formData.value),
				description: formData.description,
			},
			serviceType: formData.serviceType,
			priority: formData.priority,
			insurance: formData.insurance,
			signatureRequired: formData.signatureRequired,
			specialInstructions: formData.specialInstructions,
			status: formData.status,
			currentLocation: formData.currentLocation,
			shippingDate: formData.shippingDate ? new Date(formData.shippingDate) : null,
			estimatedDelivery: formData.estimatedDeliveryDate ? new Date(formData.estimatedDeliveryDate) : null,
			shippingCost: parseFloat(formData.shippingCost) || 0,
			coordinates: coordinates ? {
				latitude: parseFloat(Number(coordinates.latitude).toFixed(6)),
				longitude: parseFloat(Number(coordinates.longitude).toFixed(6))
			} : null,
		};

		try {
			await onUpdate(shipment._id, updatedShipmentData);
			onClose();
		} catch (error) {
			console.error("Failed to update shipment:", error);
		}
	};

	const { isInline = false } = props;

	const containerClass = isInline 
		? "bg-gray-800 rounded-lg p-6 w-full" 
		: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto";

	const formClass = isInline 
		? "space-y-8" 
		: "bg-gray-900 rounded-lg p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto";

	const content = (
		<>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-semibold text-emerald-400">
					Edit Shipment #{shipment.trackingNumber}
				</h2>
				{!isInline && (
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white p-2"
					>
						<X className="w-6 h-6" />
					</button>
				)}
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				<StatusSection 
					formData={formData} 
					handleInputChange={handleInputChange} 
				/>

				<PersonInfoSection
					title="Sender Information"
					icon={User}
					formData={formData}
					handleInputChange={handleInputChange}
					fieldPrefix="sender"
				/>

				<PersonInfoSection
					title="Recipient Information"
					icon={MapPin}
					formData={formData}
					handleInputChange={handleInputChange}
					fieldPrefix="recipient"
				/>

				<PackageDetailsSection 
					formData={formData} 
					handleInputChange={handleInputChange} 
				/>

				<LocationSection 
					coordinates={coordinates} 
					setCoordinates={setCoordinates} 
				/>

				<ShippingOptionsSection 
					formData={formData} 
					handleInputChange={handleInputChange} 
				/>

				<FormButtons
					loading={loading}
					isInline={isInline}
					onClose={onClose}
					submitText="Update Shipment"
				/>
			</form>
		</>
	);

	return isInline ? (
		<div className={containerClass}>
			{content}
		</div>
	) : (
		<div className={containerClass}>
			<div className={formClass}>
				{content}
			</div>
		</div>
	);
};

export default EditShipmentForm;