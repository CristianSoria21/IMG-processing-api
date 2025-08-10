import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
	try {
		const { email, password } = req.body ?? {};
		if (!email || !password)
			return res
				.status(400)
				.json({ error: "El email y la contraseña son requeridos" });
		if (String(password).length < 6)
			return res
				.status(400)
				.json({ error: "La contraseña debe tener al menos 6 caracteres" });

		const exists = await prisma.user.findUnique({ where: { email } });
		if (exists)
			return res.status(409).json({ error: "El email ya está registrado" });

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({ data: { email, passwordHash } });

		const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
			expiresIn: "1d",
		});
		return res.status(201).json({ token, message: "registro exitoso" });
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: "Error al registrar usuario" });
	}
}

export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body ?? {};
		if (!email || !password)
			return res
				.status(400)
				.json({ error: "El email y la contraseña son requeridos" });

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

		const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
			expiresIn: "7d",
		});
		return res.json({ token, message: "Inicio de sesión exitoso" });
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: "Error al iniciar sesión" });
	}
}

export function logout(_req: Request, res: Response) {
	res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "lax" });

	return res.status(200).json({ ok: true, message: "Salio de la sesión" });
}
