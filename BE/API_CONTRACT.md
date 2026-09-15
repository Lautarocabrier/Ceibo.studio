# Contrato de API — Backend Ceibo Studio (V0.1)

Base URL: `http://localhost:5000`  
Headers globales:
- `Content-Type: application/json`
- `Authorization: Bearer <token>` *(en rutas protegidas)*

---

## Índice de Endpoints

| Método | Endpoint | Alias | Autenticación | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | — | No | — | Estado del servidor |
| `POST` | `/api/auth/login` | `/login` | No | — | Iniciar sesión y obtener JWT |
| `GET` | `/api/auth/me` | `/me` | Sí (JWT) | Cualquiera | Obtener datos del usuario logueado |
| `GET` | `/api/clients` | `/clients` | Sí (JWT) | `SUPERADMIN` | Listar clientes activos / filtrados |
| `POST` | `/api/clients` | `/clients` | Sí (JWT) | `SUPERADMIN` | Crear nuevo cliente y su usuario |
| `GET` | `/api/clients/:id` | `/clients/:id` | Sí (JWT) | `SUPERADMIN` | Obtener detalle de un cliente |
| `PATCH`| `/api/clients/:id/status` | `/clients/:id/status` | Sí (JWT) | `SUPERADMIN` | Cambiar estado (active/inactive) |

---

## 1. Autenticación

### 1.1 Iniciar Sesión (`POST /login` o `POST /api/auth/login`)

Permite a cualquier usuario (Super Admin o Cliente) autenticarse mediante sus credenciales.

#### Request Body
```json
{
  "email": "admin@ceibo.studio",
  "password": "Admin123!"
}
```
> **Nota:** El backend acepta indistintamente las claves `"email"` o `"mail"`.

#### Respuestas

##### 200 OK — Super Admin
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm70abc1230001...",
    "email": "admin@ceibo.studio",
    "name": "Super Admin Ceibo",
    "role": "SUPERADMIN",
    "clientId": null,
    "clientName": null
  },
  "redirectTo": "/superadmin"
}
```

##### 200 OK — Cliente / Customer
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm70xyz890002...",
    "email": "cafe@ceibo.studio",
    "name": "Lucía Giménez",
    "role": "CUSTOMER",
    "clientId": "clt_98765...",
    "clientName": "Café de Especialidad San Telmo"
  },
  "redirectTo": "/customer"
}
```

##### 400 Bad Request — Datos faltantes
```json
{
  "success": false,
  "message": "Email y contraseña son obligatorios"
}
```

##### 401 Unauthorized — Credenciales inválidas
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

##### 403 Forbidden — Cliente inactivo
```json
{
  "success": false,
  "message": "La cuenta de cliente se encuentra inactiva o suspendida"
}
```

---

### 1.2 Verificar Sesión Actual (`GET /me` o `GET /api/auth/me`)

Permite al frontend validar y restaurar la sesión cuando el usuario recarga la aplicación.

#### Headers
```http
Authorization: Bearer <token>
```

#### Respuesta 200 OK
```json
{
  "success": true,
  "user": {
    "id": "cm70abc1230001...",
    "email": "admin@ceibo.studio",
    "name": "Super Admin Ceibo",
    "role": "SUPERADMIN",
    "clientId": null,
    "client": null,
    "createdAt": "2026-09-14T19:30:00.000Z"
  },
  "redirectTo": "/superadmin"
}
```

---

## 2. Gestión de Clientes (Super Admin)

> **Importante:** Todos los endpoints de clientes requieren el header:  
> `Authorization: Bearer <token_de_superadmin>`  
> Si se envía un token de otro rol (ej. `CUSTOMER`), el backend responde con código `403 Forbidden`.

### 2.1 Listar Clientes (`GET /clients` o `GET /api/clients`)

Retorna el listado de clientes ordenados descendentemente por fecha de creación.

#### Query Parameters (opcionales)
- `status`: 
  - `"active"` (predeterminado): solo clientes activos.
  - `"inactive"`: solo clientes dados de baja o pausados.
  - `"all"`: todos los clientes sin importar su estado.
- `search`: filtra coincidencias por nombre del negocio, email, encargado o teléfono.

Ejemplo: `GET /clients?status=active&search=palermo`

#### Respuesta 200 OK
```json
{
  "success": true,
  "count": 1,
  "clients": [
    {
      "id": "cm70xyz890002...",
      "name": "Café de Especialidad San Telmo",
      "email": "contacto@cafesantelmo.com",
      "phone": "+54 11 4321-8765",
      "contactName": "Lucía Giménez",
      "status": "active",
      "createdAt": "2026-09-14T19:35:00.000Z",
      "updatedAt": "2026-09-14T19:35:00.000Z",
      "users": [
        {
          "id": "usr_999...",
          "email": "contacto@cafesantelmo.com",
          "name": "Lucía Giménez",
          "role": "CUSTOMER",
          "createdAt": "2026-09-14T19:35:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 2.2 Crear Nuevo Cliente (`POST /clients` o `POST /api/clients`)

Crea la ficha del nuevo cliente. Los datos de acceso son opcionales; si se envían, también crea el primer usuario. Los administradores adicionales se crean desde los endpoints de usuarios del cliente.

#### Request Body
```json
{
  "name": "Café de Especialidad San Telmo",
  "email": "contacto@cafesantelmo.com",
  "phone": "+54 11 4321-8765",
  "contactName": "Lucía Giménez",
  "password": "Password123!"
}
```

Para crear únicamente el negocio:
```json
{
  "name": "Café de Especialidad San Telmo",
  "phone": "+54 11 4321-8765"
}
```

#### Nombres de campos alternativos aceptados:
- `email` o `mail`
- `phone` o `telefono`
- `contactName` o `encargado` o `nombreEncargado`
- `name` o `businessName` o `nombreNegocio` (si se omite, se usa `contactName`)
- `password` o `contraseña` (mínimo 6 caracteres)

#### Respuestas

##### 201 Created
```json
{
  "success": true,
  "message": "Cliente creado exitosamente",
  "client": {
    "id": "cm70xyz890002...",
    "name": "Café de Especialidad San Telmo",
    "email": "contacto@cafesantelmo.com",
    "phone": "+54 11 4321-8765",
    "contactName": "Lucía Giménez",
    "status": "active",
    "createdAt": "2026-09-14T19:35:00.000Z",
    "updatedAt": "2026-09-14T19:35:00.000Z",
    "assignedUser": {
      "id": "usr_999...",
      "email": "contacto@cafesantelmo.com",
      "name": "Lucía Giménez",
      "role": "CUSTOMER",
      "createdAt": "2026-09-14T19:35:00.000Z"
    }
  }
}
```

##### 400 Bad Request — Campo faltante o inválido
```json
{
  "success": false,
  "message": "La contraseña asignada debe tener al menos 6 caracteres"
}
```

##### 409 Conflict — Correo duplicado
```json
{
  "success": false,
  "message": "Ya existe un cliente registrado con ese correo electrónico"
}
```

---

### 2.3 Obtener Detalle de un Cliente (`GET /clients/:id`)

#### Parámetros de Ruta
- `id`: ID único del cliente.

#### Respuesta 200 OK
```json
{
  "success": true,
  "client": {
    "id": "cm70xyz890002...",
    "name": "Café de Especialidad San Telmo",
    "email": "contacto@cafesantelmo.com",
    "phone": "+54 11 4321-8765",
    "contactName": "Lucía Giménez",
    "status": "active",
    "createdAt": "2026-09-14T19:35:00.000Z",
    "users": [ ... ]
  }
}
```

---

### 2.4 Activar / Desactivar Cliente (`PATCH /clients/:id/status`)

Permite suspender o reactivar el acceso de un cliente.

#### Request Body
```json
{
  "status": "inactive"
}
```

### 2.5 Crear administrador (`POST /clients/:id/users`)

Crea un usuario `CUSTOMER` asociado al negocio. Requiere `email` y `password` de al menos 6 caracteres; `name` es opcional.

```json
{
  "email": "admin@negocio.com",
  "password": "Password123!",
  "name": "Admin del negocio"
}
```

### 2.6 Eliminar administrador (`DELETE /clients/:id/users/:userId`)

Elimina un usuario `CUSTOMER` únicamente si pertenece al negocio indicado.
*(Valores permitidos: `"active"` | `"inactive"`)*

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Cliente desactivado con éxito",
  "client": {
    "id": "cm70xyz890002...",
    "status": "inactive"
  }
}
```

---

## 3. Códigos de Estado Estándar

| Código | Significado | Causa común |
| :--- | :--- | :--- |
| `200` | OK | Petición completada con éxito |
| `201` | Created | Cliente y usuario creados exitosamente |
| `400` | Bad Request | Parámetros faltantes, email malformado o clave muy corta |
| `401` | Unauthorized | Falta token, token vencido o credenciales erróneas |
| `403` | Forbidden | El usuario no tiene rol `SUPERADMIN` o cuenta inactiva |
| `404` | Not Found | Cliente no encontrado o ruta inexistente |
| `409` | Conflict | El email ya está en uso por otro cliente o usuario |
| `500` | Internal Server Error | Error no controlado en el servidor |
