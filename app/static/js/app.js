document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-sidebar");
    const sidebar = document.getElementById("sidebar");

    if (toggleButton && sidebar) {
        // Alternar entre abrir y cerrar el sidebar
        toggleButton.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    } else {
        console.error("No se encontraron los elementos del DOM necesarios para el sidebar.");
    }
});