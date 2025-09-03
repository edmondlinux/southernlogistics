
import express from "express";
import {
  getCloudinarySignature,
  submitKYC
} from "../controllers/kyc.controller.js";

const router = express.Router();

// Public route for KYC submission
router.post("/submit", submitKYC);

// Route for getting Cloudinary signature (public for magic link users)
router.post("/cloudinary-signature", getCloudinarySignature);

export default router;
