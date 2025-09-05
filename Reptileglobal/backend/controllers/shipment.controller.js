import Shipment from "../models/shipment.model.js";
import EmailService from "../lib/emailService.js";

// Track a shipment by tracking number (public endpoint)
export const trackShipment = async (req, res) => {
	try {
		const { trackingNumber } = req.params;

		const shipment = await Shipment.findOne({ trackingNumber }).populate('user', 'name email');

		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}

		res.json(shipment);
	} catch (error) {
		console.log("Error in trackShipment controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get all shipments for logged-in user
export const getUserShipments = async (req, res) => {
	try {
		const shipments = await Shipment.find({ user: req.user._id }).sort({ createdAt: -1 });
		res.json(shipments);
	} catch (error) {
		console.log("Error in getUserShipments controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Create a new shipment
export const createShipment = async (req, res) => {
	try {
		const {
			trackingNumber,
			sender,
			recipient,
			packageDetails,
			serviceType,
			priority,
			insurance,
			signatureRequired,
			specialInstructions,
			shippingDate,
			estimatedDeliveryDate,
			shippingCost,
			coordinates
		} = req.body;

		// Use provided tracking number or generate one if not provided
		const finalTrackingNumber = trackingNumber || 'GL' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();

		const shipment = new Shipment({
			trackingNumber: finalTrackingNumber,
			user: req.user ? req.user._id : null, // Allow creation without user for admin
			sender,
			recipient,
			packageDetails,
			serviceType,
			priority,
			insurance,
			signatureRequired,
			specialInstructions,
			shippingDate,
			estimatedDelivery: estimatedDeliveryDate,
			shippingCost,
			coordinates,
			currentLocation: "Origin facility",
			trackingHistory: [{
				status: 'pending',
				location: 'Origin facility',
				timestamp: new Date(),
				notes: 'Shipment created'
			}]
		});

		const savedShipment = await shipment.save();

		// Send email notifications (non-transactional)
		const emailService = new EmailService();

		// Send email to sender (fire and forget)
		setImmediate(async () => {
			try {
				const result = await emailService.sendShipmentNotification(savedShipment, 'sender');
				if (result.success) {
					console.log(`Sender notification sent successfully for ${savedShipment.trackingNumber}`);
				}
			} catch (error) {
				console.error(`Failed to send sender notification for ${savedShipment.trackingNumber}:`, error);
			}
		});

		// Send email to recipient (fire and forget)
		setImmediate(async () => {
			try {
				const result = await emailService.sendShipmentNotification(savedShipment, 'recipient');
				if (result.success) {
					console.log(`Recipient notification sent successfully for ${savedShipment.trackingNumber}`);
				}
			} catch (error) {
				console.error(`Failed to send recipient notification for ${savedShipment.trackingNumber}:`, error);
			}
		});

		res.status(201).json(savedShipment);
	} catch (error) {
		console.log("Error in createShipment controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update shipment status
export const updateShipmentStatus = async (req, res) => {
	try {
		const { shipmentId } = req.params;
		const { status, location } = req.body;

		const shipment = await Shipment.findById(shipmentId);

		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}

		// Update status and location
		shipment.status = status;
		if (location) {
			shipment.currentLocation = location;
		}

		// Set actual delivery date if delivered
		if (status === 'delivered') {
			shipment.actualDelivery = new Date();
		}

		const updatedShipment = await shipment.save();
		res.json(updatedShipment);
	} catch (error) {
		console.log("Error in updateShipmentStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update entire shipment
export const updateShipment = async (req, res) => {
	try {
		const { shipmentId } = req.params;
		const updateData = req.body;

		const shipment = await Shipment.findById(shipmentId);

		if (!shipment) {
			return res.status(404).json({ message: "Shipment not found" });
		}

		// Update all provided fields
		Object.keys(updateData).forEach(key => {
			if (updateData[key] !== undefined) {
				shipment[key] = updateData[key];
			}
		});

		// Set actual delivery date if status changed to delivered
		if (updateData.status === 'delivered' && shipment.status !== 'delivered') {
			shipment.actualDelivery = new Date();
		}

		// Add tracking history entry if status changed
		if (updateData.status && updateData.status !== shipment.status) {
			shipment.trackingHistory.push({
				status: updateData.status,
				location: updateData.currentLocation || shipment.currentLocation,
				timestamp: new Date(),
				notes: 'Status updated'
			});
		}

		const updatedShipment = await shipment.save();
		res.json(updatedShipment);
	} catch (error) {
		console.log("Error in updateShipment controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};