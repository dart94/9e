export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

//Validar contraseña (mínimo 6 caracteres)
interface ValidatePassword {
  (password: string): boolean;
}
export const validatePassword: ValidatePassword = (password) => {
  return password.length >= 6;
};

// Validar nombre de usuario (sin espacios y longitud mínima)
interface ValidateUsername {
  (username: string): boolean;
}

export const validateUsername: ValidateUsername = (username) => {
  return username.trim().length >= 3;
};
