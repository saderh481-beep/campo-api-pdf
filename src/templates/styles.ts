import type { ConfigColores } from "../types/index.ts";

export function getStyles(colors: ConfigColores): string {
  const primario = colors.primario ?? "#1a5f2a";
  const secundario = colors.secundario ?? "#2e7d32";
  const texto = colors.texto ?? "#333333";

  return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@page {
  size: A4;
  margin: 20mm;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.4;
  color: ${texto};
  background: white;
}

.container {
  max-width: 100%;
  padding: 10mm;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 3px solid ${primario};
}

.logo-container {
  width: 50px;
  height: 50px;
  background: ${primario};
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container svg {
  width: 40px;
  height: 40px;
}

.header-text h1 {
  font-size: 14pt;
  font-weight: 700;
  color: ${primario};
  margin-bottom: 2px;
}

.header-text h2 {
  font-size: 11pt;
  font-weight: 600;
  color: ${secundario};
  margin-bottom: 2px;
}

.header-text p {
  font-size: 9pt;
  color: #666;
}

/* Title */
.title-section {
  margin-bottom: 20px;
}

.title-section h1 {
  font-size: 18pt;
  font-weight: 700;
  color: ${primario};
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Sections */
.section {
  margin-bottom: 15px;
}

.section-header {
  background: ${primario};
  color: white;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 11pt;
  text-transform: uppercase;
}

.section-content {
  padding: 12px;
  border: 1px solid #ddd;
  border-top: none;
}

/* Data Grid */
.data-grid {
  display: table;
  width: 100%;
}

.data-row {
  display: table-row;
}

.data-label {
  display: table-cell;
  width: 35%;
  padding: 6px 10px;
  font-weight: 600;
  color: ${primario};
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.data-value {
  display: table-cell;
  width: 65%;
  padding: 6px 10px;
  border-bottom: 1px solid #eee;
}

/* Activities */
.activities-section {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid ${primario};
}

.activities-text {
  text-align: justify;
  line-height: 1.6;
}

/* Photos Grid */
.photos-section {
  margin-top: 20px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.photo-item {
  border: 1px solid #ddd;
  padding: 5px;
  background: white;
}

.photo-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.photo-caption {
  font-size: 8pt;
  color: #666;
  text-align: center;
  margin-top: 5px;
}

/* Validation Section (Signature + Photo) */
.validation-section {
  margin-top: 25px;
  page-break-inside: avoid;
}

.validation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.validation-item {
  text-align: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.validation-photo {
  width: 100px;
  height: 100px;
  margin: 0 auto 10px;
  border: 2px solid ${primario};
  border-radius: 50%;
  overflow: hidden;
  object-fit: cover;
}

.validation-signature {
  max-width: 150px;
  max-height: 60px;
  margin: 0 auto 10px;
}

.validation-name {
  font-weight: 600;
  font-size: 11pt;
  color: ${primario};
}

.validation-role {
  font-size: 9pt;
  color: #666;
}

/* Footer */
.footer {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  font-size: 9pt;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.footer-info {
  display: flex;
  gap: 20px;
}

.footer-item {
  display: flex;
  gap: 5px;
}

.footer-label {
  font-weight: 600;
  color: ${texto};
}

/* Empty state */
.no-photos {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.no-validation {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}
  `.trim();
}

export const DEFAULT_COLORS_BENEFICIARIO: ConfigColores = {
  primario: "#1a5f2a",
  secundario: "#2e7d32",
  texto: "#333333",
};

export const DEFAULT_COLORS_ACTIVIDAD: ConfigColores = {
  primario: "#1565c0",
  secundario: "#1976d2",
  texto: "#333333",
};