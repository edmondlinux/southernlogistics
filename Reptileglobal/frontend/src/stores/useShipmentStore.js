import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useShipmentStore = create((set, get) => ({
	shipments: [],
	currentShipment: null,
	loading: false,

	// Track a shipment by tracking number
	trackShipment: async (trackingNumber) => {
		set({ loading: true, currentShipment: null }); // Clear previous shipment
		try {
			const res = await axios.get(`/shipments/track/${trackingNumber}`);
			set({ currentShipment: res.data, loading: false });
			return res.data;
		} catch (error) {
			set({ loading: false, currentShipment: null });
			toast.error(error.response?.data?.message || "Shipment not found");
			throw error;
		}
	},

	// Get all shipments for logged in user
	getUserShipments: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/shipments/user");
			set({ shipments: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.toast.error(error.response?.data?.message || "Failed to fetch shipments");
		}
	},

	// Create a new shipment
	createShipment: async (shipmentData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/shipments", shipmentData);
			set((state) => ({
				shipments: [res.data, ...Array.from(state.shipments || [])],
				loading: false
			}));
			toast.success(`Shipment created successfully! Tracking #: ${res.data.trackingNumber}`);
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to create shipment");
			throw error;
		}
	},

	// Clear current shipment
	clearCurrentShipment: () => {
		set({ currentShipment: null });
	},
}));