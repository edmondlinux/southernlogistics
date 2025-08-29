
import express from "express";
import {
	createShipment,
	updateShipmentStatus,
	updateShipment,
	getAllShipments,
	deleteShipment,
	getShipmentById,
	generateTrackingNumber
} from "../controllers/shipment.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(protectRoute, adminRoute);

// Admin shipment management routes
router.get("/generate-tracking", generateTrackingNumber);
router.post("/", createShipment);
router.get("/all", getAllShipments);
router.get("/:shipmentId", getShipmentById);
router.put("/:shipmentId/status", updateShipmentStatus);
router.put("/:shipmentId", updateShipment);
router.delete("/:shipmentId", deleteShipment);

export default router;
