import "dotenv/config";

export const env = {
	PORT: Number(process.env.PORT ?? 8000),
	JWT_SECRET: String(process.env.JWT_SECRET ?? ""),
	APP_URL: String(process.env.APP_URL ?? "http://localhost:8000"),
	UPLOAD_DIR: String(process.env.UPLOAD_DIR ?? "uploads"),
	FRONTEND_URL: String(process.env.FRONTEND_URL ?? "http://localhost:3000"),
};
