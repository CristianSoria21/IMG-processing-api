import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function issueToken(userId: number) {
	return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * POST /auth/register
 * Body: { email, password }
 * Returns: { ok, token, user }
 */
export async function register(req: Request, res: Response) {
	try {
		let { email, password, name } = req.body ?? {};
		if (!email || !password || !name) {
			return res
				.status(400)
				.json({ error: "El email, la contraseña y el nombre son requeridos" });
		}
		email = String(email).trim().toLowerCase();
		name = String(name).trim();
		if (String(password).length < 6) {
			return res
				.status(400)
				.json({ error: "La contraseña debe tener al menos 6 caracteres" });
		}

		const exists = await prisma.user.findUnique({ where: { email } });
		if (exists)
			return res.status(409).json({ error: "El email ya está registrado" });

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, passwordHash, name },
		});

		const token = issueToken(user.id);
		return res.status(201).json({
			ok: true,
			token,
			user: { id: user.id, email: user.email, name: user.name },
			message: "Registro exitoso",
		});
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: "Error al registrar usuario" });
	}
}

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { ok, token, user }
 */
export async function login(req: Request, res: Response) {
	try {
		let { email, password } = req.body ?? {};
		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "El email y la contraseña son requeridos" });
		}
		email = String(email).trim().toLowerCase();

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

		const token = issueToken(user.id);
		return res.status(200).json({
			ok: true,
			token,
			user: { id: user.id, email: user.email, name: user.name },
			message: "Inicio de sesión exitoso",
		});
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: "Error al iniciar sesión" });
	}
}
