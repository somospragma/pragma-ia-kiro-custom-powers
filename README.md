# Pragma custom powers para Kiro

Powers de Kiro hechos en Pragma. Hoy trae uno: **Pragma Database Manager**, que conecta Kiro a bases de datos PostgreSQL, MySQL y Oracle para explorar schemas, consultar con `SELECT`, exportar a CSV y ver las relaciones entre tablas.

| Carpeta | Qué es |
|---|---|
| `powers/pragma-database-power/` | El power: `POWER.md`, `mcp.json` y las guías de `steering/`. Es lo que se importa en Kiro. |
| `servers/database-mcp-server/` | El servidor MCP que usa el power. Vive fuera del power porque Kiro solo carga `POWER.md`, `mcp.json` y `steering/` desde la carpeta del power. |

## Instalación

Necesitas [Kiro](https://kiro.dev) y Node.js 18 o superior.

1. Clona el repositorio e instala las dependencias del servidor MCP:

   ```bash
   git clone https://github.com/somospragma/pragma-ia-kiro-custom-powers.git
   cd pragma-ia-kiro-custom-powers/servers/database-mcp-server
   npm install
   pwd
   ```

   Guarda la ruta que imprime `pwd`.

2. En `powers/pragma-database-power/mcp.json`, cambia la ruta de `args` por la que guardaste, terminada en `/index.js`:

   ```json
   {
     "mcpServers": {
       "database-server": {
         "command": "node",
         "args": ["/Users/dev-user/pragma-ia-kiro-custom-powers/servers/database-mcp-server/index.js"],
         "env": {
           "DB_CONNECTIONS": "{\"postgresql\":[],\"mysql\":[],\"oracle\":[]}"
         }
       }
     }
   }
   ```

3. En Kiro, abre el panel **Powers** → **Add Custom Power** → **Import power from a folder** y elige la carpeta `powers/pragma-database-power`.

## Uso rápido

Pídele a Kiro que configure una conexión. El agente arma el JSON de `DB_CONNECTIONS` y actualiza `mcp.json`:

```text
Configura una conexión PostgreSQL llamada pg-local en localhost:5432, database my-app, usuario postgres
```

Después pregunta en lenguaje natural:

```text
Lista las conexiones de base de datos disponibles
Lista las tablas del schema public en pg-local
Describe la tabla orders en public
Ejecuta SELECT id, status FROM orders LIMIT 20 en pg-local
Exporta SELECT * FROM orders WHERE created_at > '2026-01-01' a orders.csv
Visualiza las relaciones del schema public en pg-local
```

## Configuración

Las conexiones van en la variable `DB_CONNECTIONS` de `mcp.json`, como un string JSON con una lista por motor:

| Motor | Campos | Puerto por defecto |
|---|---|---|
| `postgresql` | `name`, `host`, `port`, `database`, `user`, `password` | 5432 |
| `mysql` | `name`, `host`, `port`, `database`, `user`, `password` | 3306 |
| `oracle` | `name`, `host`, `port`, `serviceName`, `user`, `password` | 1521 |

Herramientas que expone el servidor MCP:

| Herramienta | Qué hace |
|---|---|
| `list_connections` | Lista las conexiones configuradas. |
| `list_schemas` | Lista los schemas de una conexión. |
| `list_tables` | Lista las tablas de un schema. |
| `describe_table` | Columnas, tipos y constraints de una tabla. |
| `execute_query` | Ejecuta un `SELECT`. Límite por defecto 100 filas, máximo 1000. |
| `export_query_csv` | Ejecuta un `SELECT` y lo guarda en CSV. Límite por defecto 1000 filas, máximo 10 000. |
| `get_table_relationships` | Foreign keys de una tabla. |
| `visualize_schema_relationships` | Diagrama de texto de las relaciones de un schema. |

### Seguridad

- El servidor solo acepta consultas que empiezan por `SELECT` o `WITH` y rechaza palabras como `INSERT`, `UPDATE`, `DELETE` o `DROP`. Es un filtro de texto, no una transacción de solo lectura: conéctalo con un usuario de base de datos que solo tenga permisos de lectura.
- No subas `mcp.json` con contraseñas reales al repositorio.

## Compatibilidad

- Node.js 18 o superior.
- PostgreSQL, MySQL (y MariaDB) y Oracle.

## Contribución

1. Crea una rama desde `main`.
2. Prueba el servidor con `npm install` y `npm start` en `servers/database-mcp-server`, y el power importándolo en Kiro.
3. Abre un pull request. Lo revisa el Backend Chapter.

Cada PR, cada push a `main` y cada lunes corre el workflow **Security**:

- gitleaks busca secretos en toda la historia;
- CodeQL analiza el JavaScript y los workflows;
- zizmor revisa las GitHub Actions;
- `pnpm audit` revisa las dependencias del servidor MCP;
- dependency review revisa las dependencias que agrega cada PR.

Dependabot propone cada semana las actualizaciones de las acciones y de las dependencias del servidor.

## Licencia

[Apache-2.0](LICENSE).

## Owners

[Backend Chapter](https://github.com/orgs/somospragma/teams/backend-chapter) (`@somospragma/backend-chapter`).
