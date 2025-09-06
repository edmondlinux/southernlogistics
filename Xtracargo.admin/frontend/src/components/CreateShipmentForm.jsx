
import { useState, useEffect } from "react";
import { useShipmentStore } from "../stores/useShipmentStore";
import { User, MapPin } from "lucide-react";
import StatusSection from "./forms/StatusSection";
import PersonInfoSection from "./forms/PersonInfoSection";
import PackageDetailsSection from "./forms/PackageDetailsSection";
import LocationSection from "./forms/LocationSection";
import ShippingOptionsSection from "./forms/ShippingOptionsSection";
import FormButtons from "./forms/FormButtons";

const CreateShipmentForm = () => {
	const { createShipment, generateTrackingNumber, loading } = useShipmentStore();
	const [coordinates, setCoordinates] = useState(null);
	const [generatedTrackingNumber, setGeneratedTrackingNumber] = useState(null);
	const [formData, setFormData] = useState({
		// Sender Information
		senderName: "",
		senderEmail: "",
		senderPhone: "",
		senderAddress: "",
		senderCity: "",
		senderState: "",
		senderZip: "",
		senderCountry: "",

		// Recipient Information
		recipientName: "",
		recipientEmail: "",
		recipientPhone: "",
		recipientAddress: "",
		recipientCity: "",
		recipientState: "",
		recipientZip: "",
		recipientCountry: "",

		// Shipment Details
		packageType: "box",
		weight: "",
		dimensions: {
			length: "",
			width: "",
			height: "",
		},
		value: "",
		description: "",
		specialInstructions: "",

		// Shipping Options
		serviceType: "standard",
		priority: "normal",
		insurance: false,
		signatureRequired: false,

		// Status and Location
		status: "pending",
		currentLocation: "",

		// Delivery Information
		shippingDate: "",
		estimatedDeliveryDate: "",
		shippingCost: "",
	});

	useEffect(() => {
		const generateInitialTrackingNumber = async () => {
			try {
				const trackingNumber = await generateTrackingNumber();
				setGeneratedTrackingNumber(trackingNumber);
			} catch (error) {
				console.error("Failed to generate tracking number:", error);
			}
		};

		generateInitialTrackingNumber();
	}, [generateTrackingNumber]);
	
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

		const shipmentData = {
			trackingNumber: generatedTrackingNumber,
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
				latitude: Number(coordinates.latitude),
				longitude: Number(coordinates.longitude)
			} : null,
		};

		try {
			await createShipment(shipmentData);
			// Reset form
			setFormData({
				senderName: "",
				senderEmail: "",
				senderPhone: "",
				senderAddress: "",
				senderCity: "",
				senderState: "",
				senderZip: "",
				senderCountry: "",
				recipientName: "",
				recipientEmail: "",
				recipientPhone: "",
				recipientAddress: "",
				recipientCity: "",
				recipientState: "",
				recipientZip: "",
				recipientCountry: "",
				packageType: "box",
				weight: "",
				dimensions: { length: "", width: "", height: "" },
				value: "",
				description: "",
				specialInstructions: "",
				serviceType: "standard",
				priority: "normal",
				insurance: false,
				signatureRequired: false,
				status: "pending",
				currentLocation: "",
				shippingDate: "",
				estimatedDeliveryDate: "",
				shippingCost: "",
			});
			setCoordinates(null);
			// Generate new tracking number for next shipment
			const newTrackingNumber = await generateTrackingNumber();
			setGeneratedTrackingNumber(newTrackingNumber);
		} catch (error) {
			console.error("Failed to create shipment:", error);
		}
	};

	return (
		<div className="bg-gray-800 rounded-lg p-6 w-full">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-semibold text-emerald-400">
					Create New Shipment
				</h2>
				{generatedTrackingNumber && (
					<div className="text-sm text-gray-300">
						Tracking Number: <span className="text-emerald-400 font-mono">{generatedTrackingNumber}</span>
					</div>
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
					isInline={true}
					submitText="Create Shipment"
				/>
			</form>
		</div>
	);
};

export default CreateShipmentForm;
