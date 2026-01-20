# Primeros pasos con Database Power

Esta guía te ayudará a configurar y usar Database Power para conectarte a tus bases de datos.

## Instalación

### Paso 1: Instalar el servidor MCP

El servidor MCP debe instalarse **fuera** del power:

```bash
cd database-mcp-server
npm install
```

### Paso 2: Obtener la ruta absoluta

```bash
pwd
# Ejemplo: /Users/tu-usuario/projects/database-mcp-server
```

### Paso 3: Configurar el power

1. Abre el archivo `mcp.json` en la raíz del power
2. Reemplaza `/ruta/absoluta/a/database-mcp-server/index.js` con tu ruta real
3. Edita la variable de entorno `DB_CONNECTIONS` con tus conexiones

### Ejemplo para PostgreSQL:

```json
{
  "mcpServers": {
    "database-server": {
      "command": "node",
      "args": ["/Users/tu-usuario/projects/database-mcp-server/index.js"],
      "env": {
        "DB_CONNECTIONS": "{\"postgresql\":[{\"name\":\"local-dev\",\"host\":\"localhost\",\"port\":5432,\"database\":\"myapp_dev\",\"user\":\"postgres\",\"password\":\"dev123\"}],\"mysql\":[],\"oracle\":[]}"
      }
    }
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

- No commitees el `mcp.json` con passwords reales
- Usa variables de entorno para passwords sensibles
- Considera usar archivos de configuración separados por entorno
- Limita los permisos del usuario de base de datos a solo lectura si es posible

## Troubleshooting

### Error: "Cannot find module 'pg'"
Ejecuta `npm install` en la carpeta `server/`

### Error: "Connection refused"
Verifica que el host y puerto sean correctos y que la base de datos esté corriendo

### Error: "Authentication failed"
Revisa el usuario y password en la configuración
