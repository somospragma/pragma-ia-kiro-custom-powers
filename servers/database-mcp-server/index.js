#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ConnectionManager } from './connections.js';

const connectionManager = new ConnectionManager(process.env.DB_CONNECTIONS);

const server = new Server(
  {
    name: 'database-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Validate SELECT query - security check
function isSelectQuery(query) {
  const trimmed = query.trim().toUpperCase();

  // Allow only SELECT and WITH (CTE)
  if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
    return false;
  }

  // Block dangerous keywords even in comments or strings
  const dangerousKeywords = [
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE',
    'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
  ];

  for (const keyword of dangerousKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(trimmed)) {
      return false;
    }
  }

  return true;
}

// Convert rows to CSV format
function rowsToCSV(rows) {
  if (!rows || rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const csvHeaders = headers.join(',');

  const csvRows = rows.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_connections',
        description: 'Lista todas las conexiones de base de datos configuradas',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_schemas',
        description: 'Lista los schemas disponibles en una conexión',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
          },
          required: ['connectionName'],
        },
      },
      {
        name: 'list_tables',
        description: 'Lista las tablas en un schema específico',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
            schema: {
              type: 'string',
              description: 'Nombre del schema',
            },
          },
          required: ['connectionName', 'schema'],
        },
      },
      {
        name: 'describe_table',
        description: 'Muestra la estructura de una tabla (columnas, tipos, constraints)',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
            schema: {
              type: 'string',
              description: 'Nombre del schema',
            },
            table: {
              type: 'string',
              description: 'Nombre de la tabla',
            },
          },
          required: ['connectionName', 'schema', 'table'],
        },
      },
      {
        name: 'execute_query',
        description: 'Ejecuta una consulta SELECT en la base de datos',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
            query: {
              type: 'string',
              description: 'Query SELECT a ejecutar',
            },
            limit: {
              type: 'number',
              description: 'Límite de resultados (default: 100, max: 1000)',
              default: 100,
            },
          },
          required: ['connectionName', 'query'],
        },
      },
      {
        name: 'export_query_csv',
        description: 'Ejecuta una consulta SELECT y exporta los resultados a un archivo CSV',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
            query: {
              type: 'string',
              description: 'Query SELECT a ejecutar',
            },
            filename: {
              type: 'string',
              description: 'Nombre del archivo CSV (ej: export.csv)',
            },
            limit: {
              type: 'number',
              description: 'Límite de resultados (default: 1000, max: 10000)',
              default: 1000,
            },
          },
          required: ['connectionName', 'query', 'filename'],
        },
      },
      {
        name: 'get_table_relationships',
        description: 'Obtiene las relaciones (foreign keys) de una tabla',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
            schema: {
              type: 'string',
              description: 'Nombre del schema',
            },
            table: {
              type: 'string',
              description: 'Nombre de la tabla',
            },
          },
          required: ['connectionName', 'schema', 'table'],
        },
      },
      {
        name: 'visualize_schema_relationships',
        description: 'Genera un diagrama de texto (ASCII) de las relaciones entre tablas de un schema',
        inputSchema: {
          type: 'object',
          properties: {
            connectionName: {
              type: 'string',
              description: 'Nombre de la conexión',
            },
            schema: {
              type: 'string',
              description: 'Nombre del schema',
            },
          },
          required: ['connectionName', 'schema'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_connections': {
        const connections = connectionManager.listConnections();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(connections, null, 2),
            },
          ],
        };
      }

      case 'list_schemas': {
        const { connectionName } = args;
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let result;
          if (type === 'postgresql') {
            result = await client.query(
              `SELECT schema_name 
               FROM information_schema.schemata 
               WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
               ORDER BY schema_name`
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          } else if (type === 'mysql') {
            const [rows] = await client.query(
              `SELECT schema_name 
               FROM information_schema.schemata 
               WHERE schema_name NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')
               ORDER BY schema_name`
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(rows, null, 2),
                },
              ],
            };
          } else if (type === 'oracle') {
            result = await client.execute(
              `SELECT username as schema_name 
               FROM all_users 
               ORDER BY username`
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          }
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      case 'list_tables': {
        const { connectionName, schema } = args;
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let result;
          if (type === 'postgresql') {
            result = await client.query(
              `SELECT table_name, table_type 
               FROM information_schema.tables 
               WHERE table_schema = $1 
               ORDER BY table_name`,
              [schema]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          } else if (type === 'mysql') {
            const [rows] = await client.query(
              `SELECT table_name, table_type 
               FROM information_schema.tables 
               WHERE table_schema = ? 
               ORDER BY table_name`,
              [schema]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(rows, null, 2),
                },
              ],
            };
          } else if (type === 'oracle') {
            result = await client.execute(
              `SELECT table_name, 'BASE TABLE' as table_type 
               FROM all_tables 
               WHERE owner = :schema 
               ORDER BY table_name`,
              [schema.toUpperCase()]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          }
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      case 'describe_table': {
        const { connectionName, schema, table } = args;
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let result;
          if (type === 'postgresql') {
            result = await client.query(
              `SELECT 
                 column_name, 
                 data_type, 
                 character_maximum_length,
                 is_nullable,
                 column_default
               FROM information_schema.columns 
               WHERE table_schema = $1 AND table_name = $2 
               ORDER BY ordinal_position`,
              [schema, table]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          } else if (type === 'mysql') {
            const [rows] = await client.query(
              `SELECT 
                 column_name, 
                 data_type, 
                 character_maximum_length,
                 is_nullable,
                 column_default
               FROM information_schema.columns 
               WHERE table_schema = ? AND table_name = ? 
               ORDER BY ordinal_position`,
              [schema, table]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(rows, null, 2),
                },
              ],
            };
          } else if (type === 'oracle') {
            result = await client.execute(
              `SELECT 
                 column_name, 
                 data_type, 
                 data_length as character_maximum_length,
                 nullable as is_nullable,
                 data_default as column_default
               FROM all_tab_columns 
               WHERE owner = :schema AND table_name = :table 
               ORDER BY column_id`,
              [schema.toUpperCase(), table.toUpperCase()]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          }
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      case 'execute_query': {
        const { connectionName, query, limit = 100 } = args;

        if (!isSelectQuery(query)) {
          throw new Error('Solo se permiten queries SELECT o WITH. Queries de modificación (INSERT, UPDATE, DELETE, DROP, etc.) están bloqueadas por seguridad.');
        }

        const maxLimit = Math.min(limit, 1000);
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let result;
          if (type === 'postgresql') {
            const queryWithLimit = query.trim().toUpperCase().includes('LIMIT')
              ? query
              : `${query} LIMIT ${maxLimit}`;
            result = await client.query(queryWithLimit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    rowCount: result.rowCount,
                    rows: result.rows,
                  }, null, 2),
                },
              ],
            };
          } else if (type === 'mysql') {
            const queryWithLimit = query.trim().toUpperCase().includes('LIMIT')
              ? query
              : `${query} LIMIT ${maxLimit}`;
            const [rows] = await client.query(queryWithLimit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    rowCount: rows.length,
                    rows: rows,
                  }, null, 2),
                },
              ],
            };
          } else if (type === 'oracle') {
            result = await client.execute(query, [], { maxRows: maxLimit });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    rowCount: result.rows.length,
                    rows: result.rows,
                  }, null, 2),
                },
              ],
            };
          }
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      case 'export_query_csv': {
        const { connectionName, query, filename, limit = 1000 } = args;

        if (!isSelectQuery(query)) {
          throw new Error('Solo se permiten queries SELECT o WITH. Queries de modificación están bloqueadas por seguridad.');
        }

        const maxLimit = Math.min(limit, 10000);
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let rows;
          if (type === 'postgresql') {
            const queryWithLimit = query.trim().toUpperCase().includes('LIMIT')
              ? query
              : `${query} LIMIT ${maxLimit}`;
            const result = await client.query(queryWithLimit);
            rows = result.rows;
          } else if (type === 'mysql') {
            const queryWithLimit = query.trim().toUpperCase().includes('LIMIT')
              ? query
              : `${query} LIMIT ${maxLimit}`;
            const [mysqlRows] = await client.query(queryWithLimit);
            rows = mysqlRows;
          } else if (type === 'oracle') {
            const result = await client.execute(query, [], { maxRows: maxLimit });
            rows = result.rows;
          }

          const csv = rowsToCSV(rows);

          return {
            content: [
              {
                type: 'text',
                text: `Exportados ${rows.length} registros a ${filename}\n\nContenido CSV:\n${csv}`,
              },
            ],
          };
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      case 'get_table_relationships': {
        const { connectionName, schema, table } = args;
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let result;
          if (type === 'postgresql') {
            result = await client.query(
              `SELECT
                 tc.constraint_name,
                 kcu.column_name,
                 ccu.table_schema AS foreign_table_schema,
                 ccu.table_name AS foreign_table_name,
                 ccu.column_name AS foreign_column_name
               FROM information_schema.table_constraints AS tc
               JOIN information_schema.key_column_usage AS kcu
                 ON tc.constraint_name = kcu.constraint_name
                 AND tc.table_schema = kcu.table_schema
               JOIN information_schema.constraint_column_usage AS ccu
                 ON ccu.constraint_name = tc.constraint_name
                 AND ccu.table_schema = tc.table_schema
               WHERE tc.constraint_type = 'FOREIGN KEY'
                 AND tc.table_schema = $1
                 AND tc.table_name = $2`,
              [schema, table]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          } else if (type === 'mysql') {
            const [rows] = await client.query(
              `SELECT
                 constraint_name,
                 column_name,
                 referenced_table_schema AS foreign_table_schema,
                 referenced_table_name AS foreign_table_name,
                 referenced_column_name AS foreign_column_name
               FROM information_schema.key_column_usage
               WHERE table_schema = ?
                 AND table_name = ?
                 AND referenced_table_name IS NOT NULL`,
              [schema, table]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(rows, null, 2),
                },
              ],
            };
          } else if (type === 'oracle') {
            result = await client.execute(
              `SELECT
                 a.constraint_name,
                 a.column_name,
                 c_pk.owner AS foreign_table_schema,
                 c_pk.table_name AS foreign_table_name,
                 b.column_name AS foreign_column_name
               FROM all_cons_columns a
               JOIN all_constraints c ON a.owner = c.owner
                 AND a.constraint_name = c.constraint_name
               JOIN all_constraints c_pk ON c.r_owner = c_pk.owner
                 AND c.r_constraint_name = c_pk.constraint_name
               JOIN all_cons_columns b ON c_pk.owner = b.owner
                 AND c_pk.constraint_name = b.constraint_name
                 AND b.position = a.position
               WHERE c.constraint_type = 'R'
                 AND a.owner = :schema
                 AND a.table_name = :table`,
              [schema.toUpperCase(), table.toUpperCase()]
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.rows, null, 2),
                },
              ],
            };
          }
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      case 'visualize_schema_relationships': {
        const { connectionName, schema } = args;
        const { client, type } = await connectionManager.getConnection(connectionName);

        try {
          let relationships = [];

          if (type === 'postgresql') {
            const result = await client.query(
              `SELECT
                 tc.table_name,
                 kcu.column_name,
                 ccu.table_name AS foreign_table_name,
                 ccu.column_name AS foreign_column_name
               FROM information_schema.table_constraints AS tc
               JOIN information_schema.key_column_usage AS kcu
                 ON tc.constraint_name = kcu.constraint_name
                 AND tc.table_schema = kcu.table_schema
               JOIN information_schema.constraint_column_usage AS ccu
                 ON ccu.constraint_name = tc.constraint_name
                 AND ccu.table_schema = tc.table_schema
               WHERE tc.constraint_type = 'FOREIGN KEY'
                 AND tc.table_schema = $1
               ORDER BY tc.table_name`,
              [schema]
            );
            relationships = result.rows;
          } else if (type === 'mysql') {
            const [rows] = await client.query(
              `SELECT
                 table_name,
                 column_name,
                 referenced_table_name AS foreign_table_name,
                 referenced_column_name AS foreign_column_name
               FROM information_schema.key_column_usage
               WHERE table_schema = ?
                 AND referenced_table_name IS NOT NULL
               ORDER BY table_name`,
              [schema]
            );
            relationships = rows;
          } else if (type === 'oracle') {
            const result = await client.execute(
              `SELECT
                 a.table_name,
                 a.column_name,
                 c_pk.table_name AS foreign_table_name,
                 b.column_name AS foreign_column_name
               FROM all_cons_columns a
               JOIN all_constraints c ON a.owner = c.owner
                 AND a.constraint_name = c.constraint_name
               JOIN all_constraints c_pk ON c.r_owner = c_pk.owner
                 AND c.r_constraint_name = c_pk.constraint_name
               JOIN all_cons_columns b ON c_pk.owner = b.owner
                 AND c_pk.constraint_name = b.constraint_name
                 AND b.position = a.position
               WHERE c.constraint_type = 'R'
                 AND a.owner = :schema
               ORDER BY a.table_name`,
              [schema.toUpperCase()]
            );
            relationships = result.rows;
          }

          // Generate ASCII diagram
          let diagram = `\nDiagrama de relaciones del schema: ${schema}\n`;
          diagram += '='.repeat(50) + '\n\n';

          const tableMap = new Map();
          for (const rel of relationships) {
            const tableName = rel.table_name || rel.TABLE_NAME;
            if (!tableMap.has(tableName)) {
              tableMap.set(tableName, []);
            }
            tableMap.get(tableName).push(rel);
          }

          for (const [table, rels] of tableMap) {
            diagram += `┌─ ${table}\n`;
            for (const rel of rels) {
              const col = rel.column_name || rel.COLUMN_NAME;
              const fTable = rel.foreign_table_name || rel.FOREIGN_TABLE_NAME;
              const fCol = rel.foreign_column_name || rel.FOREIGN_COLUMN_NAME;
              diagram += `│  └─ ${col} ──→ ${fTable}.${fCol}\n`;
            }
            diagram += '│\n';
          }

          return {
            content: [
              {
                type: 'text',
                text: diagram,
              },
            ],
          };
        } finally {
          connectionManager.releaseConnection(client, type);
        }
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Database MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  await connectionManager.closeAll();
  process.exit(0);
});
