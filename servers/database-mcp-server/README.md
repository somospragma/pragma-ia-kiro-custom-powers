# Database MCP Server

Servidor MCP para conexiones a bases de datos PostgreSQL, MySQL y Oracle.

## Instalación

No se instala a mano. El power lo arranca con:

```bash
npx -y github:somospragma/pragma-ia-kiro-custom-powers
```

`npx` descarga el repositorio, instala las dependencias del `package.json` de la raíz y ejecuta este `index.js`.

## Dependencias

- `@modelcontextprotocol/sdk` - SDK del Model Context Protocol
- `pg` - Cliente PostgreSQL
- `mysql2` - Cliente MySQL/MariaDB
- `oracledb` - Cliente Oracle

## Uso

Este servidor se ejecuta a través del power de Kiro. No se ejecuta directamente.

La configuración se pasa a través de la variable de entorno `DB_CONNECTIONS`.

### Formato flexible de configuración

El servidor detecta automáticamente el formato y acepta:

1. **String JSON** (requerido para variables de entorno en MCP):
```bash
DB_CONNECTIONS='{"postgresql":[{"name":"pg-local","host":"localhost","port":5432,"database":"mydb","user":"postgres","password":"pass"}],"mysql":[],"oracle":[]}' node index.js
```

2. **Objeto JavaScript** (si se usa programáticamente):
```javascript
const config = {
  postgresql: [{
    name: "pg-local",
    host: "localhost",
    port: 5432,
    database: "mydb",
    user: "postgres",
    password: "pass"
  }],
  mysql: [],
  oracle: []
};

const manager = new ConnectionManager(config);
```

El `ConnectionManager` detecta automáticamente si recibe un string o un objeto y lo procesa correctamente.

## Herramientas disponibles

1. **list_connections** - Lista todas las conexiones configuradas
2. **list_schemas** - Lista schemas/databases
3. **list_tables** - Lista tablas de un schema
4. **describe_table** - Estructura de una tabla
5. **execute_query** - Ejecuta queries SELECT
6. **export_query_csv** - Exporta resultados a CSV
7. **get_table_relationships** - Foreign keys de una tabla
8. **visualize_schema_relationships** - Diagrama ASCII de las relaciones de un schema
7. **get_table_relationships** - Obtiene foreign keys
8. **visualize_schema_relationships** - Diagrama ASCII de relaciones

## Seguridad

- Solo queries SELECT permitidas
- Validación estricta de keywords peligrosos
- Límites de resultados configurables
- Connection pooling
- Timeouts de conexión

## Desarrollo

Para probar el servidor localmente:

```bash
# Configurar variable de entorno
export DB_CONNECTIONS='{"postgresql":[{"name":"test","host":"localhost","port":5432,"database":"testdb","user":"postgres","password":"password"}],"mysql":[],"oracle":[]}'

# Desde la raíz del repositorio
pnpm install
node servers/database-mcp-server/index.js
```

El servidor se comunica a través de stdio (stdin/stdout) usando el protocolo MCP.
