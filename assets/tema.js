/* Tema: claro por defecto; oscuro solo si la persona lo eligió (se aplica antes de pintar para no parpadear). */
try { if (localStorage.getItem("pais_tema") === "dark") document.documentElement.dataset.theme = "dark"; } catch (_) {}
