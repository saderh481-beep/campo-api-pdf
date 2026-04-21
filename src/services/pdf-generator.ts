import { type Page } from "puppeteer-core";
import { config } from "@/config/index.ts";
import { createRequestLogger } from "@/utils/logger.ts";
import { browserPool } from "./browser-pool.ts";
import { getBeneficiarioTemplate } from "@/templates/beneficiario.ts";
import { getActividadTemplate } from "@/templates/actividad.ts";
import { getStyles } from "@/templates/styles.ts";
import type {
  GeneratePdfRequest,
  Config,
  BeneficiarioData,
  ActividadData,
} from "@/types/index.ts";

interface GeneratePdfOptions {
  tipo: "beneficiario" | "actividad";
  template?: "default" | "minimal" | "detailed";
  config?: Config;
  data: BeneficiarioData | ActividadData;
  requestId: string;
}

export async function generatePdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { tipo, template = "default", config: customConfig, data, requestId } = options;
  const log = createRequestLogger(requestId);

  log.debug({ tipo, template }, "Generating PDF");

  const page = await browserPool.acquirePage();

  try {
    // Merge config with defaults
    const colors =
      tipo === "beneficiario"
        ? customConfig?.colores ?? {
            primario: "#1a5f2a",
            secundario: "#2e7d32",
            texto: "#333333",
          }
        : customConfig?.colores ?? {
            primario: "#1565c0",
            secundario: "#1976d2",
            texto: "#333333",
          };

    const styles = getStyles(colors);
    const html =
      tipo === "beneficiario"
        ? getBeneficiarioTemplate(data as BeneficiarioData, template, colors)
        : getActividadTemplate(data as ActividadData, template, colors);

    const fullHtml = `
<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitácora de Campo - ${tipo === "beneficiario" ? "Beneficiario" : "Actividad"}</title>
  <style>${styles}</style>
</head>
<body>
${html}
</body>
</html>
    `.trim();

    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    // Wait for images to load with timeout
    const imgTimeout = config.BROWSER_IMG_TIMEOUT;
    try {
      await page.evaluate(
        async (timeout) => {
          const images = Array.from(document.querySelectorAll("img"));
          const promises = images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.addEventListener("load", resolve);
              img.addEventListener("error", resolve);
              setTimeout(resolve, timeout);
            });
          });
          await Promise.all(promises);
        },
        imgTimeout
      );
    } catch {
      log.warn("Some images failed to load, continuing anyway");
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: customConfig?.margenes
        ? {
            top: `${customConfig.margenes.top ?? 20}mm`,
            bottom: `${customConfig.margenes.bottom ?? 20}mm`,
            left: `${customConfig.margenes.left ?? 20}mm`,
            right: `${customConfig.margenes.right ?? 20}mm`,
          }
        : {
            top: "20mm",
            bottom: "20mm",
            left: "20mm",
            right: "20mm",
          },
    });

    log.debug({ size: pdfBuffer.length }, "PDF generated successfully");

    return new Uint8Array(pdfBuffer);
  } finally {
    await browserPool.releasePage(page);
  }
}

export async function generatePdfFromRequest(
  request: GeneratePdfRequest,
  requestId: string
): Promise<Uint8Array> {
  if (!request.data) {
    throw new Error("Data is required for PDF generation");
  }

  return generatePdf({
    tipo: request.tipo,
    template: request.template,
    config: request.config,
    data: request.data as BeneficiarioData | ActividadData,
    requestId,
  });
}

export function validateDataForTipo(
  tipo: "beneficiario" | "actividad",
  data: BeneficiarioData | ActividadData | undefined
): boolean {
  if (!data) return false;

  if (tipo === "beneficiario") {
    return "beneficiario_directo" in data;
  }

  if (tipo === "actividad") {
    return "actividad_nombre" in data;
  }

  return false;
}