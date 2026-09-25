# Tramitología GT

App web para dar seguimiento a los trámites y permisos de los proyectos inmobiliarios de BAMBU Guatemala. Reemplaza el seguimiento que hoy se hace en ClickUp. Genera dashboard, agenda, calendario, bitácora y reporte semanal, con filtros por proyecto, tipología, institución, fecha y encargado.

## Cómo trabajar con Jose

- Jose es ingeniero civil, no programador. Explica cada comando antes de ejecutarlo y qué hace, en español.
- Pide confirmación antes de instalar paquetes, borrar archivos o cambiar la estructura de carpetas.
- Haz commits pequeños con mensajes en español que describan el cambio funcional ("agrega filtro por encargado"), no el técnico.
- El proyecto se trabaja alternando entre Claude (chat) y Claude Code. Este archivo es la fuente de verdad de las decisiones: actualízalo cuando se tome una nueva y avisa a Jose qué cambiaste.
- La maqueta de referencia está en `mockup/index.html`. Es HTML y JS plano con datos en memoria. Sirve como especificación visual y de comportamiento, no como código a reutilizar. Está desactualizada en: subactividades, estado `no_aplica`, fase del trámite, plantillas y pantallas de Usuarios y Catálogos. Donde la maqueta y este archivo difieran, manda este archivo.

## Stack

- Frontend: React + Vite, en JavaScript (sin TypeScript).
- Backend: Firebase. Firestore (base de datos), Authentication (Google), Hosting y Cloud Functions en JavaScript (solo para el reporte semanal).
- Proyecto de Firebase: ID `bambu-tramitologia-gt`, URL https://bambu-tramitologia-gt.web.app. El ID se escribe a mano al crear el proyecto (la consola propone uno con sufijo).
- Propietario único del proyecto de Firebase por ahora: Jose (jrimola@bambudev.com, Google Workspace). Un dominio propio de bambudev.com queda para después, gestionado con TI.
- Plan: Spark (gratis) al inicio; Blaze (pago por uso, tarjeta corporativa) cuando se active el reporte automático.
- Entorno: Windows, PowerShell, Node.js LTS. Carpeta del proyecto: `C:\bambu-tramitologia-gt`.
- Control de versiones: Git + GitHub (cuenta con correo @bambudev.com; confirmar si existe organización de BAMBU en GitHub antes de crear el repositorio).

## Estructura de carpetas propuesta

```
C:\bambu-tramitologia-gt\
  CLAUDE.md
  mockup\index.html          maqueta de referencia (no se publica)
  datos\                     Excel de catálogos y de carga inicial
  migracion\                 código de importación a Firestore (se conserva)
  app\                       React + Vite
  functions\                 Cloud Functions (reporte semanal)
  firestore.rules
  firestore.indexes.json
  firebase.json
```

## Acceso y seguridad

- Login con Google limitado al dominio bambudev.com.
- Estar en el dominio no basta: el correo debe existir en la colección `usuarios`, activo y con un rol. Sin eso, la app muestra una pantalla de "solicita acceso".
- La restricción real va en las reglas de Firestore (dominio + correo verificado + usuario registrado y activo). La restricción en el botón de login es solo cosmética.
- Roles fijos y jerárquicos, definidos en código y reglas (no hay pantalla de roles): `admin` > `gestor` > `consulta`. Cada rol incluye los permisos del anterior.
  - `consulta`: lee todo.
  - `gestor`: además crea y edita trámites, seguimientos y subactividades, y marca trámites como `no_aplica`.
  - `admin`: además administra usuarios, catálogos y plantillas.
- Todos los roles ven todos los proyectos.
- En la práctica solo Jose y el gestor del área eléctrica crean trámites; el resto de gestores da seguimiento a trámites existentes. Es un acuerdo de trabajo, no una restricción técnica.
- Al crear un trámite, la app avisa si ya existe uno abierto con el mismo proyecto, institución y nombre, y pide confirmar.
- Pantalla de Usuarios (solo admin): agregar por correo, asignar rol, desactivar. No se borran usuarios (su autoría se conserva en la bitácora).
- Un admin no puede quitarse su propio rol ni desactivarse. Siempre debe quedar al menos un admin activo.
- Primer admin: jrimola@bambudev.com. Su documento se crea a mano en la consola de Firestore, una sola vez. El resto se da de alta desde la pantalla de Usuarios (lista inicial en el Excel de catálogos, pestaña Usuarios iniciales; segundo admin: Juan Cáceres, jcaceres@bambudev.com).
- Encargado de un trámite = usuario con rol `gestor` o `admin`. Terceros (consultores, diseñadores) van en el campo proveedor.

## Decisiones de modelo

1. **Quién tiene la pelota.** Cada trámite abierto indica si espera acción de BAMBU (`nosotros`) o de la institución (`institucion`). Se actualiza con cada seguimiento. Nunca se deduce del texto de las notas.
2. **Seguimiento vs subactividad.** Un seguimiento registra algo que ya pasó (bitácora). Una subactividad es algo programado, con fecha, responsable, estado y resultado.
3. **Próxima acción** = la subactividad pendiente más cercana. No es un campo aparte.
4. **Fechas separadas.** Resolución esperada (detecta atrasos de la institución) y vencimiento de licencia (solo en tipos de trámite que lo piden; dispara alerta de renovación 120 días antes).
5. **Flujo del trámite** (validado con Jose): Preparar expediente (nos toca) → Ingreso (espera institución) → Piden correcciones (nos toca) ⇄ Entregamos correcciones (espera institución) → Obtenido → Renovación programada como trámite nuevo.
6. **Plantillas por tipología.** Al crear un proyecto se generan los trámites de la plantilla de su tipología según sus condiciones. Los que no correspondan pasan a `no_aplica` con justificación obligatoria; no cuentan en dashboard ni reporte, pero siguen visibles. Se pueden agregar trámites fuera de la plantilla.
7. **Condiciones del proyecto**, marcadas al crearlo: junto a carretera, costa/lago/río, requiere tala, financiamiento FHA. El resto de la plantilla es "Siempre".
8. **Lifestyle** hereda la plantilla de Vivienda horizontal o vertical según el campo `producto` del proyecto, más sus trámites propios (OCRET, autoridad de cuenca).
9. **Campos visibles según tipo de trámite.** No se usa "N/A" campo por campo.
10. **Fase del trámite:** `desarrollo` u `operacion`. "Operaciones" no es una tipología.

## Catálogos

- Tipologías (se diseña para las 4 aunque hoy no existan todas): Comercial (plazas El Encuentro), Vivienda horizontal (por ejemplo Naire), Vivienda vertical (edificios de apartamentos), Lifestyle (vivienda o apartamentos en zonas turísticas o de recreación).
- Carga inicial: `datos/catalogos-tramitologia-gt.xlsx` (versión validada por Jose). Municipalidades: una por municipio.
- Pantalla Catálogos (solo admin): tipologías, proyectos, instituciones, tipos de trámite, plantillas y tipos de subactividad, todos editables.
- Los registros en uso no se borran: se desactivan. Los trámites guardan el ID, así que renombrar se refleja en todos.
- Las plantillas de Vivienda vertical y Lifestyle son borrador hasta validarlas con un proyecto real (Apartamentos Jalapa será el primero de Vivienda vertical).

## Estados

- Trámite: `no_iniciado`, `en_curso`, `obtenido`, `denegado`, `no_aplica`.
- Subactividad: `pendiente`, `realizada`, `cancelada`.

## Tipos de subactividad

- Visita o inspección de campo (resultado: sin observaciones / con observaciones / reprogramada).
- Ronda de correcciones (entregadas / pendientes). Permite medir rondas por institución.
- Entregable de proveedor o consultor (recibido / atrasado).
- Cita o reunión con la institución (realizada / reprogramada).
- Notificación o retiro de resolución (favorable / desfavorable).
- Fuera de alcance: pagos de boletas, publicación de edictos.

## Modelo de datos en Firestore

```
usuarios/{correo}                 nombre, rol, activo, uid? (se llena en el primer login)
                                  ID = correo en minúsculas (permite dar de alta antes del primer login)
tipologias/{id}                   nombre, descripcion, activo
proyectos/{id}                    nombre, tipologiaId, producto? ("horizontal" | "vertical", solo Lifestyle),
                                  municipio, departamento, fase, junto_carretera, costa_lago_rio,
                                  requiere_tala, financiamiento_fha, activo
instituciones/{id}                siglas, nombre, tipo, activo
tiposTramite/{id}                 nombre, pideVencimiento, activo
plantillas/{id}                   tipologiaId, nombreTramite, institucionId, tipoTramiteId, fase,
                                  condicion ("siempre" | "junto_carretera" | "costa_lago_rio" |
                                  "requiere_tala" | "financiamiento_fha"), activo
tiposSubactividad/{id}            nombre, resultados[], activo
tramites/{id}                     codigo, proyectoId, tipologiaId (denormalizado), nombre, institucionId,
                                  numeroExpediente?, tipoTramiteId, fase, prioridad, estado,
                                  resp ("nosotros" | "institucion"), encargadoId, proveedor?,
                                  fechaIngreso?, fechaResolucionEsperada?, fechaObtencion?,
                                  fechaVencimientoLicencia?, justificacionNoAplica?,
                                  proximaAccionFecha? (denormalizado de subactividades),
                                  ultimoMovimiento, origen ("app" | "reporte_clickup"),
                                  creadoPor, creadoEn, actualizadoEn
tramites/{id}/seguimientos/{id}   fecha, autorId, texto, resp
tramites/{id}/subactividades/{id} tipoId, descripcion, fechaProgramada, responsableId, estado,
                                  resultado?, notas?
reportes/{id}                     fechaGeneracion, periodoDesde, periodoHasta, enviado, error?
```

- Con cientos de trámites, cargar los abiertos y filtrar en el navegador. Evitar consultas con muchos filtros que exijan índices compuestos.
- Fechas en formato ISO `AAAA-MM-DD`; zona horaria America/Guatemala.
- Prioridad: `baja`, `media`, `alta`, `urgente`.

## Validaciones obligatorias

- No se puede registrar fecha de obtención si el estado no es `obtenido`.
- No se puede poner fecha de ingreso futura si el estado es `en_curso`.
- La resolución esperada no puede ser anterior al ingreso.
- `no_aplica` exige justificación.
- El vencimiento de licencia solo se habilita en tipos de trámite que lo piden.

## Errores de la app de El Salvador que no se deben replicar

- "Vencen esta semana" mayor que "Vencen este mes" (los rangos deben ser consistentes o excluyentes y rotulados).
- Fecha de obtención precargada con la fecha de hoy aunque el estado sea pendiente.
- Bitácora que es solo otra lista de trámites en lugar de un historial de movimientos.
- Subítems como texto libre sin fecha ni responsable.

## Reporte semanal

- Se genera todos los sábados a las 10:00 (America/Guatemala). Cubre del sábado anterior a las 10:00 hasta el momento de generarlo.
- Lo reciben todos los usuarios activos de la app, por correo con el PDF adjunto. También se descarga desde la app en cualquier momento.
- Implementación: función programada (Cloud Scheduler) + generación del PDF en servidor + envío por SMTP de Gmail directo con contraseña de aplicación, desde una cuenta @gmail.com creada por Jose solo para notificaciones. La cuenta tiene verificación en dos pasos y acceso compartido con Juan Cáceres.
- Las credenciales se guardan como secretos de Firebase, nunca en el código ni en Git.
- Cada ejecución queda registrada en `reportes`. Si el envío falla, se avisa a los admin.

## Carga inicial de trámites

- No se lee ClickUp. La fuente es el reporte PDF de ClickUp del 21/09/2026: 17 trámites abiertos de 10 proyectos, asignados a Jose.
- Ese reporte excluye trámites de otros responsables, subtareas, trámites cerrados, comentarios y licencias vigentes. Lo que no esté ahí se carga a mano en la app.
- Proceso: `datos/carga-inicial-tramites.xlsx` (preparado por Claude, revisado por Jose) → Code lo importa a Firestore con código guardado en `migracion/`. La importación debe poder repetirse sin duplicar (usar el código del trámite como ID).

## Piloto

- Apartamentos Jalapa (ingreso de trámites 15 oct 2026) se lleva en paralelo en ClickUp y en la app, registrado por una sola persona el mismo día.
- ClickUp es la fuente oficial hasta el corte. Criterio sugerido de corte: dos reportes semanales seguidos que coincidan con ClickUp.

## Orden de trabajo sugerido

1. Preparar el entorno: Git, repositorio, proyecto de Firebase, estructura de carpetas.
2. Login + reglas de seguridad + pantalla de Usuarios.
3. Catálogos (carga desde Excel + pantalla de edición).
4. Trámites: creación desde plantilla, detalle, seguimientos, subactividades.
5. Vistas: dashboard, agenda, calendario, bitácora, lista de trámites, filtros.
6. Carga inicial de los 17 trámites.
7. Reporte semanal: descarga en PDF desde la app; después envío automático (requiere Blaze).

## Contexto

- La app de El Salvador (hecha en Lovable) es independiente. A corto y mediano plazo no se unen; a largo plazo no se descarta ni se asegura.
- Las correcciones de datos del reporte de ClickUp se revisan con Jose cuando la herramienta esté lista.
