import { z } from "zod";

const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color");

export const CoordenadasSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const TelefonoSchema = z.string().optional();

export const ConfigEncabezadoSchema = z.object({
  institucion: z.string().optional(),
  dependencia: z.string().optional(),
  logo_url: z.string().url().optional(),
  pie_pagina: z.string().optional(),
});

export const ConfigColoresSchema = z.object({
  primario: HexColorSchema.optional(),
  secundario: HexColorSchema.optional(),
  texto: HexColorSchema.optional(),
});

export const ConfigMargenesSchema = z.object({
  top: z.number().min(5).max(50).optional(),
  bottom: z.number().min(5).max(50).optional(),
  left: z.number().min(5).max(50).optional(),
  right: z.number().min(5).max(50).optional(),
});

export const ConfigSchema = z.object({
  encabezado: ConfigEncabezadoSchema.optional(),
  colores: ConfigColoresSchema.optional(),
  margenes: ConfigMargenesSchema.optional(),
});

export const TecnicoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  correo: z.string(),
});

export const BitacoraBaseDataSchema = z.object({
  id: z.string().uuid(),
  fecha: z.string(),
  horario_atencion: z.string(),
  pstyp: z.string(),
  municipio: z.string(),
  direccion: z.string(),
  localidad: z.string().optional(),
  coordenadas: CoordenadasSchema.optional(),
  telefono_principal: TelefonoSchema,
  telefono_secundario: TelefonoSchema,
  actividades_realizadas: z.string(),
  fotos: z.array(z.string().url()).default([]),
  tecnico: TecnicoSchema.optional(),
});

export const BeneficiarioDataSchema = BitacoraBaseDataSchema.extend({
  beneficiario_directo: z.string().optional(),
  beneficiarios_indirectos: z.array(z.string()).default([]),
  firma_beneficiario: z.string().url().optional(),
  rostro_beneficiario: z.string().url().optional(),
});

export const EncargadoSchema = z.object({
  nombre: z.string(),
  cargo: z.string(),
});

export const ActividadDataSchema = BitacoraBaseDataSchema.extend({
  actividad_nombre: z.string().optional(),
  actividad_descripcion: z.string().optional(),
  encargado: EncargadoSchema.optional(),
  firma_encargado: z.string().url().optional(),
  rostro_encargado: z.string().url().optional(),
});

export const GeneratePdfRequestSchema = z.object({
  bitacora_id: z.string().uuid(),
  tipo: z.enum(["beneficiario", "actividad"]).default("beneficiario"),
  template: z.enum(["default", "minimal", "detailed"]).default("default"),
  config: ConfigSchema.optional(),
  data: BeneficiarioDataSchema.or(ActividadDataSchema).optional(),
});

export const GenerateBeneficiarioPdfRequestSchema = z.object({
  bitacora_id: z.string().uuid(),
  template: z.enum(["default", "minimal", "detailed"]).default("default"),
  config: ConfigSchema.optional(),
  data: BeneficiarioDataSchema,
});

export const GenerateActividadPdfRequestSchema = z.object({
  bitacora_id: z.string().uuid(),
  template: z.enum(["default", "minimal", "detailed"]).default("default"),
  config: ConfigSchema.optional(),
  data: ActividadDataSchema,
});

export type HexColor = z.infer<typeof HexColorSchema>;
export type Coordenadas = z.infer<typeof CoordenadasSchema>;
export type ConfigEncabezado = z.infer<typeof ConfigEncabezadoSchema>;
export type ConfigColores = z.infer<typeof ConfigColoresSchema>;
export type ConfigMargenes = z.infer<typeof ConfigMargenesSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Tecnico = z.infer<typeof TecnicoSchema>;
export type BitacoraBaseData = z.infer<typeof BitacoraBaseDataSchema>;
export type BeneficiarioData = z.infer<typeof BeneficiarioDataSchema>;
export type Encargado = z.infer<typeof EncargadoSchema>;
export type ActividadData = z.infer<typeof ActividadDataSchema>;
export type GeneratePdfRequest = z.infer<typeof GeneratePdfRequestSchema>;
export type GenerateBeneficiarioPdfRequest = z.infer<
  typeof GenerateBeneficiarioPdfRequestSchema
>;
export type GenerateActividadPdfRequest = z.infer<
  typeof GenerateActividadPdfRequestSchema
>;

export interface AppContext {
  Variables: {
    auth: {
      id: string;
      email: string;
      rol: string;
    };
    requestId: string;
    validatedBody: unknown;
    validatedQuery: unknown;
  };
  Bindings: {
    // Empty - no external bindings needed
  };
}

export interface HealthStats {
  status: "ok" | "degraded" | "down";
  uptime: number;
  pagePool: {
    total: number;
    available: number;
    inUse: number;
  };
  timestamp: string;
}

export interface EnvConfig {
  PORT: number;
  JWT_SECRET: string;
  API_KEY_WEB: string;
  BROWSER_MAX_PAGES: number;
  BROWSER_TIMEOUT: number;
  BROWSER_IMG_TIMEOUT: number;
  CHROMIUM_PATH: string;
  LOG_LEVEL: string;
}