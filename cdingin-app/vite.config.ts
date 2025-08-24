import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
        allowedHosts: [
            "e7b0c36d0840.ngrok-free.app",
            // "https://7ee39c000159.ngrok-free.app",
        ],
    },
});
