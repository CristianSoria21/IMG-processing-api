import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
	console.log("\n==============================");
	console.log("🚀  API de image processing");
	console.log(`🌐  URL: http://localhost:${env.PORT}`);
	console.log("==============================\n");
});
