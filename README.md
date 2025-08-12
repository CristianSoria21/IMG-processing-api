# Image Processing API

## 📌 Resumen del Proyecto

Este proyecto es una API backend construida con **Node.js**, **Express** y **Prisma** para el procesamiento de imágenes utilizando la librería **Jimp**.  
Permite a los usuarios:

- Registrar y autenticar su cuenta.
- Subir imágenes originales y procesarlas aplicando transformaciones.
- Listar, eliminar y volver a procesar imágenes.
- Almacenar la información en una base de datos relacional.

## 📂 Estructura de Carpetas

```
.
├── src/
│   ├── controllers/       # Controladores de las rutas
│   ├── routes/            # Definición de rutas
│   ├── services/          # Lógica de negocio y utilidades
│   ├── db.ts              # Conexión a la base de datos Prisma
│   ├── config/            # Configuración de variables de entorno
│   └── index.ts           # Punto de entrada de la app
├── prisma/
│   ├── schema.prisma      # Definición del modelo de datos
│   └── migrations/        # Migraciones de la base de datos
├── uploads/
│   ├── original/          # Imágenes originales
│   └── processed/         # Imágenes procesadas
├── .env                   # Variables de entorno
├── package.json           # Dependencias y scripts
└── README.md              # Documentación del proyecto
```

## ⚙️ Requisitos Previos

- Node.js v18+
- npm o yarn
- Base de datos (MySQL, PostgreSQL u otra soportada por Prisma)
- Git

## 🚀 Instalación y Levantamiento del Proyecto

1. **Clonar el repositorio**

```bash
git clone <URL_DEL_REPO>
cd <NOMBRE_DEL_PROYECTO>
```

2. **Instalar dependencias**

```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
APP_URL=http://localhost:3000
UPLOAD_DIR=uploads
JWT_SECRET=<tu_llave_segura>
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_db"
```

4. **Ejecutar migraciones de Prisma**

```bash
npx prisma migrate dev
```

5. **Levantar el servidor**

```bash
npm run dev
```

6. **Acceder a la API**
   El servidor se ejecutará en:

```
http://localhost:3000
```

## 📜 Scripts Disponibles

- `npm run dev` → Levanta el servidor en modo desarrollo con **nodemon**.
- `npm run build` → Compila el código TypeScript a JavaScript.
- `npm start` → Inicia el servidor en producción.
- `npx prisma studio` → Abre Prisma Studio para gestionar la base de datos.

## 📌 Endpoints Principales

### Autenticación

- **POST** `/auth/register` → Registrar usuario.
- **POST** `/auth/login` → Iniciar sesión.

### Imágenes

- **POST** `/images/process` → Subir y procesar imagen.
- **GET** `/images` → Listar imágenes del usuario autenticado.
- **PUT** `/images/:id` → Reprocesar imagen existente.
- **DELETE** `/images/:id` → Eliminar imagen.

### POSTMAN

https://web.postman.co/workspace/e415c6ca-041c-4b68-8ef5-8e0b6744c45b/collection/37688920-c73c694e-a993-450c-a0d0-05f4bb00f39a?action=share&source=copy-link&creator=37688920

---

Desarrollado con ❤️ para gestión y procesamiento de imágenes.
