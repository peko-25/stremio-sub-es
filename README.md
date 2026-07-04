# Subtítulos Español + AI — Addon de Stremio

Un addon para **Stremio** que te muestra subtítulos en español automáticamente. Busca en **3 proveedores** distintos y, si no encuentra, traduce desde inglés usando **AI de NVIDIA**.

![v1.3.0](https://img.shields.io/badge/version-1.3.0-8B5CF6?style=flat-square)

---

## ✨ ¿Qué hace?

1. Abrís cualquier película o serie en Stremio
2. El addon busca subtítulos en español en **OpenSubtitles**, **SubDL** y **Subsource** al mismo tiempo
3. Si encuentra, te los muestra al toque
4. Si no hay español, descarga el inglés y lo **traduce automáticamente** línea por línea con NVIDIA Riva Translate
5. Todo en tu propia categoría "Subtítulos Español + AI"

---

## 🚀 Instalación rápida

### Requisitos
- [Stremio](https://www.stremio.com/) instalado
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Una API key de NVIDIA (gratis, explicado abajo)

### Pasos

1. **Descargá el proyecto**
   ```bash
   git clone https://github.com/peko-25/stremio-sub-es.git
   cd stremio-sub-es
   ```

2. **Instalá las dependencias**
   ```bash
   npm install
   ```

3. **Configurá las API keys**

   Copiá el archivo de ejemplo y completá tus keys:
   ```bash
   cp .env.example .env
   ```

   Abrí `.env` y agregá al menos la key de NVIDIA (las otras son opcionales):

   ```
   NVIDIA_API_KEY=nvapi-tu-key-de-nvidia
   SUBDL_API_KEY=tu-key-de-subdl          # opcional
   SUBSOURCE_API_KEY=tu-key-de-subsource  # opcional
   PORT=7000
   ```

   > **¿Dónde consigo las keys?**
   > - **NVIDIA** (obligatorio): andá a [build.nvidia.com](https://build.nvidia.com/nvidia/riva-translate-4b-instruct), creá cuenta, generá una API key. Gratis.
   > - **SubDL** (opcional): registrate en [subdl.com](https://subdl.com) → API → generá key. Gratis.
   > - **Subsource** (opcional): registrate en [subsource.net](https://subsource.net/api-docs) → API key. Gratis.

4. **Iniciá el servidor**
   ```bash
   node server.js
   ```

   Vas a ver:
   ```
   Addon running at http://127.0.0.1:7000/manifest.json
   Configure: http://127.0.0.1:7000/configure
   ```

5. **Instalá el addon en Stremio**

   - Abrí `http://127.0.0.1:7000/configure` en tu navegador
   - Elegí tus preferencias (modo, idioma, provider favorito)
   - Click en **"Copiar URL para Stremio"**
   - En Stremio: Addons → botón "Install Addon" → pegá la URL

---

## ⚙️ Modos de uso

| Modo | Qué hace |
|------|----------|
| **Automático** | Muestra el primer subtítulo en español que encuentre. Si no hay, traduce desde inglés. |
| **Separado** | Muestra **todos** los subtítulos en español de cada proveedor como opciones individuales (sin traducción AI). |

También podés elegir la variante de español:
- **Genérico** — español neutro
- **Latinoamérica** — la AI traduce a español latino
- **España** — la AI traduce a español europeo

---

## 📁 Estructura del proyecto

```
stremio-sub-es/
├── server.js                 # Servidor Express
├── addon.js                  # Lógica del addon de Stremio
├── config.js                 # Configuración global
├── configure.html            # Página de configuración
├── providers/
│   ├── opensubtitles.js      # OpenSubtitles vía strem.io
│   ├── subdl.js              # SubDL con API key
│   ├── subsource.js          # Subsource con API key
│   ├── translateAI.js        # Traducción con NVIDIA
│   └── srtParser.js          # Parseo de archivos SRT
├── cache/                    # Traducciones guardadas (se genera sola)
├── .env                      # Tus API keys (NO subir a GitHub)
└── package.json
```

---

## ❓ Preguntas frecuentes

**¿La primera vez tarda?**
Sí, la primera traducción puede tardar unos minutos porque traduce línea por línea. Las siguientes son instantáneas gracias al caché.

**¿Necesito tener el servidor siempre prendido?**
Mientras uses el addon, sí. El servidor corre en tu PC y Stremio se conecta a él. Podés cerrarlo cuando no lo uses.

**¿Los subtítulos traducidos son buenos?**
Sí, el modelo NVIDIA Riva Translate 4B está entrenado específicamente para traducción. Es rápido, preciso y respeta el formato original.

**¿Puedo cambiar la configuración después?**
Sí, volvé a `http://127.0.0.1:7000/configure`, ajustá las opciones y reinstalá el addon con el nuevo enlace.

---

## 🛠️ Tecnologías

- **Node.js** + **Express** — servidor
- **Stremio Addon SDK** — integración con Stremio
- **NVIDIA Riva Translate 4B** — traducción AI
- **OpenSubtitles**, **SubDL**, **Subsource** — proveedores de subtítulos

---

## 📄 Licencia

Proyecto personal de código abierto.
