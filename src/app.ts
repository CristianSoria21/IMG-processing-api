import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import imagesRoutes from "./routes/images.routes";

const app = express();

app.use(
	cors({
		origin: env.FRONTEND_URL,
		credentials: true,
	})
);

app.use(express.json());

function ensureUploadDirs() {
	const base = env.UPLOAD_DIR;
	const original = path.join(base, "original");
	const processed = path.join(base, "processed");
	if (!fs.existsSync(base)) fs.mkdirSync(base);
	if (!fs.existsSync(original)) fs.mkdirSync(original);
	if (!fs.existsSync(processed)) fs.mkdirSync(processed);
}

ensureUploadDirs();

// Rutas
app.use("/auth", authRoutes);
app.use("/images", imagesRoutes);

// Servir imágenes estáticas
app.use("/static", express.static(env.UPLOAD_DIR));

export default app;
