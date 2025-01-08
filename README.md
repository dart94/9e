# Proyecto: Seguimiento de Embarazo

## Descripción
Este proyecto es una aplicación completa para el seguimiento de embarazos, dividida en dos componentes principales:

1. **Backend:** Construido con Flask, maneja la lógica del servidor, la API y la base de datos.
2. **Aplicación Móvil:** Desarrollada con React Native y Expo, proporciona una interfaz de usuario moderna e intuitiva.

---

## Características

### **Backend:**
- Autenticación con JWT.
- Base de datos SQLite para almacenamiento de datos.
- Migraciones de base de datos con Alembic.
- Rutas protegidas para usuarios autenticados.
- API para información de desarrollo fetal.

### **Aplicación Móvil:**
- Autenticación con correo, contraseña y biometría (huella digital).
- Registro de datos de embarazos (peso, síntomas, notas).
- Visualización de desarrollo fetal semanal.
- Perfil editable y progreso del embarazo.

---

## Estructura del Proyecto

### **Backend:**
```
backend/
├── config.py          # Configuración del proyecto
├── run.py             # Punto de entrada del servidor Flask
├── app/               # Lógica principal de la aplicación
│   ├── models.py      # Modelos de la base de datos
│   ├── routes.py      # Rutas de la aplicación
│   ├── utils.py       # Funciones utilitarias
│   └── api/           # API para información adicional
│       ├── fetal_development_api.py
│       └── fetal_development_data.json
├── migrations/        # Migraciones de base de datos
└── instance/
    └── pregnancy_tracker.db
```

### **Aplicación Móvil:**
```
mobile-app/
├── app/                # Navegación y vistas
│   ├── (auth)/         # Pantallas de autenticación
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── settings.tsx
│   │   └── dashboard.tsx
├── theme/              # Estilos y temas
│   ├── styles.ts
│   └── theme.ts
├── components/         # Componentes reutilizables
├── config/             # Configuración de la aplicación
└── assets/             # Imágenes y fuentes
```

---

## Instalación y Configuración

### **Backend:**
1. Clonar el repositorio.
2. Navegar al directorio `backend`.
3. Crear un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate # Linux/macOS
   venv\Scripts\activate # Windows
   ```
4. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
5. Configurar las variables de entorno en `.env` (ver archivo de ejemplo `.env.example`).
6. Realizar migraciones:
   ```bash
   flask db upgrade
   ```
7. Iniciar el servidor:
   ```bash
   flask run
   ```

### **Aplicación Móvil:**
1. Navegar al directorio `mobile-app`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar la aplicación:
   ```bash
   expo start
   ```

---

## Tecnologías Utilizadas

### **Backend:**
- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended

### **Aplicación Móvil:**
- React Native
- Expo
- Axios
- AsyncStorage
- SecureStore

---

## Mejoras Futuras

1. **Backend:**
   - Implementar roles y permisos de usuario.
   - Integración con herramientas de monitoreo como Sentry.

2. **Aplicación Móvil:**
   - Agregar soporte para modo oscuro.
   - Implementar notificaciones push para recordatorios.

3. **General:**
   - Crear pruebas unitarias para asegurar la estabilidad del proyecto.

---

## Contribuir
Si deseas contribuir a este proyecto:
1. Haz un fork del repositorio.
2. Crea una rama para tu nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Envía un pull request explicando los cambios realizados.

---

## Contacto
Para preguntas o comentarios:
- **Email:** riveratorrero@gmail.com


