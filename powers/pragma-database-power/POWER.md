---
name: "pragma-database-manager-power"
displayName: "Pragma Database Manager Power"
description: "Conecta y consulta múltiples bases de datos PostgreSQL, MySQL y Oracle - schemas, tablas, queries SELECT, exportación CSV y visualización de relaciones"
keywords: ["database", "sql", "postgresql", "mysql", "oracle", "query", "schema", "tables", "db", "csv", "export", "relationships", "datos", "base de datos"]
---

# Database Power

Conecta y consulta múltiples bases de datos PostgreSQL, MySQL y Oracle desde Kiro.

## Onboarding

### Paso 1: Instalar el power

Necesitas Node.js 18 o superior. No hace falta clonar el repositorio.

En Kiro, abre el panel **Powers** → **Add Custom Power** → **Import power from GitHub** y pega esta URL:

```text
https://github.com/somospragma/pragma-ia-kiro-custom-powers/tree/main/powers/pragma-database-power
```

Kiro instala el power con el nombre `pragma-database-power`.

### Paso 2: Servidor MCP

No tienes que instalar nada más. El `mcp.json` del power arranca el servidor con `npx`, que lo descarga desde GitHub e instala sus dependencias la primera vez (tarda unos segundos):

```json
{
  "mcpServers": {
    "database-server": {
      "command": "npx",
      "args": ["-y", "github:somospragma/pragma-ia-kiro-custom-powers"],
      "env": {
        "DB_CONNECTIONS": "{\"postgresql\":[],\"mysql\":[],\"oracle\":[]}"
      }
    }
  }
}
```

Kiro registra este servidor en `~/.kiro/settings/mcp.json`, dentro de `powers.mcpServers`, con el nombre `power-pragma-database-power-database-server`.

### Paso 3: Revisar que el servidor esté activo

En el panel **MCP Servers** de Kiro debe aparecer `power-pragma-database-power-database-server` conectado. Si sale con error, revisa que `node --version` sea 18 o superior.

### Paso 4: Configurar tus conexiones

Pídele al agente que configure tus conexiones. El agente te ayudará a convertir la configuración al formato correcto automáticamente.

**Ejemplo:**
```
"Configura una conexión MySQL llamada 'local-db' en localhost:3306, 
database 'myapp', usuario 'root', password 'password123'"
```

El agente:
1. Creará el objeto JSON con tu configuración
2. Lo convertirá automáticamente a string escapado
3. Actualizará `DB_CONNECTIONS` del servidor `power-pragma-database-power-database-server` en `~/.kiro/settings/mcp.json`
4. Te confirmará que está listo

**Tipos de base de datos soportados:**

- **PostgreSQL**: name, host, port (5432), database, user, password
- **MySQL**: name, host, port (3306), database, user, password  
- **Oracle**: name, host, port (1521), serviceName, user, password

**Nota**: Carga el steering `#setup-configuration.md` si necesitas ayuda detallada con la configuración.

### Paso 5: Verificar la instalación

Una vez configurado, pregunta:

```
"Lista las conexiones de base de datos disponibles"
```

Si ves tus conexiones, ¡todo está listo!

## Características

- **Múltiples conexiones**: Configura varias conexiones para PostgreSQL, MySQL y Oracle
- **Exploración de schemas**: Lista y explora schemas de bases de datos
- **Consulta de tablas**: Ve todas las tablas disponibles en cada schema
- **Estructura de tablas**: Consulta columnas, tipos de datos y constraints
- **Ejecución de queries**: Ejecuta consultas SELECT de forma segura
- **Exportación a CSV**: Exporta resultados de queries a archivos CSV
- **Relaciones entre tablas**: Visualiza foreign keys y dependencias
- **Diagrama de relaciones**: Genera diagramas ASCII de las relaciones del schema

## Herramientas disponibles

### list_connections
Lista todas las conexiones configuradas.

**Ejemplo**: "Lista las conexiones de base de datos"

### list_schemas
Lista los schemas disponibles en una conexión.

**Parámetros**:
- `connectionName`: Nombre de la conexión

**Ejemplo**: "Muestra los schemas de pg-local"

### list_tables
Lista las tablas en un schema específico.

**Parámetros**:
- `connectionName`: Nombre de la conexión
- `schema`: Nombre del schema

**Ejemplo**: "Lista las tablas del schema public en pg-local"

### describe_table
Muestra la estructura de una tabla (columnas, tipos, constraints).

**Parámetros**:
- `connectionName`: Nombre de la conexión
- `schema`: Nombre del schema
- `table`: Nombre de la tabla

**Ejemplo**: "Describe la tabla users en public"

### execute_query
Ejecuta una consulta SELECT.

**Parámetros**:
- `connectionName`: Nombre de la conexión
- `query`: Query SELECT a ejecutar
- `limit`: (opcional) Límite de resultados (default: 100, max: 1000)

**Ejemplo**: "Ejecuta SELECT * FROM users WHERE active = true LIMIT 10 en pg-local"

### export_query_csv
Ejecuta una consulta SELECT y exporta los resultados a CSV.

**Parámetros**:
- `connectionName`: Nombre de la conexión
- `query`: Query SELECT a ejecutar
- `filename`: Nombre del archivo CSV
- `limit`: (opcional) Límite de resultados (default: 1000, max: 10000)

**Ejemplo**: "Exporta SELECT * FROM orders WHERE date > '2024-01-01' a orders.csv"

### get_table_relationships
Obtiene las relaciones (foreign keys) de una tabla.

**Parámetros**:
- `connectionName`: Nombre de la conexión
- `schema`: Nombre del schema
- `table`: Nombre de la tabla

**Ejemplo**: "Muestra las relaciones de la tabla orders en public"

### visualize_schema_relationships
Genera un diagrama ASCII de las relaciones entre tablas de un schema.

**Parámetros**:
- `connectionName`: Nombre de la conexión
- `schema`: Nombre del schema

**Ejemplo**: "Visualiza las relaciones del schema public en pg-local"

## Seguridad

- **Solo queries SELECT**: Queries de modificación (INSERT, UPDATE, DELETE, DROP, etc.) están bloqueadas
- **Validación estricta**: Se bloquean palabras clave peligrosas incluso en comentarios
- **Límites de resultados**: Protección contra queries que devuelvan millones de filas
- **Connection pooling**: Gestión eficiente de conexiones
- **Timeouts**: Límites de tiempo para evitar queries infinitas

## Ejemplos de uso

```
"Lista las conexiones disponibles"
"Muestra los schemas de la conexión pg-local"
"Lista las tablas del schema public en pg-local"
"Describe la tabla users"
"Ejecuta SELECT id, name, email FROM users WHERE active = true LIMIT 20 en pg-local"
"Exporta SELECT * FROM orders WHERE created_at > '2024-01-01' a orders_2024.csv"
"Muestra las relaciones de la tabla orders en public"
"Visualiza las relaciones del schema public"
```

## Cuando cargar archivos de steering

- Configurando conexiones de base de datos → `setup-configuration.md`
- Configurando MySQL específicamente → `mysql-setup.md`
- Escribiendo queries complejas o avanzadas → `advanced-queries.md`
- Exportando datos o visualizando relaciones → `export-and-relationships.md`
- Primeros pasos con el power → `getting-started.md`

## Troubleshooting

### Error: "Connection not found"
- Verifica que el nombre de la conexión exista en `DB_CONNECTIONS`
- Verifica que el formato JSON de `DB_CONNECTIONS` sea válido (debe estar en una línea)

### El servidor no arranca
- Verifica que tengas Node.js 18 o superior y acceso a github.com
- La primera vez `npx` descarga el servidor y sus dependencias; espera unos segundos

### Error: "Connection refused"
- Verifica que la base de datos esté corriendo
- Verifica host, puerto, usuario y password en la configuración

### Error: "Authentication failed"
- Revisa el usuario y password en la configuración
- Verifica los permisos del usuario en la base de datos

## Requisitos

- Node.js 18+
- PostgreSQL client libraries (para conexiones PostgreSQL)
- MySQL client libraries (incluidas en mysql2)
- Oracle Instant Client (para conexiones Oracle - requiere instalación separada)

## Notas importantes

⚠️ **Las conexiones viven en `~/.kiro/settings/mcp.json`.** Cuando actualizas el power (**Check for updates** → **Install updates**), Kiro vuelve a escribir la entrada `power-pragma-database-power-database-server` desde el `mcp.json` del power y `DB_CONNECTIONS` queda vacío. Guarda una copia de tus conexiones antes de actualizar.

⚠️ **No subas a ningún repositorio un `mcp.json` con passwords reales**, y usa un usuario de base de datos de solo lectura.

⚠️ **El servidor MCP vive fuera del power** porque Kiro solo carga `POWER.md`, `mcp.json` y `steering/` desde la carpeta del power. `npx` lo trae desde la raíz del repositorio.
