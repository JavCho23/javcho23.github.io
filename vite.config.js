import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    server: {
        // permite que herramientas externas asignen el puerto via PORT
        port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
})
