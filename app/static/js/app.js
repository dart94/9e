document.addEventListener("DOMContentLoaded", () => {
    // Función reutilizable para SweetAlert2
    const showAlert = ({ title, text, icon = "info", showLoading = false }) => {
        Swal.fire({
            title,
            text,
            icon,
            allowOutsideClick: false,
            showConfirmButton: !showLoading,
            didOpen: showLoading ? () => Swal.showLoading() : null,
        });
    };

    // SweetAlert2 para Flash Messages
    const flashMessagesElement = document.getElementById("flash-messages");
    if (flashMessagesElement) {
        const flashMessages = JSON.parse(flashMessagesElement.textContent || "[]");
        if (flashMessages.length > 0) {
            flashMessages.forEach(([category, message]) => {
                showAlert({
                    title: category === "success" ? "Éxito" : "Error",
                    text: message,
                    icon: category === "success" ? "success" : "error",
                });
            });
        }
    }

    // Formulario de Restablecimiento de Contraseña
    const resetPasswordForm = document.getElementById("reset-password-form");
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Detener envío inmediato del formulario

            Swal.fire({
                title: "Enviando solicitud...",
                text: "Por favor espera mientras procesamos tu solicitud.",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            // Simular un retraso y mostrar alerta de éxito
            setTimeout(() => {
                Swal.fire({
                    title: "Correo enviado",
                    text: "Revisa tu bandeja de entrada para continuar el proceso.",
                    icon: "success",
                }).then(() => {
                    resetPasswordForm.submit(); // Enviar el formulario después de la confirmación
                });
            }, 2000);
        });
    }

    // Formulario de Nueva Contraseña
    const newPasswordForm = document.getElementById("new-password-form");
    if (newPasswordForm) {
        newPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Detener envío inmediato del formulario

            Swal.fire({
                title: "Procesando...",
                text: "Guardando tu nueva contraseña. Por favor espera.",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            // Simular un breve retraso antes de mostrar éxito
            setTimeout(() => {
                Swal.fire({
                    title: "Contraseña actualizada",
                    text: "Tu contraseña ha sido actualizada con éxito.",
                    icon: "success",
                }).then(() => {
                    newPasswordForm.submit(); // Enviar el formulario después de la confirmación
                });
            }, 2000);
        });
    }

    // Formulario de Nuevo Embarazo
    const newEmbarazoForm = document.getElementById("new-embarazo-form");
    if (newEmbarazoForm) {
        newEmbarazoForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Detener envío inmediato del formulario

            Swal.fire({
                title: "Guardando registro...",
                text: "Por favor espera mientras procesamos tu registro.",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            // Simular un breve retraso antes de mostrar éxito
            setTimeout(() => {
                Swal.fire({
                    title: "Registro exitoso",
                    text: "Tu registro ha sido guardado correctamente.",
                    icon: "success",
                }).then(() => {
                    newEmbarazoForm.submit(); // Enviar el formulario después de la confirmación
                });
            }, 2000);
        });
    }

    // Toggle Sidebar
    const toggleButton = document.getElementById("toggle-sidebar");
    const sidebar = document.getElementById("sidebar");
    if (toggleButton && sidebar) {
        toggleButton.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    } else {
        console.error("No se encontraron los elementos del DOM necesarios para el sidebar.");
    }
});
