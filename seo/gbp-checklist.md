# Google Business Profile — Checklist de alta para DoctorCar

> La palanca #1 de conversión local pendiente. Un taller en Rosario vive del map pack
> (los 3 resultados con mapa) tanto o más que del orgánico. Tiempo estimado: 30-45 min
> de carga + 5-14 días de verificación de Google.

## Datos a cargar (NAP — usar EXACTAMENTE estos, idénticos al sitio)

| Campo | Valor |
|-------|-------|
| Nombre | DoctorCar |
| Dirección | 9 de julio 4231, Rosario, Santa Fe |
| Teléfono | 341 269-7000 |
| Sitio web | https://www.doctorcar.com.ar |
| Horarios | Lunes a Viernes 8:00–18:00 |
| Categoría principal | Taller de chapa y pintura |
| Categorías secundarias | Taller de reparación de automóviles · Servicio de reparación de carrocerías |

**Regla NAP**: nombre, dirección y teléfono tienen que ser idénticos en GBP, el footer
del sitio, `/contacto`, `/sobre-doctorcar` y el schema LocalBusiness. Cualquier
inconsistencia (ej. "Tel: +54 9 341..." en un lado y "341 269-7000" en otro está OK
como formato, pero el número tiene que ser el mismo) diluye la señal local.

## Pasos

1. Entrar a https://business.google.com con la cuenta de Google del negocio
   (ideal: una cuenta propia del taller, no personal).
2. Buscar "DoctorCar Rosario" — si Google ya tiene una ficha sin reclamar, **reclamarla**
   en vez de crear una nueva (evita duplicados).
3. Cargar los datos de la tabla de arriba.
4. Verificación: Google va a ofrecer video, teléfono o carta postal. La carta tarda
   5-14 días; el video suele ser inmediato (mostrar frente del taller, cartel y herramientas).
5. **Fotos** (mínimo para arrancar):
   - Frente del taller con cartel visible (foto de portada)
   - Interior: cabina de pintura, elevadores, zona de trabajo
   - 2-3 trabajos antes/después (con permiso del cliente, sin patentes visibles)
   - Logo (usar `/public/logo.jpeg`)
6. **Descripción del negocio** (750 caracteres máx). Sugerida:

   > Taller de chapa y pintura en Rosario especializado en reparación de siniestros,
   > granizo (desabollado sin pintura/PDR), enderezado de carrocería y pintura
   > automotor con matizado computarizado. Gestionamos el siniestro de punta a punta
   > con tu aseguradora: peritaje, autorización y facturación directa — trabajamos
   > con La Caja, Sancor, Allianz, Federación Patronal, Zurich, San Cristóbal y más.
   > Presupuesto sin cargo en 24 hs enviando fotos por WhatsApp. Atendemos Rosario
   > y Gran Rosario: Funes, Roldán, Granadero Baigorria, Villa Gobernador Gálvez,
   > San Lorenzo y alrededores.

7. **Servicios**: cargar los 7 (chapa y pintura, siniestros, granizo, abolladuras sin
   pintura/PDR, enderezado de carrocería, pintura automotor, peritaje de aseguradora).
8. **Atributos**: "Se requiere cita" si aplica, formas de pago.
9. Activar **mensajes** y responder rápido (afecta ranking local).
10. **Reviews**: pedir 5-10 reseñas a clientes recientes conformes. Enviarles el link
    directo de reseña que da GBP ("Pedir reseñas"). Responder TODAS las reseñas,
    buenas y malas. Es el factor #1 del ranking del map pack.
11. **Publicaciones**: 1 por semana el primer mes (antes/después, temporada de granizo,
    aseguradoras). Después 1-2 por mes alcanza.

## Después de verificar

- [ ] Vincular GBP con el perfil de GSC (misma cuenta de Google).
- [ ] Agregar el link de la ficha en `sameAs` del schema LocalBusiness (`app/page.jsx`
      y `lib/schema.js`).
- [ ] Chequear que el pin del mapa esté exactamente sobre el taller.
- [ ] Monitorear en GSC el crecimiento de queries de marca ("doctorcar") — es el
      indicador de que la ficha está trayendo gente.

## Temporada de granizo (recordatorio)

Antes de octubre: publicar posts de GBP sobre reparación de granizo/PDR y subir fotos
de trabajos de granizo. Los spikes post-tormenta también se capturan por el map pack.
