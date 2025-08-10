import "dotenv/config";

export const env = {
	PORT: Number(process.env.PORT ?? 8000),
	JWT_SECRET: String(process.env.JWT_SECRET ?? ""),
};
