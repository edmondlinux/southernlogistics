
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import shipmentRoutes from "./routes/shipment.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({ status: "OK", message: "Admin server running" });
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "Reptileglobal/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "Reptileglobal", "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, "0.0.0.0", () => {
	console.log("Admin server running on port", PORT);
	connectDB();
});
