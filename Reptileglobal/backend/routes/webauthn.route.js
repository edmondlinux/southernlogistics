
import express from "express";
import { 
  beginRegistration, 
  finishRegistration, 
  beginAuthentication, 
  finishAuthentication,
  getUserCredentials,
  deleteCredential
} from "../controllers/webauthn.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Registration routes (require authenticated user)
router.post("/register-begin", protectRoute, beginRegistration);
router.post("/register-finish", protectRoute, finishRegistration);

// Authentication routes (public)
router.post("/login-begin", beginAuthentication);
router.post("/login-finish", finishAuthentication);

// Credential management routes (require authenticated user)
router.get("/credentials", protectRoute, getUserCredentials);
router.delete("/credentials/:credentialId", protectRoute, deleteCredential);

export default router;
