
import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useShipmentStore = create((set, get) => ({
	shipments: [],
	currentShipment: null,
	loading: false,

	// Create a new shipment
	createShipment: async (shipmentData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/shipments", shipmentData);
			set((state) => ({
				shipments: [res.data, ...state.shipments],
				loading: false
			}));
			toast.success("Shipment created successfully");
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to create shipment");
			throw error;
		}
	},

	// Update shipment status (admin only)
	updateShipmentStatus: async (shipmentId, status, location) => {
		set({ loading: true });
		try {
			const res = await axios.put(`/shipments/${shipmentId}/status`, { status, location });
			set((state) => ({
				shipments: state.shipments.map(shipment => 
					shipment._id === shipmentId ? res.data : shipment
				),
				currentShipment: state.currentShipment?._id === shipmentId ? res.data : state.currentShipment,
				loading: false
			}));
			toast.success("Shipment status updated successfully");
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to update shipment status");
			throw error;
		}
	},

	// Update entire shipment (admin only)
	updateShipment: async (shipmentId, shipmentData) => {
		set({ loading: true });
		try {
			const res = await axios.put(`/shipments/${shipmentId}`, shipmentData);
			set((state) => ({
				shipments: state.shipments.map(shipment => 
					shipment._id === shipmentId ? res.data : shipment
				),
				currentShipment: state.currentShipment?._id === shipmentId ? res.data : state.currentShipment,
				loading: false
			}));
			toast.success("Shipment updated successfully");
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to update shipment");
			throw error;
		}
	},

	// Get all shipments (admin only)
	getAllShipments: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/shipments/all");
			// Extract shipments array from response if it's in pagination format
			const shipmentsData = res.data.shipments || res.data;
			set({ shipments: shipmentsData, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to fetch shipments");
		}
	},

	// Delete shipment (admin only)
	deleteShipment: async (shipmentId) => {
		set({ loading: true });
		try {
			await axios.delete(`/shipments/${shipmentId}`);
			set((state) => ({
				shipments: state.shipments.filter(shipment => shipment._id !== shipmentId),
				currentShipment: state.currentShipment?._id === shipmentId ? null : state.currentShipment,
				loading: false
			}));
			toast.success("Shipment deleted successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to delete shipment");
			throw error;
		}
	},

	// Generate tracking number
	generateTrackingNumber: async () => {
		try {
			const res = await axios.get("/shipments/generate-tracking");
			return res.data.trackingNumber;
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to generate tracking number");
			throw error;
		}
	},

	// Clear current shipment
	clearCurrentShipment: () => {
		set({ currentShipment: null });
	},
}));
