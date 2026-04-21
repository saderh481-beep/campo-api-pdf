import type { ActividadData, ConfigColores } from "../types/index.ts";
import { formatDate, formatPhone } from "../utils/helpers.ts";

export function getActividadTemplate(
  data: ActividadData,
  template: "default" | "minimal" | "detailed",
  colors: ConfigColores
): string {
  const primario = colors.primario ?? "#1565c0";
  const secundario = colors.secundario ?? "#1976d2";

  const fecha = formatDate(data.fecha);
  const telefono = data.telefono_principal
    ? formatPhone(data.telefono_principal)
    : "No disponible";

  const fotosHtml = data.fotos.length > 0
    ? data.fotos
        .map(
          (url, idx) => `
        <div class="photo-item">
          <img src="${url}" alt="Foto ${idx + 1}" />
          <div class="photo-caption">Evidencia ${idx + 1}</div>
        </div>
      `
        )
        .join("")
    : '<div class="no-photos">Sin evidencia fotográfica</div>';

  const validationHtml = `
    <div class="validation-section">
      <div class="section-header">Validación</div>
      <div class="validation-grid">
        <div class="validation-item">
          ${
            data.rostro_encargado
              ? `
            <img src="${data.rostro_encargado}" alt="Rostro" class="validation-photo" />
          `
              : '<div class="no-validation">Sin fotografía</div>'
          }
          <div class="validation-name">${data.encargado?.nombre || "Encargado"}</div>
          <div class="validation-role">${data.encargado?.cargo || "Encargado de Actividad"}</div>
        </div>
        <div class="validation-item">
          ${
            data.firma_encargado
              ? `
            <img src="${data.firma_encargado}" alt="Firma" class="validation-signature" />
          `
              : '<div class="no-validation">Sin firma</div>'
          }
          <div class="validation-name">${data.encargado?.nombre || "Encargado"}</div>
          <div class="validation-role">Firma</div>
        </div>
      </div>
    </div>
  `;

  return `
<!-- Header -->
<div class="header">
  <div class="logo-container">
    <svg viewBox="0 0 100 100" fill="white">
      <circle cx="50" cy="50" r="45" fill="white"/>
      <text x="50" y="60" text-anchor="middle" font-size="45" font-weight="bold" fill="${primario}">C</text>
    </svg>
  </div>
  <div class="header-text">
    <h1>HIDALGO PRIMERO EL PUEBLO</h1>
    <h2>CAMPO - Secretaría de Desarrollo Agropecuario</h2>
    <p>Hidalgo, México</p>
  </div>
</div>

<!-- Title -->
<div class="title-section">
  <h1>Bitácora de Campo - Actividad</h1>
</div>

<!-- Datos Generales -->
<div class="section">
  <div class="section-header">Datos Generales</div>
  <div class="section-content">
    <div class="data-grid">
      <div class="data-row">
        <div class="data-label">Fecha de Actividad</div>
        <div class="data-value">${fecha}</div>
      </div>
      <div class="data-row">
        <div class="data-label">Horario</div>
        <div class="data-value">${data.horario_atencion}</div>
      </div>
      <div class="data-row">
        <div class="data-label">Técnico PSTyP</div>
        <div class="data-value">${data.pstyp}</div>
      </div>
      ${
        data.actividad_nombre
          ? `
      <div class="data-row">
        <div class="data-label">Nombre de Actividad</div>
        <div class="data-value">${data.actividad_nombre}</div>
      </div>
      `
          : ""
      }
      ${
        data.actividad_descripcion
          ? `
      <div class="data-row">
        <div class="data-label">Descripción</div>
        <div class="data-value">${data.actividad_descripcion}</div>
      </div>
      `
          : ""
      }
      ${
        data.encargado
          ? `
      <div class="data-row">
        <div class="data-label">Encargado</div>
        <div class="data-value">${data.encargado.nombre} - ${data.encargado.cargo}</div>
      </div>
      `
          : ""
      }
    </div>
  </div>
</div>

<!-- Ubicación -->
<div class="section">
  <div class="section-header">Ubicación</div>
  <div class="section-content">
    <div class="data-grid">
      <div class="data-row">
        <div class="data-label">Municipio</div>
        <div class="data-value">${data.municipio}</div>
      </div>
      <div class="data-row">
        <div class="data-label">Dirección</div>
        <div class="data-value">${data.direccion}</div>
      </div>
      ${
        data.localidad
          ? `
      <div class="data-row">
        <div class="data-label">Localidad</div>
        <div class="data-value">${data.localidad}</div>
      </div>
      `
          : ""
      }
      ${
        data.coordenadas
          ? `
      <div class="data-row">
        <div class="data-label">Coordenadas</div>
        <div class="data-value">${data.coordenadas.lat}, ${data.coordenadas.lng}</div>
      </div>
      `
          : ""
      }
      <div class="data-row">
        <div class="data-label">Teléfono</div>
        <div class="data-value">${telefono}</div>
      </div>
    </div>
  </div>
</div>

<!-- Actividades Realizadas -->
<div class="section">
  <div class="section-header">Actividades Realizadas</div>
  <div class="activities-section">
    <div class="activities-text">${data.actividades_realizadas}</div>
  </div>
</div>

<!-- Evidencia Fotográfica -->
<div class="photos-section">
  <div class="section-header">Evidencia Fotográfica</div>
  <div class="photos-grid">
    ${fotosHtml}
  </div>
</div>

<!-- Validación (AL FINAL) -->
${validationHtml}

<!-- Footer -->
<div class="footer">
  <div class="footer-info">
    <div class="footer-item">
      <span class="footer-label">Técnico:</span>
      <span>${data.tecnico?.nombre || "No especificado"}</span>
    </div>
    <div class="footer-item">
      <span class="footer-label">ID:</span>
      <span>${data.id}</span>
    </div>
  </div>
  <div class="footer-item">
    <span class="footer-label">Generado:</span>
    <span>${new Date().toLocaleString("es-MX")}</span>
  </div>
</div>
  `.trim();
}