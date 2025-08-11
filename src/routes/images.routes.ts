import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env";
import { requireAuth } from "../middlewares/auth.middleware";
import { processAndSave, listMyImages } from "../controllers/images.controller";

const router = Router();

const storage = multer.diskStorage({
	destination: (_req, _file, cb) =>
		cb(null, path.join(env.UPLOAD_DIR, "original")),
	filename: (_req, file, cb) => {
		const id = crypto.randomBytes(8).toString("hex");
		const ext = path.extname(file.originalname) || ".jpg";
		cb(null, `${Date.now()}-${id}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const ok = ["image/jpeg", "image/png", "image/webp"].includes(
			file.mimetype
		);
		if (!ok) {
			const err = new Error("Unsupported media type");
			return cb(err as any, false);
		}
		return cb(null, true);
	},
});

router.post("/process", requireAuth, upload.single("image"), processAndSave);
router.get("/", requireAuth, listMyImages);

export default router;
