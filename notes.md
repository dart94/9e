# Tabla de Contenidos

- [Actualización de Branch](#actualización-de-branch)
- [Generación y Manejo de Archivos .aab y .apk](#generación-y-manejo-de-archivos-aab-y-apk)
- [Activar entorno virtual y ejecutar run.py](#activar-entorno-virtual-y-ejecutar-runpy)
- [Tareas Pendientes](#tareas-pendientes)

## Actualización de Branch

### Actualizar la rama principal:
```bash
eas update --branch main
```

### Publicar con un mensaje:
```bash
eas update --branch staging --message "Prueba de cambios"
```

## Generación y Manejo de Archivos .aab y .apk

### Generar el archivo .aab con EAS Build:
```bash
eas build --platform android --profile production
```

### Convertir el archivo .aab en un .apk:
```bash
java -jar bundletool-all.jar build-apks \
    --bundle="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.aab" \
    --output="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.apks" \
    --mode=universal
```

### Firmar el archivo .apk (añade tu keystore y contraseñas):
```bash
java -jar bundletool-all.jar build-apks \
    --bundle="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.aab" \
    --output="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.apks" \
    --mode=universal \
    --ks="C:\Users\Diego-lap\Desktop\Desarrollo completo\9e\mobile-app\credentials\android\keystore.jks" \

```

## Activar entorno virtual y ejecutar run.py

### Para tu entorno Flask / Python, puedes activar el virtualenv y lanzar la aplicación:

#### Activar el entorno:
```powershell
.\venv\Scripts\Activate.ps1
```

#### Ejecutar la aplicación:
```bash
python -m backend.run
```
*(Asegúrate de estar en la carpeta adecuada al lanzar estos comandos.)*

## Tareas Pendientes

- ~~Agregar validación de correo en el backend.~~
- Mejoras de accesibilidad
- Agregar login Google
- Agregar datepicker
- Cambiar avisos
- Validar eliminar registros.
- Registro de citas medicas(Nueva versión).
- Información de la cita medica(Nueva Versión)
