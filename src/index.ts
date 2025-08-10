import express from "express";
import "dotenv/config";

const app = express();
const PORT = Number(process.env.PORT || 8000);

app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

app.listen(PORT, () => {
	console.log(`API running on http://localhost:${PORT}`);
});
