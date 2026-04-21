# Campo API PDF

API REST para generación de PDFs de bitácoras de campo del programa Hidalgo Primero El Pueblo.

## Requisitos

- **Node.js** >= 18
- **Bun** (runtime recomendado) o Node.js
- **Chromium** (para producción en serveur sin GUI)

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd campo-api-pdf
bun install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Puerto del servidor
PORT=3002

# Secreto JWT para autenticación (mínimo 32 caracteres)
JWT_SECRET=tu-secret-jwt-muy-largo-y-seguro-aqui

# Claves API para servicios externos
API_KEY_WEB=key-para-tu-web-app
API_KEY_APP=key-para-tu-app-mobile

# Configuración del navegador
BROWSER_MAX_PAGES=3
BROWSER_TIMEOUT=30000
BROWSER_IMG_TIMEOUT=10000

# Ruta a Chromium (opcional - en producción usar @sparticuz/chromium-min)
# CHROMIUM_PATH=/usr/bin/chromium

# Nivel de logs
LOG_LEVEL=info
```

### 3. Ejecutar el servidor

**Desarrollo:**
```bash
bun run dev
```

**Producción:**
```bash
bun run start
```

Opcionalmente con Docker:

```bash
# Construir imagen
bun run docker:build

# Ejecutar contenedor
bun run docker:run
```

El servidor estará disponible en `http://localhost:3002`

## Verificación

```bash
curl http://localhost:3002/health
curl http://localhost:3002/health/ready
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `bun run dev` | Inicia en modo desarrollo con watch |
| `bun run start` | Inicia el servidor producción |
| `bun run build` | Compila a JavaScript estático |
| `bun run docker:build` | Construye imagen Docker |
| `bun run docker:run` | Ejecuta contenedor Docker |