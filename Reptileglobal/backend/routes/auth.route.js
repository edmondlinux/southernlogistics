
import express from "express";
import { login, logout, getProfile } from "../controllers/auth.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protectRoute, adminRoute, getProfile);

export default router;
