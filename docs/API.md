# Documentación de la API

API REST para generación de PDFs de bitácoras de campo.

## Tabla de Contenidos

- [Endpoints](#endpoints)
- [Autenticación](#autenticación)
- [Esquemas de Datos](#esquemas-de-datos)
- [Respuestas](#respuestas)
- [Códigos de Error](#códigos-de-error)

---

## Endpoints

### Health Checks

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del servicio |
| GET | `/health` | Health check básico |
| GET | `/health/ready` | Health check con estado del navegador |
| GET | `/health/stats` | Estadísticas del pool de páginas |

#### GET /

Información básica del servicio.

```bash
curl http://localhost:3002/
```

**Respuesta:**
```json
{
  "service": "campo-api-pdf",
  "version": "1.0.0",
  "docs": "/health"
}
```

#### GET /health

Health check básico.

```bash
curl http://localhost:3002/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "service": "campo-api-pdf",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /health/ready

Health check con verificación del pool de Chromium.

```bash
curl http://localhost:3002/health/ready
```

**Respuesta:**
```json
{
  "status": "ready",
  "browser": "ready",
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "128MB",
    "rss": "89MB"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /health/stats

Estadísticas del pool de páginas del navegador.

```bash
curl http://localhost:3002/health/stats
```

**Respuesta:**
```json
{
  "uptime": "3600s",
  "pagePool": {
    "total": 3,
    "available": 2,
    "inUse": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Generación de PDFs

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/pdf/generate` | Genera PDF (inline) |
| POST | `/api/v1/pdf/generate/download` | Genera PDF (attachment) |
| POST | `/api/v1/pdf/generate/beneficiario` | Genera PDF beneficiario específico |
| POST | `/api/v1/pdf/generate/actividad` | Genera PDF actividad específico |

#### POST /api/v1/pdf/generate

Genera un PDF de bitácora de campo.

**Headers Requeridos:**
```
Authorization: Bearer <token>
```
Opcional:
```
X-API-Key: <api-key>
```

**Body:**

```json
{
  "bitacora_id": "uuid-de-la-bitacora",
  "tipo": "beneficiario" | "actividad",
  "template": "default" | "minimal" | "detailed",
  "config": {
    "encabezado": {
      "institucion": "Nombre de Institucion",
      "dependencia": "Dependencia",
      "logo_url": "https://...",
      "pie_pagina": "Texto pie"
    },
    "colores": {
      "primario": "#1a5f2a",
      "secundario": "#2e7d32",
      "texto": "#333333"
    },
    "margenes": {
      "top": 20,
      "bottom": 20,
      "left": 20,
      "right": 20
    }
  },
  "data": { ... }
}
```

**Ejemplo de Request:**

```bash
curl -X POST http://localhost:3002/api/v1/pdf/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-jwt-token" \
  -d '{
    "bitacora_id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "beneficiario",
    "template": "default",
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fecha": "2024-01-15",
      "horario_atencion": "09:00 - 14:00",
      "pstyp": "Ing. Juan Pérez",
      "municipio": "Pachuca",
      "direccion": "Calle Principal 123",
      "localidad": "Barrio La Loma",
      "coordenadas": { "lat": 20.1234, "lng": -98.1234 },
      "telefono_principal": "7711234567",
      "telefono_secundario": "7719876543",
      "actividades_realizadas": "Se realizó inspección técnica...",
      "fotos": ["https://ejemplo.com/foto1.jpg"],
      "tecnico": { "id": "1", "nombre": "Ing. Juan Pérez", "correo": "juan@ejemplo.com" },
      "beneficiario_directo": "María García López",
      "beneficiarios_indirectos": ["Pedro García", "Ana García"],
      "firma_beneficiario": "https://ejemplo.com/firma.png",
      "rostro_beneficiario": "https://ejemplo.com/rostro.jpg"
    }
  }'
```

**Respuesta:**

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `inline; filename="bitacora-beneficiario-{id}.pdf"`

---

#### POST /api/v1/pdf/generate/download

Igual que `/generate` pero con `Content-Disposition: attachment` para descarga directa.

```bash
curl -X POST http://localhost:3002/api/v1/pdf/generate/download \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-jwt-token" \
  -d '{ ... }' \
  -o bitacora.pdf
```

---

#### POST /api/v1/pdf/generate/beneficiario

Genera PDF de bitácora de tipo Beneficiario.

**Body:**

```json
{
  "bitacora_id": "uuid-de-la-bitacora",
  "template": "default" | "minimal" | "detailed",
  "config": { ... },
  "data": {
    "id": "uuid",
    "fecha": "2024-01-15",
    "horario_atencion": "09:00 - 14:00",
    "pstyp": "Nombre del Técnico",
    "municipio": "Municipio",
    "direccion": "Dirección",
    "localidad": "Localidad (opcional)",
    "coordenadas": { "lat": 0, "lng": 0 },
    "telefono_principal": "7711234567",
    "telefono_secundario": "7719876543 (opcional)",
    "actividades_realizadas": "Descripción de actividades",
    "fotos": ["url1", "url2"],
    "tecnico": { "id": "1", "nombre": "Técnico", "correo": "email" },
    "beneficiario_directo": "Nombre Beneficiario",
    "beneficiarios_indirectos": ["Nombre1", "Nombre2"],
    "firma_beneficiario": "url-firma",
    "rostro_beneficiario": "url-foto"
  }
}
```

**Respuesta:** PDF con `Content-Disposition: inline`

---

#### POST /api/v1/pdf/generate/actividad

Genera PDF de bitácora de tipo Actividad.

**Body:**

```json
{
  "bitacora_id": "uuid-de-la-bitacora",
  "template": "default" | "minimal" | "detailed",
  "config": { ... },
  "data": {
    "id": "uuid",
    "fecha": "2024-01-15",
    "horario_atencion": "09:00 - 14:00",
    "pstyp": "Nombre del Técnico",
    "municipio": "Municipio",
    "direccion": "Dirección",
    "localidad": "Localidad (opcional)",
    "coordenadas": { "lat": 0, "lng": 0 },
    "telefono_principal": "7711234567",
    "telefono_secundario": "7719876543 (opcional)",
    "actividades_realizadas": "Descripción de actividades",
    "fotos": ["url1", "url2"],
    "tecnico": { "id": "1", "nombre": "Técnico", "correo": "email" },
    "actividad_nombre": "Nombre de la Actividad",
    "actividad_descripcion": "Descripción de la Actividad",
    "encargado": { "nombre": "Nombre", "cargo": "Cargo" },
    "firma_encargado": "url-firma",
    "rostro_encargado": "url-foto"
  }
}
```

**Respuesta:** PDF con `Content-Disposition: inline`

---

## Autenticación

La API soporta dos métodos de autenticación:

### 1. JWT (Bearer Token)

```bash
curl -H "Authorization: Bearer tu-jwt-token" ...
```

El JWT debe contener los siguientes claims:
```json
{
  "sub": "user-id",
  "email": "user@email.com",
  "rol": "admin" | "user" | "service"
}
```

### 2. API Key

```bash
curl -H "X-API-Key: tu-api-key" ...
```

**Claves disponibles:**
- `API_KEY_WEB` - Para solicitudes desde la web
- `API_KEY_APP` - Para solicitudes desde la app móvil

---

## Esquemas de Datos

### Coordenadas

```typescript
{
  lat: number,    // Latitud (-90 a 90)
  lng: number     // Longitud (-180 a 180)
}
```

### Técnico

```typescript
{
  id: string,        // ID del técnico
  nombre: string,   // Nombre completo
  correo: string    // Email
}
```

### Encargado

```typescript
{
  nombre: string,   // Nombre del encargado
  cargo: string      // Cargo/Ocupación
}
```

### Configuración

```typescript
{
  encabezado?: {
    institucion?: string,
    dependencia?: string,
    logo_url?: string,
    pie_pagina?: string
  },
  colores?: {
    primario: "#HexColor",
    secundario: "#HexColor",
    texto: "#HexColor"
  },
  margenes?: {
    top: number,    // 5-50 mm
    bottom: number,
    left: number,
    right: number
  }
}
```

### Bitácora Base Data

```typescript
{
  id: string,                      // UUID
  fecha: string,                   // ISO date string
  horario_atencion: string,        // Horario "HH:MM - HH:MM"
  pstyp: string,                  // Nombre del técnico PSTyP
  municipio: string,              // Nombre del municipio
  direccion: string,              // Dirección completa
  localidad?: string,             // Localidad/Barrio
  coordenadas?: Coordenadas,
  telefono_principal: string,     // Teléfono principal
  telefono_secundario?: string,    // Teléfono secundario
  actividades_realizadas: string, // Descripción de actividades
  fotos: string[],               // URLs de fotos evidencia
  tecnico?: Tecnico
}
```

### Beneficiario Data (extiende Bitácora Base)

```typescript
{
  // ... campos de Bitácora Base
  beneficiario_directo: string,
  beneficiarios_indirectos: string[],
  firma_beneficiario?: string,
  rostro_beneficiario?: string
}
```

### Actividad Data (extiende Bitácora Base)

```typescript
{
  // ... campos de Bitácora Base
  actividad_nombre?: string,
  actividad_descripcion?: string,
  encargado?: Encargado,
  firma_encargado?: string,
  rostro_encargado?: string
}
```

---

## Respuestas

### Éxito

| Código | Descripción |
|--------|-------------|
| 200 | PDF generado correctamente |

### Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Autenticación fallida |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Códigos de Error

### 400 - Bad Request

```json
{
  "error": "BadRequestError",
  "message": "Data is required for PDF generation"
}
```

### 401 - Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication"
}
```

### 500 - Internal Server Error

```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred"
}
```

---

## Ejemplos Completos

### React

```javascript
const generatePdf = async (bitacoraData) => {
  const response = await fetch('http://localhost:3002/api/v1/pdf/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bitacoraData)
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitacora-${bitacoraData.tipo}.pdf`;
  a.click();
};
```

### Python

```python
import requests

def generate_pdf(bitacora_data: dict, token: str) -> bytes:
    response = requests.post(
        "http://localhost:3002/api/v1/pdf/generate",
        json=bitacora_data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    )
    return response.content
```

### cURL

```bash
# Generar PDF de beneficiario
curl -X POST http://localhost:3002/api/v1/pdf/generate/beneficiario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-token" \
  -d '{
    "bitacora_id": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fecha": "2024-01-15",
      "horario_atencion": "09:00 - 14:00",
      "pstyp": "Ing. Juan Pérez",
      "municipio": "Pachuca de Soto",
      "direccion": "Av. Independencia 100",
      "telefono_principal": "7711234567",
      "actividades_realizadas": "Se realizó asesoría técnica...",
      "beneficiario_directo": "María García"
    }
  }' \
  -o beneficiario.pdf
```

---

## Notas

- El campo `bitacora_id` debe ser un UUID válido
- Las URLs de fotos deben ser accesibles públicamente
- El formato de teléfono recomendado es a 10 dígitos
- Los colores deben ser en formato hexadecimal (#RRGGBB)
- Los márgenes se expresan en milímetros (mm)