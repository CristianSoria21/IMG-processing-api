// src/controllers/images.controller.ts
import type { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../db";
import { env } from "../config/env";
import { processImage } from "../services/jimp";

type RequestWithUser = Request & { userId?: number };

const PROCESSED_DIR = path.join(env.UPLOAD_DIR, "processed");

function extFromMime(m?: string): ".png" | ".jpg" {
	return m && (m.includes("jpeg") || m.includes("jpg")) ? ".jpg" : ".png";
}

function publicUrl(subdir: "original" | "processed", filename: string) {
	return `${env.APP_URL}/static/${subdir}/${filename}`;
}

/**
 * POST /images/process (protegido)
 * form-data:
 *  - image: File
 *  - options: JSON
 */
export async function processAndSave(req: RequestWithUser, res: Response) {
	try {
		if (!req.userId) return res.status(401).json({ error: "No autorizado" });

		if (!req.file)
			return res.status(400).json({
				error: "El campo 'image' (archivo) es obligatorio en el formulario.",
			});
		if (typeof req.body?.options === "undefined") {
			return res.status(400).json({
				error:
					"El campo 'options' (opciones de procesamiento) es obligatorio en el formulario.",
			});
		}

		await fs.mkdir(PROCESSED_DIR, { recursive: true });
		const originalPath = req.file.path;
		const originalName = path.basename(originalPath);
		const processedName = `${req.userId}-${Date.now()}${extFromMime(
			req.file.mimetype
		)}`;
		const processedPath = path.join(PROCESSED_DIR, processedName);

		const { Jimp } = await import("jimp");
		const image = await Jimp.read(originalPath);
		processImage(image as any, req.body.options);
		await image.write(processedPath as `${string}.${string}`);

		const row = await prisma.image.create({
			data: { originalPath, processedPath, userId: req.userId },
		});

		return res.status(201).json({
			id: row.id,
			originalUrl: publicUrl("original", originalName),
			processedUrl: publicUrl("processed", processedName),
			createdAt: row.createdAt,
		});
	} catch (e: any) {
		return res
			.status(400)
			.json({ error: e?.message || "Error al procesar la imagen" });
	}
}

/**
 * GET /images (protegido)
 * Lista las imágenes del usuario con URLs públicas.
 */
export async function listMyImages(req: RequestWithUser, res: Response) {
	const rows = await prisma.image.findMany({
		where: { userId: req.userId },
		orderBy: { createdAt: "desc" },
	});

	const data = rows.map((i) => ({
		id: i.id,
		originalUrl: publicUrl("original", path.basename(i.originalPath)),
		processedUrl: publicUrl("processed", path.basename(i.processedPath)),
		createdAt: i.createdAt,
	}));

	res.json(data);
}
