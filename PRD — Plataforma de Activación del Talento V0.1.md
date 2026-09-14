# PRD — Plataforma de Activación del Talento
## V0.1 — Customer-Driven Recognition & Rewards

**Estado:** Ready for development  
**Etapa:** Pre-MVP → MVP  
**Mercado inicial:** Restaurantes y cafeterías  
**Usuario comprador:** Dueño / gerente / encargado  
**Usuarios finales:** Manager, Employee, Customer  
**Principio:** La recompensa es el mecanismo. El talento es el producto.

---

# 1. Objetivo del producto

Construir una primera versión funcional que permita a un negocio:

1. recibir feedback de clientes;
2. identificar al empleado involucrado;
3. convertir ese feedback en evidencia de desempeño;
4. reconocer al empleado;
5. asignar puntos y/o recompensas mediante reglas simples;
6. mostrar al empleado evidencia de su desempeño;
7. permitir al manager entender qué está pasando con su equipo.

El MVP debe demostrar una hipótesis fundamental:

> **Si hacemos visible el buen desempeño y lo conectamos con reconocimiento y recompensas, podemos aumentar el valor percibido del buen desempeño para empleados y negocios.**

---

# 2. Qué problema resolvemos

Actualmente un negocio puede recibir cientos de interacciones con clientes sin saber:

- quién brindó una experiencia excepcional;
- qué comportamientos generan satisfacción;
- qué empleados destacan consistentemente;
- cómo reconocerlos;
- cómo convertir ese desempeño en incentivos.

El producto crea el siguiente ciclo:

```text
Cliente
   ↓
Feedback
   ↓
Empleado identificado
   ↓
Performance Event
   ↓
Reconocimiento
   ↓
Puntos / Recompensa
   ↓
Visibilidad para empleado
   ↓
Información para manager
```

---

# 3. Alcance del V0.1

## Incluido

### Organization
- registro;
- login;
- configuración básica;
- una o varias sucursales.

### Employees
- alta;
- baja;
- edición;
- estado activo/inactivo;
- perfil individual.

### Customer Feedback
- acceso mediante QR;
- rating;
- identificación del empleado;
- dimensiones;
- comentario opcional;
- confirmación.

### Performance Events
- creación automática desde feedback;
- almacenamiento de evidencia;
- asociación con empleado;
- dimensión;
- score;
- timestamp;
- source.

### Recognition
- reconocimiento automático por regla;
- reconocimiento manual del manager.

### Points
- acumulación de puntos;
- historial de movimientos.

### Rewards
- configuración de recompensa;
- asignación;
- estado;
- historial;
- registro de entrega.

### Dashboard
- métricas generales;
- evolución;
- reconocimientos;
- colaboradores destacados;
- recompensas.

### QR
- generación de QR por sucursal;
- URL pública de feedback.

### Rules
Reglas simples del tipo:

```text
IF condición
THEN acción
```

---

# 4. Fuera del alcance

No construir en V0.1:

- app móvil nativa;
- payroll;
- procesamiento de dinero;
- marketplace de beneficios;
- LMS;
- performance reviews completos;
- career paths;
- promociones;
- internal mobility;
- rankings públicos;
- sistema avanzado de gamificación;
- integraciones externas;
- IA avanzada;
- predicción de desempeño;
- scoring complejo;
- múltiples niveles organizacionales complejos.

---

# 5. Roles y permisos

## Owner

Puede:

- administrar organización;
- administrar sucursales;
- administrar empleados;
- configurar dimensiones;
- configurar reglas;
- configurar recompensas;
- visualizar dashboard;
- administrar presupuesto.

## Manager

Puede:

- visualizar su sucursal;
- visualizar empleados;
- reconocer empleados;
- consultar feedback;
- consultar desempeño;
- asignar recompensas.

## Employee

Puede:

- visualizar su perfil;
- visualizar feedback asociado;
- visualizar reconocimientos;
- visualizar puntos;
- visualizar recompensas;
- visualizar evolución.

## Customer

No necesita cuenta.

Puede:

- enviar feedback;
- identificar empleado;
- seleccionar dimensiones;
- escribir comentario.

---

# 6. Core Entity: Performance Event

El núcleo técnico del sistema será `PerformanceEvent`.

No debemos modelar el producto únicamente como "encuestas".

Un feedback genera un evento de desempeño.

### Ejemplo

```json
{
  "employeeId": "emp_123",
  "source": "customer",
  "type": "recognition",
  "dimension": "kindness",
  "score": 5,
  "evidence": "Martín fue muy amable y paciente.",
  "timestamp": "2026-09-13T15:20:00Z"
}
```

### Propiedades mínimas

```text
id
organization_id
location_id
employee_id
source
type
dimension_id
score
value
evidence
metadata
created_at
```

### Sources iniciales

```text
customer
manager
```

Preparar el modelo para:

```text
peer
system
goal
learning
```

---

# 7. Modelo de dominio

```text
Organization
│
├── Location
│   ├── Employee
│   └── QRCode
│
├── User
│
├── Dimension
│
├── Feedback
│
├── PerformanceEvent
│
├── Recognition
│
├── Rule
│
├── Reward
│
└── RewardTransaction
```

Relación conceptual:

```text
Feedback
   │
   └── creates ──> PerformanceEvent
                         │
                         ├── Recognition
                         │
                         ├── Points
                         │
                         └── Rule evaluation
                                  │
                                  └── Reward
```

---

# 8. Customer Journey

## Objetivo

Completar feedback en menos de 30 segundos.

### Step 1 — QR

El cliente escanea el QR de la sucursal.

### Step 2 — Rating

Mostrar:

> ¿Cómo fue tu experiencia?

Opciones:

```text
⭐
⭐⭐
⭐⭐⭐
⭐⭐⭐⭐
⭐⭐⭐⭐⭐
```

### Step 3 — Employee

Mostrar:

> ¿Quién te atendió?

Lista de empleados activos.

Opción:

> No recuerdo

### Step 4 — Dimensions

Mostrar:

> ¿Qué destacó?

Opciones:

- Amabilidad
- Rapidez
- Resolución
- Conocimiento

Puede seleccionar una o varias.

### Step 5 — Comment

Opcional:

> ¿Querés contarnos algo más?

### Step 6 — Confirmation

> ¡Gracias por tu feedback!

Si identificó al empleado:

> Tu reconocimiento ayuda a destacar a quien hizo la diferencia.

---

# 9. Reglas del Customer Flow

### Regla 1

No requerir login.

### Regla 2

No pedir datos innecesarios.

### Regla 3

El empleado es opcional.

### Regla 4

El comentario es opcional.

### Regla 5

El formulario debe funcionar perfectamente en mobile.

### Regla 6

El flujo debe poder completarse rápidamente.

### Regla 7

El QR debe identificar automáticamente:

```text
organization
location
```

---

# 10. Feedback

## Campos

```text
id
organization_id
location_id
employee_id nullable
rating
dimensions[]
comment nullable
source
created_at
```

## Reglas

Un feedback:

- pertenece a una organización;
- pertenece a una sucursal;
- puede pertenecer a un empleado;
- contiene rating;
- puede contener dimensiones;
- puede contener comentario.

---

# 11. Performance Event Generation

Cada feedback válido genera uno o más Performance Events.

### Ejemplo

Feedback:

```text
Rating: 5
Employee: Martín
Dimensions:
- Amabilidad
- Resolución

Comment:
"Martín fue muy amable y resolvió mi problema."
```

Genera:

```text
Event 1
Employee: Martín
Source: customer
Dimension: kindness
Score: 5

Event 2
Employee: Martín
Source: customer
Dimension: resolution
Score: 5
```

Además puede existir un evento general:

```text
Event 3
Employee: Martín
Type: recognition
Score: 5
```

---

# 12. Dimensiones

## V0.1

Crear por defecto:

```text
Kindness
Speed
Knowledge
Resolution
```

Internamente deben ser configurables.

### Entity

```text
Dimension

id
organization_id
name
description
active
created_at
```

En el futuro cada organización podrá crear sus propias dimensiones.

---

# 13. Employee Profile

El perfil debe responder:

> ¿Cómo está siendo percibido mi trabajo?

### Información

```text
Nombre

Performance Score
Satisfaction Score
Feedback Count
Recognition Count
Points
Evolution
```

### Performance

Mostrar dimensiones:

```text
Amabilidad
████████████████

Resolución
██████████████

Rapidez
████████████
```

### Evidence

Mostrar algunos comentarios reales.

Ejemplo:

> "Fue muy paciente y me explicó todo."

Esto es importante: **el empleado debe poder ver evidencia de por qué está siendo reconocido.**

---

# 14. Recognition

Existen dos mecanismos.

## Automático

Creado por una regla.

Ejemplo:

```text
5 estrellas
+
empleado identificado
=
Customer Recognition
```

## Manual

El manager puede seleccionar:

```text
Empleado
↓
Reconocer
↓
Categoría
↓
Mensaje
```

Ejemplo:

> Excelente trabajo ayudando al cliente a resolver su problema.

---

# 15. Points

Los puntos son un mecanismo interno de incentivo.

### Ejemplo

```text
Feedback 5 estrellas
+10 points

Dimensión destacada
+5 points

Manager recognition
+10 points
```

Los valores deben ser configurables posteriormente.

## Historial

```text
+10  Customer recognition
+10  Manager recognition
+5   Resolution highlight

Total: 125
```

Nunca modificar silenciosamente el balance.

Todo movimiento debe tener un origen.

---

# 16. Rules Engine V0.1

El motor no debe ser genérico en exceso.

## Trigger

Inicialmente:

```text
feedback_received
points_reached
```

## Conditions

```text
rating
employee
dimension
```

## Actions

```text
add_points
create_recognition
create_reward
```

### Ejemplo

```text
WHEN
feedback_received

IF
rating >= 5
AND employee != null

THEN
add_points(10)
create_recognition("Customer Hero")
```

---

# 17. Rule Entity

```text
Rule

id
organization_id
name
trigger
conditions
actions
active
created_at
```

Las condiciones y acciones pueden almacenarse inicialmente como JSON.

No construir un lenguaje de reglas propio.

---

# 18. Rewards

Una Reward representa una recompensa prometida/asignada por la organización.

### Tipos V0.1

```text
monetary
recognition
```

### Entity

```text
Reward

id
organization_id
employee_id
type
title
description
amount nullable
status
rule_id nullable
created_at
awarded_at
delivered_at
```

### Status

```text
pending
awarded
delivered
cancelled
```

---

# 19. Reward Budget

Cada organización puede configurar:

```text
monthly_budget
```

Y el sistema calcula:

```text
available
reserved
distributed
```

Ejemplo:

```text
Budget        $200.000
Reserved       $20.000
Distributed    $45.000
Available     $135.000
```

En V0.1 esto es solamente **tracking**.

No procesamos dinero.

---

# 20. Manager Dashboard

## Objetivo

Responder en aproximadamente 10 segundos:

> **¿Cómo está mi equipo y qué debería hacer?**

### Top section

```text
Customer Satisfaction

4.72 / 5

+9% vs previous period
```

### Recognition

```text
43 recognitions
```

### Rewards

```text
$65.000 distributed
```

### Employees

Mostrar:

```text
Employee
Score
Evolution
Recognitions
```

### Insights

Ejemplo:

> Amabilidad es la dimensión con mayor crecimiento esta semana.

---

# 21. Employee Dashboard

Debe priorizar:

### 1. Estado actual

```text
Performance 92
```

### 2. Evolución

```text
+11% vs previous period
```

### 3. Recognition

```text
12 recognitions
```

### 4. Evidence

Comentarios de clientes.

### 5. Rewards

Recompensas obtenidas.

### 6. Strengths

Dimensiones donde destaca.

---

# 22. Admin Setup

El onboarding mínimo:

```text
Create account
      ↓
Create organization
      ↓
Create location
      ↓
Add employees
      ↓
Configure dimensions
      ↓
Generate QR
      ↓
Ready
```

El objetivo es que un negocio pueda comenzar a recibir feedback sin asistencia técnica.

---

# 23. QR System

Cada Location tendrá un QR.

El QR apunta a:

```text
/feedback/{locationId}
```

Nunca guardar información crítica directamente dentro del QR.

El backend resuelve:

```text
QR
↓
Location
↓
Organization
```

El QR debe poder descargarse/imprimirse.

---

# 24. Authentication

## Admin/Manager/Employee

Email + password inicialmente.

No necesitamos:

- SSO;
- Google Workspace;
- Microsoft;
- MFA;

en V0.1.

El modelo de usuarios debe quedar preparado para incorporarlos posteriormente.

---

# 25. Multi-tenancy

Desde el comienzo debe existir aislamiento por organización.

Toda entidad relevante debe poder asociarse a:

```text
organization_id
```

Nunca confiar únicamente en filtros del frontend.

La autorización debe validarse en backend.

---

# 26. Arquitectura técnica sugerida

## Frontend

```text
Next.js
React
Tailwind
```

Una única aplicación responsive.

No construir frontend separado para customer/admin/employee salvo que sea necesario.

---

## Backend

Puede comenzar dentro del mismo proyecto si acelera el desarrollo.

API organizada por dominio:

```text
/auth
/organizations
/locations
/employees
/feedback
/events
/recognitions
/rules
/rewards
/dashboard
```

---

## Database

PostgreSQL.

---

# 27. API mínima

## Organizations

```http
POST /organizations
GET /organizations/:id
PATCH /organizations/:id
```

## Locations

```http
POST /locations
GET /locations
PATCH /locations/:id
```

## Employees

```http
POST /employees
GET /employees
GET /employees/:id
PATCH /employees/:id
```

## Feedback

```http
POST /public/feedback
GET /feedback
GET /feedback/:id
```

El endpoint público debe requerir únicamente la información necesaria para enviar feedback.

## Performance Events

```http
GET /employees/:id/events
GET /performance-events
```

## Recognition

```http
POST /recognitions
GET /recognitions
```

## Rules

```http
POST /rules
GET /rules
PATCH /rules/:id
```

## Rewards

```http
POST /rewards
GET /rewards
PATCH /rewards/:id
```

## Dashboard

```http
GET /dashboard/summary
GET /dashboard/employees
GET /dashboard/evolution
```

---

# 28. Eventos internos

El sistema debería utilizar eventos de dominio aunque inicialmente sean simples.

Ejemplos:

```text
feedback.created
performance_event.created
recognition.created
points.added
reward.created
reward.delivered
```

Esto permitirá desacoplar posteriormente:

```text
Feedback
     ↓
Event processing
     ↓
Rules
     ↓
Recognition
     ↓
Rewards
```

---

# 29. Procesamiento del feedback

Cuando llega un feedback:

```text
POST /public/feedback
        ↓
Validate
        ↓
Persist Feedback
        ↓
Create Performance Events
        ↓
Evaluate Rules
        ↓
Create Recognition
        ↓
Add Points
        ↓
Potentially Create Reward
```

Para V0.1 puede ejecutarse síncronamente si el volumen es bajo.

No introducir infraestructura de eventos compleja antes de necesitarla.

---

# 30. Performance Score V0.1

No construir todavía un algoritmo sofisticado.

Usar una fórmula transparente.

Por ejemplo:

```text
Performance Score =
normalized customer rating
+
recognition contribution
+
consistency contribution
```

Pero mostrar siempre las métricas originales.

El usuario debe poder entender:

> "¿Por qué tengo este score?"

Nunca debe existir una caja negra.

---

# 31. Métricas de producto

## North Star aspiracional

**Performance Lift**

No será perfectamente medible en V0.1.

## Métricas operativas

### Acquisition

```text
Organizations created
Locations created
Employees added
```

### Activation

```text
QR generated
First feedback received
First employee recognized
First reward created
```

### Engagement

```text
Feedback / location / week
Recognitions / employee / month
Dashboard visits
```

### Retention

```text
Organizations receiving feedback
Organizations active after 30 days
```

### Business

```text
Trial → paid
MRR
Churn
Reward budget
```

---

# 32. Product Funnel

Medir:

```text
Organization created
        ↓
Location created
        ↓
Employees added
        ↓
QR generated
        ↓
QR used
        ↓
Feedback received
        ↓
Employee identified
        ↓
Recognition generated
        ↓
Reward generated
        ↓
Organization repeats usage
```

Este funnel será fundamental para detectar dónde falla el producto.

---

# 33. Activation Definition

Una organización estará considerada **activated** cuando:

1. creó una sucursal;
2. agregó al menos 3 empleados;
3. generó el QR;
4. recibió al menos 5 feedbacks;
5. generó al menos 1 reconocimiento.

Esto es mucho más útil que considerar activada a una empresa simplemente porque creó una cuenta.

---

# 34. MVP Success Criteria

El MVP será considerado exitoso si conseguimos:

### Producto

- feedback real;
- identificación real de empleados;
- eventos generados correctamente;
- reconocimiento funcionando;
- puntos funcionando;
- recompensa registrada;
- dashboard funcionando.

### Negocio

- 3 implementaciones reales;
- al menos 1 negocio dispuesto a pagar;
- uso recurrente durante varias semanas.

### Usuario

Los empleados deben poder decir:

> "Ahora puedo ver que mi trabajo está siendo reconocido."

Y los managers:

> "Ahora puedo identificar mejor quién está generando valor."

---

# 35. User Stories

## Customer

### US-C01

Como cliente, quiero poder dejar feedback sin registrarme para hacerlo rápidamente.

**Acceptance Criteria**
- No login.
- Mobile responsive.
- Submit en menos de 30 segundos en condiciones normales.

### US-C02

Como cliente, quiero identificar al empleado que me atendió.

**Acceptance Criteria**
- Lista de empleados activos.
- Opción "No recuerdo".
- Identificación opcional.

### US-C03

Como cliente, quiero destacar qué fue lo mejor de la atención.

**Acceptance Criteria**
- Dimensiones configuradas visibles.
- Selección sencilla.

---

# 36. Employee Stories

### US-E01

Como empleado, quiero ver mis reconocimientos.

**Acceptance Criteria**
- Lista histórica.
- Fecha.
- Fuente.
- Mensaje.

### US-E02

Como empleado, quiero ver cómo evolucionó mi desempeño.

**Acceptance Criteria**
- Score actual.
- Comparación temporal.
- Dimensiones.

### US-E03

Como empleado, quiero ver por qué fui reconocido.

**Acceptance Criteria**
- Mostrar evidencia del feedback.
- Mostrar dimensión asociada.

### US-E04

Como empleado, quiero saber qué recompensas obtuve.

**Acceptance Criteria**
- Historial.
- Estado.
- Valor cuando corresponda.

---

# 37. Manager Stories

### US-M01

Como manager, quiero ver cómo está funcionando mi equipo.

**Acceptance Criteria**
- Satisfaction.
- Performance.
- Recognition.
- Evolution.

### US-M02

Como manager, quiero reconocer manualmente a un empleado.

**Acceptance Criteria**
- Seleccionar empleado.
- Seleccionar motivo.
- Escribir mensaje.
- Crear reconocimiento.

### US-M03

Como manager, quiero crear una regla de incentivo.

**Acceptance Criteria**
- Seleccionar trigger.
- Configurar condición.
- Seleccionar acción.
- Activar/desactivar.

### US-M04

Como manager, quiero registrar una recompensa.

**Acceptance Criteria**
- Seleccionar empleado.
- Tipo.
- Valor.
- Descripción.
- Estado.

---

# 38. Owner Stories

### US-O01

Como owner, quiero crear una sucursal.

### US-O02

Como owner, quiero administrar empleados.

### US-O03

Como owner, quiero configurar dimensiones.

### US-O04

Como owner, quiero configurar presupuesto.

### US-O05

Como owner, quiero visualizar el uso de recompensas.

---

# 39. Prioridad del backlog

## P0 — imprescindible

```text
Authentication
Organizations
Locations
Employees
QR generation
Public feedback
Employee identification
Feedback persistence
Performance Events
Employee profile
Manager dashboard
Recognition
Points
Basic rewards
Basic rules
```

## P1 — importante

```text
Reward budget
Manual recognition
Feedback history
Performance evolution
Custom dimensions
Export data
Notifications
```

## P2 — después

```text
AI classification
Advanced insights
Peer recognition
Advanced rules
Goal system
Challenges
Integrations
```

---

# 40. Orden de implementación

## Sprint 1 — Foundation

```text
Auth
Organizations
Locations
Employees
Database
Permissions
```

## Sprint 2 — Customer Experience

```text
QR
Public feedback
Employee selection
Dimensions
Comments
Confirmation
```

## Sprint 3 — Talent Engine

```text
Performance Events
Recognition
Points
Basic Rules
```

## Sprint 4 — Management

```text
Dashboard
Employee Profile
Rewards
Reward Budget
```

## Sprint 5 — Pilot Hardening

```text
Analytics
Error handling
Permissions
Mobile UX
Empty states
Onboarding
Instrumentation
```

No es necesario esperar a terminar todos los sprints para empezar a probar.

---

# 41. Definition of Done — V0.1

El MVP está terminado cuando un negocio nuevo puede realizar este flujo sin intervención del equipo fundador:

```text
Crear cuenta
    ↓
Crear sucursal
    ↓
Agregar empleados
    ↓
Generar QR
    ↓
Cliente escanea QR
    ↓
Cliente deja feedback
    ↓
Empleado recibe Performance Event
    ↓
Regla genera reconocimiento
    ↓
Empleado ve reconocimiento
    ↓
Manager ve impacto en dashboard
    ↓
Manager asigna recompensa
    ↓
Empleado ve recompensa
```

Y todos los pasos quedan registrados correctamente en la base de datos.

---

# 42. Instrumentación obligatoria

Desde el primer día medir:

```text
signup_completed
organization_created
location_created
employee_created
qr_generated
feedback_started
feedback_completed
employee_selected
feedback_with_comment
performance_event_created
recognition_created
points_added
reward_created
reward_delivered
dashboard_viewed
employee_profile_viewed
```

La instrumentación no debe agregarse "después".

Si queremos aprender rápido, necesitamos saber qué está ocurriendo.

---

# 43. Riesgos principales

## Riesgo 1 — Nadie completa feedback

### Señal

Muchas visitas al QR pero pocos formularios completados.

### Respuesta

Reducir pasos y fricción.

---

## Riesgo 2 — Clientes no identifican empleados

### Señal

Muchos feedbacks sin employee ID.

### Respuesta

Mejorar el mecanismo de identificación.

---

## Riesgo 3 — Managers no utilizan el dashboard

### Señal

Feedback existe pero el manager no vuelve.

### Hipótesis

El producto genera datos pero no suficiente valor accionable.

---

## Riesgo 4 — Empleados no valoran el sistema

### Señal

No consultan su perfil o reaccionan negativamente al sistema.

### Respuesta

Investigar si el problema está en:

- transparencia;
- justicia;
- métricas;
- recompensas;
- privacidad;
- percepción de vigilancia.

---

## Riesgo 5 — Incentivos generan gaming

### Señal

Cambios de comportamiento no deseados.

### Respuesta

No depender de una sola métrica.

---

## Riesgo 6 — El producto se convierte en software de vigilancia

Este riesgo es especialmente importante.

El producto debe evitar comunicar:

> "Estamos midiendo todo lo que hacés."

Debe comunicar:

> "Estamos haciendo visible el valor que generás."

---

# 44. Principios UX

## Customer

**Fast**

El cliente no quiere completar una encuesta larga.

## Employee

**Evidence first**

Primero mostrar reconocimiento y evidencia.

## Manager

**Action first**

Primero mostrar qué está pasando y qué debería hacer.

## Organization

**Simple**

Configurar el sistema no debería requerir conocimiento técnico.

---

# 45. Decisiones deliberadas

### No rankings públicos

Porque pueden generar competencia tóxica.

### No AI-first

Porque primero necesitamos demostrar valor sin esconderlo detrás de IA.

### No payment processing

Porque no necesitamos resolverlo para validar la hipótesis.

### No mobile app

Porque una PWA/web responsive alcanza inicialmente.

### No scoring complejo

Porque todavía no conocemos qué modelo representa mejor el desempeño.

### No rule engine genérico

Porque todavía no conocemos las reglas reales que los negocios necesitan.

---

# 46. Experimentos del MVP

El producto no solo debe ser software.

Debe permitirnos probar hipótesis.

## Experimento 1

Comparar:

```text
Feedback normal
vs.
Feedback + recognition
```

Medir evolución del comportamiento.

## Experimento 2

Comparar:

```text
Recognition
vs.
Recognition + monetary reward
```

Observar percepción y comportamiento.

## Experimento 3

Observar qué dimensiones generan mayor impacto:

```text
Kindness
Speed
Knowledge
Resolution
```

---

# 47. Preguntas que el MVP debe responder

Al finalizar los primeros pilotos debemos saber:

### Customer

- ¿Los clientes dejan feedback?
- ¿Qué porcentaje identifica empleados?
- ¿Qué dimensiones mencionan?

### Employee

- ¿Valoran recibir feedback?
- ¿Consultan sus reconocimientos?
- ¿Perciben el sistema como reconocimiento o vigilancia?

### Manager

- ¿Utilizan la información?
- ¿Reconocen empleados?
- ¿Asignan recompensas?
- ¿Pagarían por continuar?

### Business

- ¿Mejora alguna métrica?
- ¿La experiencia del cliente mejora?
- ¿La retención de empleados puede verse afectada positivamente?

---

# 48. Qué NO debemos asumir

No asumir que:

> Más puntos = más motivación.

No asumir que:

> Más dinero = mejor desempeño.

No asumir que:

> El mejor empleado = quien tiene el score más alto.

No asumir que:

> Más feedback = más valor.

No asumir que:

> AI = producto diferencial.

No asumir que:

> Competencia = motivación.

Todas estas son hipótesis.

---

# 49. La métrica más importante durante el piloto

Aunque **Performance Lift** sea nuestra North Star aspiracional, durante los primeros pilotos debemos prestar especial atención a:

> **¿El sistema produce cambios observables después de hacer visible y reconocer el desempeño?**

El objetivo no es demostrar que podemos recolectar estrellas.

El objetivo es demostrar que podemos crear un ciclo:

```text
Evidence
↓
Recognition
↓
Motivation
↓
Behavior
↓
Better performance
```

---

# 50. Evolución posterior del producto

Una vez validado el primer loop:

```text
Customer
   ↓
Performance
   ↓
Recognition
   ↓
Reward
```

agregaremos nuevas fuentes:

```text
Customer
Manager
Peer
System
Goals
Learning
```

Todas convergerán en:

```text
Performance Events
```

Luego:

```text
Performance Events
       ↓
Talent Intelligence
       ↓
Insights
       ↓
Development
       ↓
Career
       ↓
Internal Mobility
```

---

# 51. Arquitectura de producto de largo plazo

```text
┌──────────────────────────────────────┐
│           EXPERIENCES                │
│                                      │
│ Customer │ Employee │ Manager       │
└──────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│          TALENT ENGINE               │
│                                      │
│ Events │ Scoring │ Rules             │
│ Recognition │ Rewards                │
└──────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│             DATA                     │
│                                      │
│ Performance │ Feedback │ Skills      │
│ Employees │ Organizations             │
└──────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│       TALENT INTELLIGENCE            │
│                                      │
│ Insights │ Recommendations           │
│ Development │ Career                 │
└──────────────────────────────────────┘
```

---

# 52. La tesis que estamos intentando demostrar

Todo el MVP puede resumirse en una sola hipótesis:

> **Cuando una organización puede hacer visible el valor que cada persona genera, reconocerlo y conectarlo con consecuencias significativas, puede crear un entorno donde sea más atractivo seguir mejorando.**

El MVP no tiene que resolver Talent Management.

Tiene que demostrar que este loop funciona.

---

# 53. Criterio definitivo de priorización

Ante cualquier feature nueva, preguntar:

### ¿Ayuda a...?

1. hacer visible el desempeño;
2. generar evidencia;
3. reconocerlo;
4. recompensarlo;
5. generar aprendizaje;
6. impulsar crecimiento.

Si no ayuda a ninguna:

> **No pertenece al MVP.**

---

# 54. Producto en una frase

> **Una plataforma que convierte el desempeño en evidencia visible y lo conecta con reconocimiento, recompensas y crecimiento.**

---

# 55. Principio fundador

> **Hacé que valga la pena dar lo mejor de uno.**

Y la traducción de ese principio al producto:

> **La recompensa es el mecanismo. El talento es el producto.**