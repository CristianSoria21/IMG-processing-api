import { Request, Response } from "express";

export function getHealth(_req: Request, res: Response) {
	res.json({
		ok: true,
		service: "img-processing-api",
		timestamp: new Date().toISOString(),
	});
}
