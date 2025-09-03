import express from "express";
import {
	trackShipment,
	getUserShipments,
	createShipment,
	updateShipmentStatus,
	updateShipment,
	getAllShipments,
	deleteShipment,
	getShipmentById,
	generateTrackingNumber,
	getDraftShipments,
	getScheduledShipments,
	activateDraftShipment,
	processScheduledShipments,
} from "../controllers/shipment.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route for tracking
router.get("/track/:trackingNumber", trackShipment);

// Generate tracking number (admin only)
router.get("/generate-tracking", protectRoute, adminRoute, generateTrackingNumber);

// Protected routes (require authentication)
router.get("/user", protectRoute, getUserShipments);
router.post("/", protectRoute, createShipment);

// Admin only routes
router.get("/admin/all", protectRoute, adminRoute, getAllShipments);
router.get("/admin/drafts", protectRoute, adminRoute, getDraftShipments); // New route for drafts
router.get("/admin/scheduled", protectRoute, adminRoute, getScheduledShipments); // New route for scheduled shipments
router.get("/admin/:shipmentId", protectRoute, adminRoute, getShipmentById);
router.put("/:shipmentId/status", protectRoute, adminRoute, updateShipmentStatus);
router.put("/:shipmentId", protectRoute, adminRoute, updateShipment);
router.put("/:shipmentId/activate", protectRoute, adminRoute, activateDraftShipment); // New route to activate a draft
router.post("/admin/process-scheduled", protectRoute, adminRoute, processScheduledShipments); // New route to process scheduled shipments
router.delete("/admin/:shipmentId", protectRoute, adminRoute, deleteShipment);

export default router;