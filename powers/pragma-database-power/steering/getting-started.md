# Primeros pasos con Database Power

Esta guía te ayudará a configurar y usar Database Power para conectarte a tus bases de datos.

## Instalación

### Paso 1: Instalar el power

En Kiro: panel **Powers** → **Add Custom Power** → **Import power from GitHub** con esta URL:

```text
https://github.com/somospragma/pragma-ia-kiro-custom-powers/tree/main/powers/pragma-database-power
```

No hace falta clonar el repositorio ni correr `npm install`: el `mcp.json` del power arranca el servidor con `npx -y github:somospragma/pragma-ia-kiro-custom-powers`.

### Paso 2: Configurar tus conexiones

Pídele al agente que configure una conexión. El agente actualiza `DB_CONNECTIONS` del servidor `power-pragma-database-power-database-server` en `~/.kiro/settings/mcp.json`.

### Ejemplo de la entrada para PostgreSQL:

```json
"power-pragma-database-power-database-server": {
  "command": "npx",
  "args": ["-y", "github:somospragma/pragma-ia-kiro-custom-powers"],
  "env": {
    "DB_CONNECTIONS": "{\"postgresql\":[{\"name\":\"local-dev\",\"host\":\"localhost\",\"port\":5432,\"database\":\"myapp_dev\",\"user\":\"postgres\",\"password\":\"dev123\"}],\"mysql\":[],\"oracle\":[]}"
  }
}
```

Pregunta a Kiro:
- "Lista las conexiones de base de datos disponibles"
- "Muestra los schemas de la conexión local-dev"

## Paso 4: Explorar tu base de datos

```
"Lista las tablas del schema public en local-dev"
"Describe la tabla users"
"Ejecuta SELECT * FROM users LIMIT 5 en local-dev"
```

## Consejos de seguridad

- No subas a ningún repositorio un `mcp.json` con passwords reales
- Usa un usuario de base de datos de solo lectura
- Al actualizar el power, Kiro reescribe la entrada del servidor: guarda una copia de tus conexiones

## Troubleshooting

### El servidor no arranca
Verifica que tengas Node.js 18 o superior y acceso a github.com. La primera vez `npx` descarga el servidor y sus dependencias; espera unos segundos.

### Error: "Connection refused"
Verifica que el host y puerto sean correctos y que la base de datos esté corriendo

### Error: "Authentication failed"
Revisa el usuario y password en la configuración
