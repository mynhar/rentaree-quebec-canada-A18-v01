# Prompts para Claude Code (VS Code) — los 3 pendientes de Rentaree

Pégalos **de uno en uno**, en este orden. Espera a terminar y verificar cada uno antes del siguiente.
(El orden importa: el i18n toca todas las plantillas, así que conviene hacerlo con el resto ya estable.)

---

## 1 · Subida de fotos

```
Implementa la subida de fotos de propiedades.

Contexto: el bucket `property-photos` ya existe en Supabase Storage (público en lectura,
escritura para autenticados). La tabla `property_media` ya existe con las columnas
property_id, media_type, storage_path, embed_url, sort_order.

Requisitos:
- En el formulario de nueva propiedad (features/properties/property-form/), añade una sección
  para subir fotos: seleccionar archivos, arrastrar y soltar, y previsualización en miniatura.
- Poder reordenar las miniaturas (la primera es la portada de la tarjeta) y eliminarlas antes de guardar.
- Al guardar la propiedad: sube los archivos a `property-photos` bajo una ruta que incluya el id
  de la propiedad, y crea las filas en `property_media` con media_type='photo' y el sort_order correcto.
- Valida tipo (jpg/png/webp) y tamaño máximo razonable; muestra progreso y errores.
- El escáner también debe poder subir fotos desde su panel (features/scanning/).

Sigue el sistema visual de src/styles.css (tokens, .btn, .input). Nada de librerías nuevas si se
puede resolver con Angular puro. Al terminar, corre `ng build` y arregla los errores.
```

---

## 2 · i18n a francés

**Primero pide la decisión, no el código:**

```
Necesito internacionalizar Rentaree: francés por defecto (el mercado es Quebec, donde el francés
es el idioma comercial por ley) más inglés, y decidir qué hacemos con el español actual.

Antes de escribir nada de código: analiza el proyecto y propóneme dos opciones —Angular i18n
nativo (@angular/localize) vs Transloco— comparando para ESTE caso concreto: cambio de idioma en
caliente sin recargar, número de builds/despliegues, esfuerzo de migrar plantillas inline,
traducción de textos que están en TypeScript (mensajes de error, PROPERTY_TYPES, CA_PROVINCES),
y SEO de la landing.

Dame una recomendación clara y espera mi confirmación antes de implementar.
```

**Después de elegir, el segundo mensaje:**

```
Implementa la opción que acordamos.

Alcance:
- Todos los textos de interfaz: landing, auth, quebec-city, property-form, property-detail,
  scanner-dashboard, admin.
- También los textos que viven en TypeScript: las etiquetas de PROPERTY_TYPES y CA_PROVINCES en
  core/config/constants.ts, los mensajes de error traducidos de Supabase en auth.component.ts,
  y las etiquetas de estado de scan_requests.
- Selector de idioma FR/EN en la barra superior, con la preferencia persistida.
- FR como idioma por defecto. Fechas y números en formato canadiense.
- Los precios ya usan formatCAD() en core/util/format.ts: revisa que el locale sea coherente.

Empieza por un solo componente (auth) como piloto, muéstramelo, y cuando lo apruebe sigue con el
resto. Al terminar, corre `ng build` y arregla los errores.
```

---

## 3 · Edición de propiedades

```
Implementa la edición de propiedades existentes.

Reglas:
- El dueño puede editar sus propias propiedades; el administrador, cualquiera.
  Las políticas RLS ya lo permiten (owner_id, scanned_by, is_admin) — no las debilites.
- Reutiliza el formulario de features/properties/property-form/ en modo edición en vez de duplicarlo:
  ruta /propiedad/:id/editar, precarga los datos, y en el submit hace update en lugar de insert.
- El expediente NO se puede modificar (lo genera la BD). Muéstralo como solo lectura.
- Permite cambiar el `status` (borrador / disponible / alquilada / inactiva): es como el dueño
  retira una propiedad del mercado.
- Añade el botón "Editar" en la ficha (property-detail) y en la tarjeta, visible solo si el usuario
  es el dueño o es administrador.
- Permite añadir y eliminar fotos también en edición.

Al terminar, corre `ng build` y arregla los errores.
```

---

## Consejos de uso

- **De uno en uno.** Los tres juntos generan un diff enorme e irrevisable.
- **Haz commit entre tarea y tarea**, así puedes revertir con `git` si algo se tuerce.
- Si Claude Code propone instalar una librería que no esperabas, pregúntale por qué antes de aceptar.
- Puedes seleccionar código en el editor y preguntar sobre esa selección; y arrastrar archivos al
  chat para darle foco.
- Si el resultado se desvía de la estética, recuérdale: *"revisa CLAUDE.md, sección Sistema visual"*.
