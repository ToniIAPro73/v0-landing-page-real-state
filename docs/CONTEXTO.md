# Contexto del trabajo en `app/page.tsx`

## Estado actual
- El archivo se mantiene como Client Component (`"use client"`) y compila correctamente una vez que se elimina el lock de Turbopack.
- El hero del bloque Dossier muestra el badge premium "Dossier de Inversión Exclusivo" con la tilde corregida y, justo debajo, la línea "Análisis financiero completo y proyecciones del Efecto Wynn" en blanco.
- La sección de FAQ utiliza el panel compacto con hover para mostrar/ocultar respuestas.
- El formulario del dossier divide los campos con proporciones distintas (Nombre más estrecho que Apellidos) y mantiene la automatización simulada (HubSpot + script Python + almacenamiento interno).

## Pendientes
1. **Texto descriptivo largo**: volver a colocar los dos párrafos previos a los checks tal como estaban en el contenido original ("Acceda al análisis más completo..." y "Forme parte de una comunidad exclusiva...").
2. **Dimensiones del card CTA**: el contenedor actual ocupa ~620 px de ancho; hay que reducir ligeramente la altura y el padding (sobre todo vertical) para igualarlo a la proporción vista en Captura.png. Ajustar también la malla del formulario si aún se desea mayor contraste entre Nombre/Apellidos.
3. **Verificación visual**: tras los cambios, revisar en desktop al 100 % de zoom y en mobile para confirmar que el nuevo layout cabe sin scroll extra.

## Próximos pasos sugeridos
1. Ajustar `app/page.tsx`:
   - Reinsertar los párrafos del copy largo antes del listado de highlights.
   - Retocar el ancho/alto del card y los inputs (reducir padding vertical, mantener proporción 0.7/1.3 entre campos) asegurando que las clases de Tailwind sigan coherentes.
2. Ejecutar `npm run dev` (o reiniciar la instancia previa) para validar que no quedan locks y comparar con las capturas.
3. Documentar en este mismo Markdown cualquier cambio adicional para tener un histórico de contexto cuando se reanude el trabajo.
