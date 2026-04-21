import { Hono } from "hono";
import { generatePdfFromRequest, validateDataForTipo } from "../services/pdf-generator.ts";
import {
  GeneratePdfRequestSchema,
  GenerateBeneficiarioPdfRequestSchema,
  GenerateActividadPdfRequestSchema,
} from "../types/index.ts";
import { createRequestLogger } from "../utils/logger.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { AppError } from "../middleware/error-handler.ts";

const pdf = new Hono();

pdf.post("/generate", authMiddleware, async (c) => {
  const requestId = c.get("requestId") || "unknown";
  const log = createRequestLogger(requestId);

  try {
    const body = await c.req.json();
    const request = GeneratePdfRequestSchema.parse(body);

    if (!request.data) {
      throw new AppError(400, "Data is required for PDF generation");
    }

    if (!validateDataForTipo(request.tipo, request.data)) {
      throw new AppError(
        400,
        `Invalid data for tipo '${request.tipo}'. Expected ${request.tipo} data structure.`
      );
    }

    log.info(
      { bitacoraId: request.bitacora_id, tipo: request.tipo },
      "Generating PDF"
    );

    const pdfBuffer = await generatePdfFromRequest(request, requestId);

    // @ts-expect-error - Buffer type issue with Bun runtime
    return c.body(pdfBuffer, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bitacora-${request.tipo}-${request.bitacora_id}.pdf"`,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;

    log.error({ err }, "Error generating PDF");
    throw new AppError(500, "Failed to generate PDF");
  }
});

pdf.post("/generate/download", authMiddleware, async (c) => {
  const requestId = c.get("requestId") || "unknown";
  const log = createRequestLogger(requestId);

  try {
    const body = await c.req.json();
    const request = GeneratePdfRequestSchema.parse(body);

    if (!request.data) {
      throw new AppError(400, "Data is required for PDF generation");
    }

    if (!validateDataForTipo(request.tipo, request.data)) {
      throw new AppError(
        400,
        `Invalid data for tipo '${request.tipo}'. Expected ${request.tipo} data structure.`
      );
    }

    log.info(
      { bitacoraId: request.bitacora_id, tipo: request.tipo },
      "Generating PDF for download"
    );

    const pdfBuffer = await generatePdfFromRequest(request, requestId);

    // @ts-expect-error - Buffer type issue with Bun runtime
    return c.body(pdfBuffer, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bitacora-${request.tipo}-${request.bitacora_id}.pdf"`,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;

    log.error({ err }, "Error generating PDF for download");
    throw new AppError(500, "Failed to generate PDF");
  }
});

pdf.post("/generate/beneficiario", authMiddleware, async (c) => {
  const requestId = c.get("requestId") || "unknown";
  const log = createRequestLogger(requestId);

  try {
    const body = await c.req.json();
    const request = GenerateBeneficiarioPdfRequestSchema.parse(body);

    log.info(
      { bitacoraId: request.bitacora_id },
      "Generating beneficiario PDF"
    );

    const enrichedRequest = {
      bitacora_id: request.bitacora_id,
      tipo: "beneficiario" as const,
      template: request.template,
      config: request.config,
      data: request.data,
    };

    const pdfBuffer = await generatePdfFromRequest(enrichedRequest, requestId);

    // @ts-expect-error - Bun Buffer type
    return c.body(pdfBuffer, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bitacora-beneficiario-${request.bitacora_id}.pdf"`,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;

    log.error({ err }, "Error generating beneficiario PDF");
    throw new AppError(500, "Failed to generate PDF");
  }
});

pdf.post("/generate/actividad", authMiddleware, async (c) => {
  const requestId = c.get("requestId") || "unknown";
  const log = createRequestLogger(requestId);

  try {
    const body = await c.req.json();
    const request = GenerateActividadPdfRequestSchema.parse(body);

    log.info(
      { bitacoraId: request.bitacora_id },
      "Generating actividad PDF"
    );

    const enrichedRequest = {
      bitacora_id: request.bitacora_id,
      tipo: "actividad" as const,
      template: request.template,
      config: request.config,
      data: request.data,
    };

    const pdfBuffer = await generatePdfFromRequest(enrichedRequest, requestId);

    // @ts-expect-error - Bun Buffer type
    return c.body(pdfBuffer, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bitacora-actividad-${request.bitacora_id}.pdf"`,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;

    log.error({ err }, "Error generating actividad PDF");
    throw new AppError(500, "Failed to generate PDF");
  }
});

export default pdf;