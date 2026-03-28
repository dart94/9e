import axios from 'axios';

/**
 * Traduce errores de API/red a mensajes amigables para el usuario.
 * Nunca expone mensajes técnicos como status codes o stack traces.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error. Inténtalo de nuevo.'
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Sin conexión a internet. Verifica tu red e inténtalo de nuevo.';
    }
    const status = error.response.status;
    if (status === 401) return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    if (status === 403) return 'No tienes permiso para realizar esta acción.';
    if (status === 404) return 'No se encontró la información solicitada.';
    if (status >= 500) return 'El servidor no está disponible. Inténtalo más tarde.';
    const serverMsg: unknown =
      error.response?.data?.message ?? error.response?.data?.error;
    if (
      typeof serverMsg === 'string' &&
      serverMsg.length < 200 &&
      !serverMsg.includes('<') &&
      !serverMsg.toLowerCase().includes('error:') &&
      !serverMsg.toLowerCase().includes('stack')
    ) {
      return serverMsg;
    }
  }
  return fallback;
}
