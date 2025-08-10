import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function requireAuth(
	req: Request & { userId?: number },
	res: Response,
	next: NextFunction
) {
	try {
		const header = req.headers.authorization;
		if (!header?.startsWith("Bearer "))
			return res.status(401).json({ error: "Token faltante" });

		const token = header.split(" ")[1];
		const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };
		req.userId = payload.userId;
		next();
	} catch {
		return res.status(401).json({ error: "Token inválido" });
	}
}
