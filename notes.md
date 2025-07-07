# Tabla de Contenidos

- 📌 [Actualización de Branch](#actualización-de-branch)
- 📦 [Generación y Manejo de Archivos .aab y .apk](#generación-y-manejo-de-archivos-aab-y-apk)
- ⚙️ [Activar Entorno Virtual y Ejecutar run.py](#activar-entorno-virtual-y-ejecutar-runpy)
- 📊 [Priorización de Funcionalidades](#priorización-de-funcionalidades)
- ✅ [Tareas Pendientes](#tareas-pendientes)

## 📌 Actualización de Branch

### 🔄 Actualizar la rama principal:
```bash
eas update --branch main
```

### 🚀 Publicar con un mensaje:
```bash
eas update --branch staging --message "Prueba de cambios"
```

## 📦 Generación y Manejo de Archivos .aab y .apk

### 📂 Generar el archivo .aab con EAS Build:
```bash
eas build --platform android --profile production
```

### 🔄 Convertir el archivo .aab en un .apk:
```bash
java -jar bundletool-all.jar build-apks \
    --bundle="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.aab" \
    --output="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.apks" \
    --mode=universal
```

### 🔑 Firmar el archivo .apk (añade tu keystore y contraseñas):
```bash
java -jar bundletool-all.jar build-apks \
    --bundle="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.aab" \
    --output="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.apks" \
    --mode=universal \
    --ks="C:\Users\Diego-lap\Desktop\Desarrollo completo\9e\mobile-app\credentials\android\keystore.jks" \
```

## ⚙️ Activar Entorno Virtual y Ejecutar run.py

### 🔧 Para tu entorno Flask / Python, puedes activar el virtualenv y lanzar la aplicación:
#### 🖥️ Activar el entorno:
```powershell
.\venv\Scripts\Activate.ps1
```

### 🛠️ Set PYTHONPATH
```
$env:PYTHONPATH = "$env:PYTHONPATH;."
```

#### ▶️ Ejecutar la aplicación:
```bash
flask run
```
*(Asegúrate de estar en la carpeta adecuada al lanzar estos comandos.)*

---

# Notas actualizadas de desarrollo

## 📊 Priorización de Funcionalidades
| **Funcionalidad** | **Impacto** | **Complejidad** | **Prioridad** |
|---|---|---|---|
| **🔔 Notificaciones push remotas** (para recordatorios y actualizaciones) | 🔥 Alta | ⚡ Media | 🥇 Alta |
| **📖 Diario postparto** (seguimiento después del embarazo) | 🚀 Media | 🔧 Media-Alta | 🥈 Media |
| **💬 Foro / Comunidad** (interacción entre usuarias) | 💡 Alta | 🔥 Alta | 🥉 Media-Baja |
| **🤖 IA para recomendaciones** (personalización de la experiencia) | 🧠 Muy Alta | 🛠️ Muy Alta | 🔜 Baja |

### 📅 Plan de Implementación por Sprints
✅ **Sprint 1 (2-3 semanas):** Implementación de notificaciones push remotas.  
✅ **Sprint 2 (3-4 semanas):** Desarrollo del diario postparto.  
✅ **Sprint 3 (4-5 semanas):** Pruebas e iteraciones con feedback de usuarios.  
✅ **Sprint 4 (Exploración):** Evaluación del foro/comunidad o IA según avance.  

---

## ✅ Tareas Pendientes
✅ **Sprint 1 - 🔔 Notificaciones push remotas**
- [x] 📡 Configurar Firebase Cloud Messaging / Expo Notifications.
- [x] 🔗 Integrar backend Flask para el envío de notificaciones.
- [x] 📱 Probar y validar en dispositivos reales.

✅ **Sprint 2 - 📖 Postparto**
- [x] 🗄️ Diseñar la base de datos para entradas del diario.
- [x] 🎨 Crear UI para agregar, editar y visualizar Posparto.
- [x] 🔄 Sincronizar con backend.
- [ ] 📝 Crear estado de posparto.
- [ ] 📝 minimizar componente de registro.


✅ **Sprint 3 - 🛠️ Pruebas e iteraciones**
- [ ] 📝 Recoger feedback de usuarios.
- [ ] ⚡ Optimizar el rendimiento de la app.

✅ **Sprint 4 - 🏗️ Evaluación de nuevas funciones**
- [ ] 🧐 Explorar viabilidad del foro/comunidad.
- [ ] 🤖 Analizar integración de IA en futuras versiones.

## 🔄 Cambios Recientes Implementados

### 🔐 Mejora en la experiencia de inicio de sesión
- ✅ Rediseño de la pantalla de login para ofrecer una experiencia más intuitiva
- ✅ Implementación de flujo contextual para usuarios recurrentes con opción biométrica
- ✅ Jerarquización visual clara de los métodos de autenticación
- ✅ Adición del logo de la aplicación para reforzar la identidad de marca
- ✅ Divisores visuales para separar claramente las opciones de inicio de sesión

### ⚙️ Corrección de la pestaña Settings.tsx
- ✅ Corrección de problemas en la configuración de ajustes
- ✅ Mejora de la interfaz de usuario para mayor claridad
- ✅ Optimización del rendimiento

### 📱 Próximos pasos
- [ ] Finalizar la UI del diario postparto
- [ ] Iniciar pruebas beta con usuarios reales
- [ ] Analizar métricas de uso para optimizar la experiencia
- [ ] Analizar métricas de uso para optimizar la experiencia

