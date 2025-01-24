# Guía de Comandos para Proyectos

Este README contiene los comandos que suelo usar en mis proyectos relacionados con Expo, EAS y manejo de archivos .aab y .apk. Es una referencia personal para agilizar el desarrollo y despliegue.

## Actualizar Branch
1. Actualizar la rama principal:
   ```bash
   eas update --branch main
   ```

2. Publicar con un mensaje:
   ```bash
   eas update --branch staging --message "Prueba de cambios"
   ```

## Generación y Manejo de Archivos .aab y .apk
1. Generar el archivo `.aab` con EAS Build:
   ```bash
   eas build --platform android --profile production
   ```

2. Convertir el archivo `.aab` en un `.apk`:
   ```bash
   java -jar bundletool-all.jar build-apks --bundle="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.aab" --output="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.apks" --mode=universal
   ```

3. Firmar el archivo `.apk`:
   ```bash
   java -jar bundletool-all.jar build-apks --bundle="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.aab" --output="C:\Users\Diego-lap\Desktop\Desarrollo completo\bundletool\9mm.apks" --mode=universal --ks="C:\Users\Diego-lap\Desktop\Desarrollo completo\9e\mobile-app\credentials\android\keystore.jks" --ks-pass=pass:bfac85484ec600ec52a8bcee50e57435 --ks-key-alias=5ecae2bf0f33ae2e2159ab0e87cbf4c3 --key-pass=pass:2e3f0d00bdf7506177b26c1950a66bf6
   ```

---

Guarda este archivo en un lugar accesible para referencia rápida. Si decides subirlo a GitHub más adelante, puedes hacerlo en un repositorio privado o público según lo prefieras.


---
# Agregar validación al correo