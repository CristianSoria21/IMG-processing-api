import type { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../db";
import { env } from "../config/env";
import { processImage } from "../services/jimp";
import { Jimp } from "jimp";

type RequestWithUser = Request & { userId?: number };
const PROCESSED_DIR = path.join(env.UPLOAD_DIR, "processed");
const extFromMime = (m?: string) =>
	m && (m.includes("jpeg") || m.includes("jpg")) ? ".jpg" : ".png";
const publicUrl = (dir: "original" | "processed", name: string) =>
	`${env.APP_URL}/static/${dir}/${name}`;
const toAbs = (p: string) =>
	path.isAbsolute(p) ? p : path.join(process.cwd(), p);

/** POST /images/process (protected) | form-data: image(File), options(JSON) */
export async function processAndSave(req: RequestWithUser, res: Response) {
	try {
		if (!req.userId) return res.status(401).json({ error: "No autorizado" });
		if (!req.file)
			return res.status(400).json({ error: "Falta 'image' (archivo)" });
		if (typeof req.body?.options === "undefined")
			return res.status(400).json({ error: "Falta 'options'" });

		await fs.mkdir(PROCESSED_DIR, { recursive: true });
		const originalPath = req.file.path;
		const originalName = path.basename(originalPath);
		const processedName = `${req.userId}-${Date.now()}${extFromMime(
			req.file.mimetype
		)}`;
		const processedPath = path.join(PROCESSED_DIR, processedName);

		const img = await Jimp.read(originalPath);
		processImage(img as any, req.body.options);
		await img.write(processedPath as `${string}.${string}`);

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

/** GET /images (protected) */
export async function listMyImages(req: RequestWithUser, res: Response) {
	const rows = await prisma.image.findMany({
		where: { userId: req.userId },
		orderBy: { createdAt: "desc" },
	});
	res.json(
		rows.map((i) => ({
			id: i.id,
			originalUrl: publicUrl("original", path.basename(i.originalPath)),
			processedUrl: publicUrl("processed", path.basename(i.processedPath)),
			createdAt: i.createdAt,
		}))
	);
}

/** DELETE /images/:id (protected) */
export async function deleteImage(req: RequestWithUser, res: Response) {
	try {
		if (!req.userId) return res.status(401).json({ error: "No autorizado" });
		const id = Number(req.params.id);
		if (!Number.isInteger(id))
			return res.status(400).json({ error: "ID inválido" });

		const img = await prisma.image.findFirst({
			where: { id, userId: req.userId },
		});
		if (!img) return res.status(404).json({ error: "Imagen no encontrada" });

		await Promise.allSettled([
			fs.unlink(toAbs(img.originalPath)),
			fs.unlink(toAbs(img.processedPath)),
		]);
		await prisma.image.delete({ where: { id } });

		return res.json({ ok: true, message: "Imagen eliminada" });
	} catch {
		return res.status(500).json({ error: "No se pudo eliminar la imagen" });
	}
}

/** PUT /images/:id (protected) | body: options(JSON|string) */
export async function updateImage(req: RequestWithUser, res: Response) {
	try {
		if (!req.userId) return res.status(401).json({ error: "No autorizado" });
		const id = Number(req.params.id);
		if (!Number.isInteger(id))
			return res.status(400).json({ error: "Id inválido" });
		if (typeof req.body?.options === "undefined")
			return res.status(400).json({ error: "Falta 'options'" });

		const row = await prisma.image.findFirst({
			where: { id, userId: req.userId },
			select: {
				id: true,
				originalPath: true,
				processedPath: true,
				createdAt: true,
			},
		});
		if (!row) return res.status(404).json({ error: "Imagen no encontrada" });

		await fs.mkdir(PROCESSED_DIR, { recursive: true });
		const img = await Jimp.read(toAbs(row.originalPath));
		processImage(img as any, req.body.options);

		const oldProcessedAbs = toAbs(row.processedPath);
		const processedName = `${req.userId}-${Date.now()}${
			path.extname(row.processedPath) || ".jpg"
		}`;
		const newProcessedRel = path.join(PROCESSED_DIR, processedName);
		await img.write(newProcessedRel as `${string}.${string}`);

		await prisma.image.update({
			where: { id: row.id },
			data: { processedPath: newProcessedRel },
		});
		fs.unlink(oldProcessedAbs).catch(() => {});

		return res.json({
			id: row.id,
			originalUrl: publicUrl("original", path.basename(row.originalPath)),
			processedUrl: publicUrl("processed", processedName),
			createdAt: row.createdAt,
			message: "Imagen reprocesada y sustituida",
		});
	} catch (e: any) {
		return res
			.status(400)
			.json({ error: e?.message || "Error al reprocesar la imagen" });
	}
}
