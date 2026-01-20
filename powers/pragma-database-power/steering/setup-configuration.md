---
inclusion: manual
---

# Configuración de Conexiones - Guía para el Agente

## Tu rol en el setup

Cuando el usuario te pida configurar conexiones de base de datos, debes ayudarle a convertir la configuración a formato string para el `mcp.json`.

## Proceso paso a paso

### 1. Recopilar información del usuario

Pregunta por los datos necesarios según el tipo de base de datos:

**PostgreSQL:**
- name (nombre de la conexión)
- host
- port (default: 5432)
- database
- user
- password

**MySQL:**
- name (nombre de la conexión)
- host
- port (default: 3306)
- database
- user
- password

**Oracle:**
- name (nombre de la conexión)
- host
- port (default: 1521)
- serviceName (ej: XE, ORCL)
- user
- password

### 2. Crear el objeto JSON

Construye el objeto con la estructura correcta:

```javascript
const config = {
  postgresql: [
    // conexiones postgresql aquí
  ],
  mysql: [
    // conexiones mysql aquí
  ],
  oracle: [
    // conexiones oracle aquí
  ]
};
```

### 3. Convertir a string escapado

Usa este proceso:

```javascript
// 1. Convertir a JSON compacto (sin espacios)
const jsonString = JSON.stringify(config);

// 2. El resultado ya tiene las comillas escapadas correctamente
// Ejemplo de salida:
// {"postgresql":[],"mysql":[{"name":"mysql-local","host":"localhost","port":3306,"database":"mydb","user":"root","password":"pass"}],"oracle":[]}
```

### 4. Actualizar el mcp.json

Edita el archivo `database-power/mcp.json` y actualiza la variable `DB_CONNECTIONS` con el string generado:

```json
{
  "mcpServers": {
    "database-server": {
      "command": "node",
      "args": ["ruta/al/servidor"],
      "env": {
        "DB_CONNECTIONS": "{\"postgresql\":[],\"mysql\":[{\"name\":\"mysql-local\",\"host\":\"localhost\",\"port\":3306,\"database\":\"mydb\",\"user\":\"root\",\"password\":\"pass\"}],\"oracle\":[]}"
      }
    }
  }
}
```

### 5. Confirmar al usuario

Muestra un resumen de las conexiones configuradas y confirma que todo está listo.

## Ejemplos de interacción

### Ejemplo 1: Usuario pide configurar MySQL

**Usuario:** "Configura una conexión MySQL llamada 'prod-db' en localhost:3306, database 'ecommerce', usuario 'admin', password 'secret123'"

**Tu respuesta:**

1. Crear el objeto:
```javascript
{
  "postgresql": [],
  "mysql": [
    {
      "name": "prod-db",
      "host": "localhost",
      "port": 3306,
      "database": "ecommerce",
      "user": "admin",
      "password": "secret123"
    }
  ],
  "oracle": []
}
```

2. Convertir a string y actualizar mcp.json
3. Confirmar: "✅ Conexión MySQL 'prod-db' configurada. Puedes probarla con: 'Lista las conexiones disponibles'"

### Ejemplo 2: Usuario pide agregar otra conexión

**Usuario:** "Agrega una conexión PostgreSQL llamada 'analytics' en db.company.com:5432, database 'analytics_db', usuario 'analyst', password 'pass456'"

**Tu proceso:**

1. Leer el mcp.json actual
2. Parsear el DB_CONNECTIONS existente
3. Agregar la nueva conexión al array de postgresql
4. Convertir todo de nuevo a string
5. Actualizar el mcp.json
6. Confirmar

### Ejemplo 3: Usuario pide ver la configuración actual

**Usuario:** "Muéstrame las conexiones configuradas"

**Tu proceso:**

1. Leer el mcp.json
2. Parsear el DB_CONNECTIONS
3. Mostrar de forma legible las conexiones (sin passwords completos por seguridad)

## Notas importantes

- **Seguridad**: Advierte al usuario que no commitee el mcp.json con passwords reales
- **Validación**: Verifica que los puertos sean números
- **Formato**: Asegúrate de que el JSON esté correctamente escapado
- **Testing**: Sugiere probar la conexión después de configurarla

## Comandos útiles para sugerir

Después de configurar:

```
"Lista las conexiones disponibles"
"Muestra los schemas de [nombre-conexion]"
"Lista las tablas del schema [nombre-schema] en [nombre-conexion]"
```

## Troubleshooting común

Si el usuario reporta errores:

1. **"Connection not found"** → Verificar que el nombre de la conexión esté correcto
2. **"Cannot parse DB_CONNECTIONS"** → Verificar que el JSON esté correctamente escapado
3. **"Connection refused"** → Verificar que la base de datos esté corriendo y accesible
4. **"Authentication failed"** → Verificar usuario y password

## Formato de respuesta recomendado

Cuando configures conexiones, usa este formato:

```
✅ Configuración actualizada

Conexiones configuradas:
- MySQL: prod-db (localhost:3306/ecommerce)
- PostgreSQL: analytics (db.company.com:5432/analytics_db)

Para probar:
"Lista las conexiones disponibles"
```
