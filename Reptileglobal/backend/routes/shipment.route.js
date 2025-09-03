import express from "express";
import {
	trackShipment,
	getUserShipments,
	createShipment
} from "../controllers/shipment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route for tracking
router.get("/track/:trackingNumber", trackShipment);

// Protected routes (require authentication)
router.get("/user", protectRoute, getUserShipments);
router.post("/", protectRoute, createShipment);

export default router;