# Fusion Starter

Una plantilla de aplicación React full-stack lista para producción con servidor Express integrado, que incluye React Router 6 en modo SPA, TypeScript, Vitest, Zod y herramientas modernas.

Aunque el starter viene con un servidor express, solo crea endpoints cuando sea estrictamente necesario, por ejemplo para encapsular lógica que debe permanecer en el servidor, como manejo de claves privadas, o ciertas operaciones de DB, base de datos...

## Stack Tecnológico

- **Frontend**: React 18 + React Router 6 (spa) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Servidor Express integrado con servidor de desarrollo Vite
- **Pruebas**: Vitest
- **UI**: Radix UI + TailwindCSS 3 + iconos de Lucide React

## Estructura del Proyecto

```
client/                   # Frontend React SPA
├── pages/                # Componentes de rutas (Index.tsx = inicio)
├── components/ui/        # Biblioteca de componentes UI pre-construidos
├── main.tsx              # Punto de entrada de la app y configuración de enrutamiento SPA
└── global.css            # Temas de TailwindCSS 3 y estilos globales

server/                   # Backend API Express
├── index.ts              # Configuración principal del servidor (config express + rutas)
└── routes/               # Manejadores de API

shared/                   # Tipos usados por cliente y servidor
└── api.ts                # Ejemplo de cómo compartir interfaces de api
```

## Características Principales

## Sistema de Enrutamiento SPA

El sistema de enrutamiento está impulsado por React Router 6:

- `client/pages/Index.tsx` representa la página de inicio.
- Las rutas se definen en `client/App.tsx` usando la importación de `react-router-dom`
- Los archivos de rutas están ubicados en el directorio `client/pages/`

Por ejemplo, las rutas se pueden definir con:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* AGREGAR TODAS LAS RUTAS PERSONALIZADAS ARRIBA DE LA RUTA CATCH-ALL "*" */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Sistema de Estilos

- **Primario**: Clases utilitarias de TailwindCSS 3
- **Tema y tokens de diseño**: Configurar en `client/global.css`
- **Componentes UI**: Biblioteca pre-construida en `client/components/ui/`
- **Utilidad**: La función `cn()` combina `clsx` + `tailwind-merge` para clases condicionales

```typescript
// uso de utilidad cn
className={cn(
  "clases-base",
  { "clase-condicional": condicion },
  props.className  // Sobrescrituras del usuario
)}
```

### Integración del Servidor Express

- **Desarrollo**: Puerto único (8080) para frontend/backend
- **Hot reload**: Código tanto del cliente como del servidor
- **Endpoints API**: Con prefijo `/api/`

#### Ejemplos de Rutas API

- `GET /api/ping` - API ping simple
- `GET /api/demo` - Endpoint de demostración

### Tipos Compartidos

Importa tipos consistentes en cliente y servidor:

```typescript
import { DemoResponse } from "@shared/api";
```

Alias de rutas:

- `@shared/*` - Carpeta compartida
- `@/*` - Carpeta del cliente

## Comandos de Desarrollo

```bash
npm run dev        # Iniciar servidor de desarrollo (cliente + servidor)
npm run build      # Build de producción
npm run start      # Iniciar servidor de producción
npm run typecheck  # Validación de TypeScript
npm test          # Ejecutar pruebas Vitest
```

## Agregar Funcionalidades

### Agregar nuevos colores al tema

Abre `client/global.css` y `tailwind.config.ts` y agrega nuevos colores de tailwind.

### Nueva Ruta API

1. **Opcional**: Crea una interfaz compartida en `shared/api.ts`:

```typescript
export interface MyRouteResponse {
  message: string;
  // Agregar otras propiedades de respuesta aquí
}
```

2. Crea un nuevo manejador de ruta en `server/routes/my-route.ts`:

```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Opcional: para seguridad de tipos

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: "¡Hola desde mi endpoint!",
  };
  res.json(response);
};
```

3. Registra la ruta en `server/index.ts`:

```typescript
import { handleMyRoute } from "./routes/my-route";

// Agregar a la función createServer:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Usar en componentes React con seguridad de tipos:

```typescript
import { MyRouteResponse } from "@shared/api"; // Opcional: para seguridad de tipos

const response = await fetch("/api/my-endpoint");
const data: MyRouteResponse = await response.json();
```

### Nueva Ruta de Página

1. Crear componente en `client/pages/MyPage.tsx`
2. Agregar ruta en `client/main.tsx`:

```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Despliegue en Producción

- **Estándar**: `npm run build` + `npm start`
- **Docker**: Dockerfile incluido
- **Binario**: Ejecutables autocontenidos (Linux, macOS, Windows)
- Express sirve el React SPA construido con soporte de enrutamiento de respaldo

## Notas de Arquitectura

- Desarrollo de puerto único con integración Vite + Express
- TypeScript en todo (cliente, servidor, compartido)
- Hot reload completo para desarrollo rápido
- Listo para producción con múltiples opciones de despliegue
- Biblioteca completa de componentes UI incluida
- Comunicación API con seguridad de tipos vía interfaces compartidas
