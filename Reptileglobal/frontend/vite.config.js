import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		allowedHosts: [
			"cb55267d-e3a8-48a3-b762-5f311052b5ea-00-11c4k57kf0mh3.worf.replit.dev"
		],
		proxy: {
			"/api": {
				target: "http://localhost:5000",
			},
		},
	},
});