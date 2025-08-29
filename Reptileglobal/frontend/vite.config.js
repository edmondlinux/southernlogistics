import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		allowedHosts: [
			"b6ec1144-77e3-4aff-b800-3deb9779e7fd-00-1e7kiwm80gtxd.worf.replit.dev"
		],
		proxy: {
			"/api": {
				target: "http://localhost:5000",
			},
		},
	},
});