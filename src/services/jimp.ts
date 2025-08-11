export type ProcessStep =
	| { type: "GREYSCALE" }
	| { type: "RESIZE"; width: number; height: number }
	| { type: "ROTATE"; deg: number };

type JimpLike = {
	greyscale: () => unknown;
	resize: (w: number, h: number) => unknown;
	rotate: (deg: number) => unknown;
};

export function processImage<T extends JimpLike>(
	image: T,
	rawSteps: unknown
): T {
	const data = typeof rawSteps === "string" ? JSON.parse(rawSteps) : rawSteps;

	if (!Array.isArray(data)) {
		throw new Error("Se esperaba un arreglo de pasos.");
	}

	const steps: ProcessStep[] = data.map((s, idx) => {
		const t = String((s as any).type ?? "")
			.toUpperCase()
			.trim();

		switch (t) {
			case "GREYSCALE":
			case "GRAYSCALE":
				return { type: "GREYSCALE" };

			case "RESIZE": {
				const { width, height } = s as { width: unknown; height: unknown };
				if (
					typeof width !== "number" ||
					!Number.isFinite(width) ||
					width <= 0
				) {
					throw new Error(
						`Paso[${idx}]: ancho inválido en RESIZE (debe ser un número positivo).`
					);
				}
				if (
					typeof height !== "number" ||
					!Number.isFinite(height) ||
					height <= 0
				) {
					throw new Error(
						`Paso[${idx}]: alto inválido en RESIZE (debe ser un número positivo).`
					);
				}
				return { type: "RESIZE", width, height };
			}

			case "ROTATE": {
				const { deg } = s as { deg: unknown };
				if (typeof deg !== "number" || !Number.isFinite(deg)) {
					throw new Error(
						`Paso[${idx}]: grados inválidos en ROTATE (debe ser un número finito).`
					);
				}
				return { type: "ROTATE", deg };
			}

			default:
				throw new Error(
					`Paso[${idx}]: tipo no soportado. Usa "GREYSCALE" | "RESIZE" | "ROTATE".`
				);
		}
	});

	for (const step of steps) {
		switch (step.type) {
			case "GREYSCALE":
				image.greyscale();
				break;
			case "RESIZE":
				image.resize({ w: step.width, h: step.height }); // ✅ firma posicional
				break;
			case "ROTATE":
				image.rotate(step.deg);
				break;
		}
	}

	return image;
}
