# Propuesta de modelo de datos — Ceibo Studio

## Contexto

Esta propuesta se basa en:

- El código existente del repositorio `Lautarocabrier/Ceibo.studio`.
- El esquema actual de Prisma en `BE/prisma/schema.prisma`.
- El contrato de API definido en `BE/API_CONTRACT.md`.
- El documento de producto `PRD — Plataforma de Activación del Talento V0.1.md`.
- Las decisiones de arquitectura sobre prevención de auto-reconocimiento (anti-fraude) y captación de clientes (CRM/Leads).

La rama actual implementa principalmente autenticación básica, Super Admin, clientes y usuarios administradores. El PRD y el modelo de negocio requieren además sucursales, empleados, clientes finales (CRM), feedback verificado, eventos de desempeño, reconocimientos, puntos, reglas, recompensas y códigos QR.

## 1. Modelo actual vs. Modelo propuesto

Actualmente Prisma define únicamente dos entidades en SQLite:

```text
User
- id
- email
- passwordHash
- name
- role: SUPERADMIN | CUSTOMER
- clientId nullable

Client
- id
- name
- email
- phone
- contactName
- status: active | inactive
```

Relación actual:

```text
Client 1 ──────── N User
```

### Limitaciones del modelo actual:
1. **Confusión de roles**: El rol `CUSTOMER` hoy representa al dueño o administrador del negocio, no al cliente final que consume en el local.
2. **Sin multi-sucursal**: La sucursal (`location`) es tratada como un simple texto plano en el frontend.
3. **Sin trazabilidad operativa**: No existen empleados, feedback, métricas de desempeño, ledger de puntos ni catálogo de premios.
4. **Vulnerable a fraude**: No contempla mecanismos para evitar que un empleado se auto-asigne reconocimientos desde su propio teléfono.

---

## 2. Diagrama entidad-relación propuesto

```mermaid
erDiagram
    ORGANIZATION ||--o{ ORGANIZATION_MEMBER : has
    USER ||--o{ ORGANIZATION_MEMBER : belongs_to

    ORGANIZATION ||--o{ LOCATION : has
    LOCATION ||--o{ ORGANIZATION_MEMBER : scopes_manager
    LOCATION ||--o{ EMPLOYEE : employs
    USER o|--o| EMPLOYEE : may_login_as

    ORGANIZATION ||--o{ CUSTOMER : acquires
    CUSTOMER o|--o{ FEEDBACK : leaves

    LOCATION ||--o{ QR_CODE : exposes
    QR_CODE ||--o{ FEEDBACK : receives

    ORGANIZATION ||--o{ DIMENSION : configures
    FEEDBACK ||--o{ FEEDBACK_DIMENSION : contains
    DIMENSION ||--o{ FEEDBACK_DIMENSION : selected_in

    ORGANIZATION ||--o{ FEEDBACK : receives
    LOCATION ||--o{ FEEDBACK : receives
    EMPLOYEE o|--o{ FEEDBACK : identified_in

    FEEDBACK ||--o{ PERFORMANCE_EVENT : generates
    ORGANIZATION ||--o{ PERFORMANCE_EVENT : owns
    LOCATION ||--o{ PERFORMANCE_EVENT : occurs_at
    EMPLOYEE o|--o{ PERFORMANCE_EVENT : concerns_optional
    DIMENSION o|--o{ PERFORMANCE_EVENT : evaluates

    EMPLOYEE ||--o{ RECOGNITION : receives
    USER o|--o{ RECOGNITION : creates_manual
    PERFORMANCE_EVENT o|--o{ RECOGNITION : supports
    RULE o|--o{ RECOGNITION : triggers_auto

    EMPLOYEE ||--o{ POINT_LEDGER_ENTRY : accumulates
    PERFORMANCE_EVENT o|--o{ POINT_LEDGER_ENTRY : originates
    RECOGNITION o|--o{ POINT_LEDGER_ENTRY : originates
    RULE o|--o{ POINT_LEDGER_ENTRY : defines

    ORGANIZATION ||--o{ RULE : configures
    RULE o|--o{ PERFORMANCE_EVENT : evaluates

    ORGANIZATION ||--o{ REWARD : defines
    EMPLOYEE ||--o{ REWARD_ASSIGNMENT : receives
    REWARD ||--o{ REWARD_ASSIGNMENT : assigned_as
    REWARD_ASSIGNMENT o|--o{ POINT_LEDGER_ENTRY : redeems

    ORGANIZATION ||--o{ BUDGET : configures
    REWARD_ASSIGNMENT o|--o{ BUDGET_MOVEMENT : reserves

    USER {
        string id PK
        string email UK
        string password_hash
        string name
        datetime created_at
        datetime updated_at
    }

    ORGANIZATION {
        string id PK
        string name
        string email
        string phone
        string contact_name
        string status "active | inactive"
        decimal monthly_reward_budget
        datetime created_at
        datetime updated_at
    }

    ORGANIZATION_MEMBER {
        string id PK
        string organization_id FK
        string user_id FK
        string location_id FK_nullable
        string role "SUPERADMIN | OWNER | MANAGER | EMPLOYEE"
        string status "active | inactive"
        datetime created_at
    }

    LOCATION {
        string id PK
        string organization_id FK
        string name
        string address
        string phone
        string status "active | inactive"
        datetime created_at
    }

    EMPLOYEE {
        string id PK
        string location_id FK
        string user_id FK_nullable
        string name
        string email
        string phone
        string position
        string avatar_url
        string status "active | inactive"
        datetime created_at
        datetime updated_at
    }

    CUSTOMER {
        string id PK
        string organization_id FK
        string email UK_per_org
        string phone
        string name
        boolean marketing_opt_in
        datetime created_at
        datetime updated_at
    }

    QR_CODE {
        string id PK
        string location_id FK
        string token UK
        string label "e.g. Mesa 4, Barra, General"
        string type "table | counter | takeout"
        string status "active | inactive"
        datetime created_at
    }

    FEEDBACK {
        string id PK
        string organization_id FK
        string location_id FK
        string employee_id FK_nullable
        string qr_code_id FK_nullable
        string customer_id FK_nullable
        int rating
        string comment
        string source "qr | link"
        string client_fingerprint
        string ip_hash
        string verification_level "verified | anonymous"
        string status "approved | flagged | rejected"
        datetime created_at
    }

    DIMENSION {
        string id PK
        string organization_id FK
        string name "Amabilidad, Rapidez, Resolucion"
        string description
        string icon
        boolean active
        datetime created_at
    }

    FEEDBACK_DIMENSION {
        string feedback_id PK, FK
        string dimension_id PK, FK
        boolean highlighted
    }

    PERFORMANCE_EVENT {
        string id PK
        string organization_id FK
        string location_id FK
        string employee_id FK_nullable
        string feedback_id FK_nullable
        string dimension_id FK_nullable
        string source "customer | manager | peer | system"
        string type "recognition | rating | alert"
        int score
        decimal value
        string evidence
        json metadata
        datetime created_at
    }

    RECOGNITION {
        string id PK
        string organization_id FK
        string employee_id FK
        string performance_event_id FK_nullable
        string created_by_user_id FK_nullable
        string rule_id FK_nullable
        string category
        string message
        string source "automatic | manager"
        datetime created_at
    }

    RULE {
        string id PK
        string organization_id FK
        string name
        string event_type "feedback_received"
        int min_rating
        int points_to_award
        string recognition_title
        boolean is_active
        json conditions_config
        datetime created_at
    }

    POINT_LEDGER_ENTRY {
        string id PK
        string employee_id FK
        string performance_event_id FK_nullable
        string recognition_id FK_nullable
        string reward_assignment_id FK_nullable
        string rule_id FK_nullable
        int amount "+10, -50"
        string reason
        string status "pending | confirmed | cancelled"
        datetime created_at
    }

    REWARD {
        string id PK
        string organization_id FK
        string title
        string description
        int points_required
        decimal monetary_value
        boolean active
        datetime created_at
    }

    REWARD_ASSIGNMENT {
        string id PK
        string reward_id FK
        string employee_id FK
        string status "pending | approved | delivered | cancelled"
        datetime awarded_at
        datetime delivered_at
        datetime cancelled_at
    }

    BUDGET {
        string id PK
        string organization_id FK
        int year
        int month
        decimal monthly_budget
        decimal reserved_amount
        decimal distributed_amount
    }

    BUDGET_MOVEMENT {
        string id PK
        string organization_id FK
        string reward_assignment_id FK_nullable
        string type "credit | debit | reserve"
        decimal amount
        string description
        datetime created_at
    }
```

---

## 3. Entidades y responsabilidades detalladas

### 3.1 Organization (Tenancy raíz)
Evolución conceptual del actual modelo `Client`. Representa la empresa o negocio (ej. una cafetería o cadena gastronómica).
- Es el límite de multi-tenancy.
- Posee sucursales (`Location`), colaboradores (`Employee`), clientes captados (`Customer`), reglas, dimensiones y catálogo de premios.

### 3.2 User y OrganizationMember (Autenticación y Autorización)
- **`User`**: Representa la credencial global de inicio de sesión (email, hash de password, nombre).
- **`OrganizationMember`**: Resuelve la pertenencia a una organización y su alcance:
  - **`SUPERADMIN`**: Gestión global de la plataforma Ceibo.
  - **`OWNER`**: Dueño del negocio (`location_id = null`, acceso irrestricto a toda la organización).
  - **`MANAGER`**: Encargado/Gerente de sucursal. Se le asigna un `location_id` para acotar su visibilidad y permisos a esa sucursal específica.
  - **`EMPLOYEE`**: Colaborador con acceso a su portal personal.

### 3.3 Employee (El talento)
Representa al colaborador operativo (mozo, barista, cocinero) cuyo desempeño se mide:
- Pertenece a una `Location`.
- `user_id` es **opcional (nullable)**: En el día 1, la mayoría de los empleados no necesitan cuenta ni login; sólo figuran en la lista de colaboradores para recibir feedback. Pueden vincularse a un `User` si deciden ingresar a ver su perfil y reconocimientos.
- **Importante**: No se almacenan puntos ni scores calculados directamente en `Employee` como campos mutables primarios; todo se deriva del historial de eventos y ledger.

### 3.4 Customer (CRM & Leads de la Organización)
Representa al cliente comensal que deja feedback:
- Se vincula a la `Organization`.
- Se captura en el último paso del flujo mediante un incentivo opcional (*"Dejanos tu email o WhatsApp para participar del sorteo mensual o recibir un beneficio"*).
- Alimenta la base de datos de marketing del restaurante (`marketing_opt_in`).
- Sirve como pilar de validación para **Feedback Verificado**.

### 3.5 QRCode (Punto de acceso físico)
Expone un token público no predecible (UUID/CUID) que resuelve la sucursal y opcionalmente la mesa o sector:
- `label`: Identificador humano (ej. "Mesa 12", "Caja principal", "Barra").
- Resuelve: `Token público → Location → Organization`.

### 3.6 Feedback (La interacción del comensal)
Almacena la opinión del cliente antes de su procesamiento:
- `rating`: 1 a 5 estrellas.
- `employee_id`: **Nullable** (el cliente puede seleccionar "No recuerdo" o evaluar al local en general).
- `customer_id`: **Nullable** (si el cliente dejó sus datos de contacto).
- **Campos de seguridad anti-abuso**:
  - `client_fingerprint`: Hash anónimo del dispositivo / navegador.
  - `ip_hash`: Hash SHA-256 de la IP con salt para rate limiting y privacidad.
  - `verification_level`: `verified` (con datos de contacto) o `anonymous`.
  - `status`: `approved`, `flagged` (bajo sospecha de ráfaga o auto-reconocimiento) o `rejected`.

### 3.7 Dimension y FeedbackDimension
- **`Dimension`**: Atributos valorados por el negocio (ej. "Amabilidad", "Rapidez", "Resolución").
- **`FeedbackDimension`**: Tabla intermedia. En el PRD las dimensiones son tags/chips seleccionables (*"¿Qué destacó?"*). `highlighted: true` indica que esa dimensión fue tildada en el feedback.

### 3.8 PerformanceEvent (El núcleo del producto)
La unidad atómica de evidencia de talento:
- Desacopla el origen de los datos del cálculo de métricas.
- Si `employee_id` está presente: Genera un evento de talento individual.
- Si `employee_id` es `null`: Genera un evento de calidad a nivel `Location` (desempeño general de la sucursal).
- Preparado para recibir fuentes futuras: `customer`, `manager` (reconocimiento manual), `peer` o `system`.

### 3.9 Recognition
Representa el reconocimiento visible en el dashboard:
- Puede originarse de una `Rule` automática (ej. rating = 5 con comentario) o ser otorgado manualmente por un `Manager`/`Owner`.

### 3.10 Rule (Reglas de automatización pragmáticas para V0.1)
Para evitar la sobre-ingeniería de un motor de reglas JSON abstracto en el MVP:
- Las reglas de negocio base se ejecutan mediante **event handlers tipados en el backend** (`onFeedbackReceived`).
- La tabla `Rule` almacena configuraciones editables por el negocio: umbral de calificación (`min_rating`), puntos a otorgar (`points_to_award`), título del badge/reconocimiento (`recognition_title`) y estado activo/inactivo (`is_active`).

### 3.11 PointLedgerEntry (Libro contable inmutable)
Toda asignación o canje de puntos se registra como una transacción atómica:
- Nunca se hace `UPDATE employee SET points = points + 10`.
- Admite estados: `pending` (en espera de consolidación anti-fraude o cierre de turno) y `confirmed`.
- Permite trazabilidad absoluta, auditoría, reversión por fraude y recalcular balances sumando entradas.

### 3.12 Reward y RewardAssignment
- **`Reward`**: Catálogo de incentivos configurado por el negocio (ej. "Día libre", "Bono $15.000", "Voucher cena").
- **`RewardAssignment`**: Asignación particular a un empleado cuando canjea puntos o por decisión del manager. Estados: `pending`, `approved`, `delivered`, `cancelled`.

### 3.13 Budget y BudgetMovement (Presupuesto)
- Para V0.1 se recomienda usar un control presupuestario simple (`monthly_reward_budget` en `Organization`).
- En fases avanzadas, `Budget` y `BudgetMovement` controlan el cupo monetario reservado y distribuido mes a mes sin tocar procesamiento de pagos bancarios.

---

## 4. Flujo de datos completo (con Anti-Abuso y Lead Capture)

```text
1. Cliente escanea QR (Mesa 4)
   │
2. Front resuelve Token público → Location + Organization + Lista de Empleados
   │
3. Cliente evalúa experiencia:
   ├── Rating (1 a 5)
   ├── Selecciona Empleado (o "No recuerdo")
   ├── Selecciona Dimensiones destacadas (Amabilidad, Rapidez)
   └── Comentario opcional
   │
4. Paso de fidelización (Incentivo opcional):
   └── "¿Querés participar del sorteo mensual? Dejanos tu email/teléfono"
       ├── Si ingresa dato: Se crea/actualiza CUSTOMER (marketing opt-in)
       └── Si omite dato: Continúa como anónimo
   │
5. Envío de FEEDBACK + Silent Checks:
   ├── Se envía client_fingerprint + ip_hash
   ├── Motor Anti-Abuso evalúa:
   │   ├── ¿Mismo dispositivo calificó al mismo empleado en < 24hs?
   │   └── ¿Ráfaga anómala de calificaciones hacia este empleado?
   │       ├── SÍ → Feedback.status = "flagged", Puntos = "pending"
   │       └── NO → Feedback.status = "approved"
   │
6. Generación de PERFORMANCE_EVENT:
   ├── Evento individual de talento (si hay empleado)
   └── Evento de satisfacción de sucursal (si no hay empleado)
   │
7. Evaluación de Reglas (Rule Engine):
   ├── Si rating >= 5 y status = "approved":
   │   ├── Crea RECOGNITION ("Customer Hero")
   │   └── Genera POINT_LEDGER_ENTRY (+10 puntos)
   │
8. Dashboards:
   ├── Empleado: visualiza feedback positivo y puntos en su perfil
   └── Manager: visualiza métricas de sucursal y alertas de fraude si hubo casos "flagged"
```

---

## 5. Recomendaciones de migración e infraestructura

### 5.1 Migración obligatoria a PostgreSQL
El esquema actual usa SQLite (`BE/prisma/schema.prisma`). Se recomienda migrar inmediatamente a **PostgreSQL** antes de crear las migraciones de este modelo:
- Soporte nativo y rápido de campos JSON (`metadata`, `conditions_config`).
- Tipos de datos financieros seguros (`Decimal`).
- Alta concurrencia para múltiples comensales escaneando QRs simultáneamente.
- Enums nativos y transacciones ACID estrictas para el ledger de puntos.

### 5.2 Evolución de `Client` a `Organization`
Para no romper de golpe el backend existente:
- En una primera etapa se puede mantener el nombre de tabla `clients` mapeado a `Organization` (`@@map("clients")`), o migrar rutas de forma paralela (`/api/organizations` y alias retrocompatible para `/api/clients`).
- Deprecar el campo `User.clientId` a favor de `OrganizationMember`.

### 5.3 Implementación de índices críticos
Para garantizar lecturas rápidas en dashboards y validaciones anti-abuso:
- `FEEDBACK(client_fingerprint, employee_id, created_at)`: Para verificar límites de 24hs en < 5ms.
- `PERFORMANCE_EVENT(employee_id, created_at)`: Para métricas y dashboards de talento.
- `POINT_LEDGER_ENTRY(employee_id, status)`: Para cálculo de balance de puntos.

---

## 6. Orden sugerido de implementación por fases

### Fase 1 — Base Organizacional y Multi-Tenancy (PostgreSQL)
- Configurar PostgreSQL en Prisma.
- Crear modelos: `Organization`, `Location`, `User`, `OrganizationMember`, `Employee`.
- Implementar asignación de `Manager` a sucursal vía `location_id` en `OrganizationMember`.
- Migrar usuarios actuales.

### Fase 2 — Flujo QR, Feedback, Anti-Abuso y Leads
- Crear modelos: `QRCode`, `Customer`, `Feedback`, `Dimension`, `FeedbackDimension`.
- Endpoint público: `GET /api/public/qr/:token` (datos de sucursal y lista de colaboradores activos).
- Endpoint público: `POST /api/public/feedback` con captura de huella, validación de rate limit (24h) y captura opcional de `Customer`.

### Fase 3 — Motor de Desempeño y Evidencia
- Crear modelo: `PerformanceEvent`.
- Generar eventos automáticamente a partir de feedbacks válidos (`status = 'approved'`).
- Distinguir eventos individuales vs. eventos de sucursal.

### Fase 4 — Reconocimientos y Ledger de Puntos
- Crear modelos: `Recognition`, `PointLedgerEntry`.
- Implementar reglas tipadas en backend (`feedback_5_stars -> +10 pts + recognition`).
- Puntos en estado `confirmed` para feedbacks limpios y `pending` para sospechosos.

### Fase 5 — Catálogo de Recompensas y Moderación
- Crear modelos: `Reward`, `RewardAssignment`.
- Canje de puntos deduciendo del ledger.
- Panel de Manager para auditar y aprobar/rechazar feedbacks marcados como `flagged`.

### Fase 6 — Dashboards y Reportes CRM
- Dashboard de Employee (evidencia, reconocimientos, evolución de puntos).
- Dashboard de Manager (satisfacción de sucursal, colaboradores destacados, alertas).
- Módulo de Exportación de Clientes (CRM) para el Owner.

---

## 7. Documentación complementaria

Para conocer el detalle técnico específico, heurísticas de rate-limiting, detección de ráfagas y flujos UX contra el auto-reconocimiento, consultar:
- [docs/propuesta-mecanismos-contra-abuso-autoreconocimiento.md](file:///c:/Users/luigi/Desktop/devtemp/Ceibo.studio/docs/propuesta-mecanismos-contra-abuso-autoreconocimiento.md)
