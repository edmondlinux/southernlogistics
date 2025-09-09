import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		allowedHosts: [
			"45350a35-9d80-423a-9fc3-0e3111b305b2-00-qo7e0judtoby.spock.replit.dev"
		],
		proxy: {
			"/api": {
				target: "http://localhost:5000",
			},
		},
	},
});