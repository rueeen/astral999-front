# Astral999 Frontend

Interfaz web mobile-first para Astral999, una aplicación de lecturas de tarot generadas con IA. Está construida con React, Vite y Axios, y consume la API de Django REST Framework.

## Requisitos

- Node.js 20 o superior
- npm
- El backend de Astral999 en ejecución

## Instalación y desarrollo

```bash
git clone <url-del-repositorio>
cd astral-front
npm install
cp .env.example .env
npm run dev
```

Vite mostrará la URL local de la aplicación (habitualmente `http://localhost:5173`).

## Variables de entorno

| Variable       | Descripción                          |
| -------------- | ------------------------------------ |
| `VITE_API_URL` | URL base del backend, sin `/` final. |

En desarrollo, usa `VITE_API_URL=http://localhost:8000`. En producción, configúrala con la URL pública del backend desplegado antes de ejecutar el build.

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # build optimizado en dist/
npm run preview  # previsualiza el build
npm run lint     # comprueba el código con ESLint
```

## Despliegue en Netlify

1. Importa el repositorio desde el panel de Netlify.
2. Configura `npm run build` como comando de build y `dist` como directorio de publicación.
3. Añade `VITE_API_URL` en **Site configuration → Environment variables**, apuntando al backend desplegado.
4. Despliega el sitio.

La regla SPA ya está incluida tanto en `public/_redirects` como en `netlify.toml`. Netlify responderá con `index.html` para rutas del cliente como `/cartas/el-loco` o `/s/:token`, evitando errores 404 al recargar.

## Autenticación

Los tokens JWT se almacenan en `localStorage`. `src/api.js` adjunta el access token a cada petición privada y, ante un `401`, intenta renovarlo una sola vez con el refresh token. Si la renovación falla, limpia la sesión.

Al cerrar sesión de forma intencional, el frontend envía el refresh token al endpoint de logout para que el backend lo añada a su lista negra y después elimina ambos tokens localmente, incluso si esa petición falla.

> **Deuda técnica de seguridad:** guardar tokens en `localStorage` los expone ante una vulnerabilidad XSS. Se debe migrar la autenticación a cookies `httpOnly`, `Secure` y con una política `SameSite` adecuada. Esta migración requiere que el backend emita, renueve y revoque esas cookies.

## Imágenes de cartas

Toda la lógica visual de las ilustraciones vive en `src/components/TarotCardImage.jsx`. Mientras `card.image` sea nulo se muestra una carta diseñada con CSS; cuando el backend sirva imágenes, no será necesario modificar las páginas ni los demás componentes.
