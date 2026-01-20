import mysql from 'mysql2/promise.js';
import oracledb from 'oracledb';
import pg from 'pg';

const { Pool } = pg;

export class ConnectionManager {
  constructor(configJson) {
    this.connections = new Map();

    // Si configJson es un objeto, usarlo directamente; si es string, parsearlo
    if (typeof configJson === 'object' && configJson !== null) {
      this.config = configJson;
    } else if (typeof configJson === 'string') {
      this.config = JSON.parse(configJson);
    } else {
      this.config = { postgresql: [], mysql: [], oracle: [] };
    }

    this.initializeConnections();
  }

  initializeConnections() {
    // PostgreSQL connections
    if (this.config.postgresql) {
      for (const conn of this.config.postgresql) {
        this.connections.set(conn.name, {
          type: 'postgresql',
          config: conn,
          pool: null
        });
      }
    }

    // MySQL connections
    if (this.config.mysql) {
      for (const conn of this.config.mysql) {
        this.connections.set(conn.name, {
          type: 'mysql',
          config: conn,
          pool: null
        });
      }
    }

    // Oracle connections
    if (this.config.oracle) {
      for (const conn of this.config.oracle) {
        this.connections.set(conn.name, {
          type: 'oracle',
          config: conn,
          pool: null
        });
      }
    }
  }

  listConnections() {
    const result = [];
    for (const [name, conn] of this.connections) {
      result.push({
        name,
        type: conn.type,
        host: conn.config.host,
        database: conn.config.database || conn.config.serviceName
      });
    }
    return result;
  }

  async getConnection(name) {
    const conn = this.connections.get(name);
    if (!conn) {
      throw new Error(`Connection '${name}' not found`);
    }

    if (conn.type === 'postgresql') {
      if (!conn.pool) {
        conn.pool = new Pool({
          host: conn.config.host,
          port: conn.config.port,
          database: conn.config.database,
          user: conn.config.user,
          password: conn.config.password,
          max: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
      }
      return { client: await conn.pool.connect(), type: 'postgresql' };
    } else if (conn.type === 'mysql') {
      if (!conn.pool) {
        conn.pool = mysql.createPool({
          host: conn.config.host,
          port: conn.config.port,
          database: conn.config.database,
          user: conn.config.user,
          password: conn.config.password,
          waitForConnections: true,
          connectionLimit: 5,
          queueLimit: 0,
          connectTimeout: 10000
        });
      }
      return { client: await conn.pool.getConnection(), type: 'mysql' };
    } else if (conn.type === 'oracle') {
      if (!conn.pool) {
        conn.pool = await oracledb.createPool({
          user: conn.config.user,
          password: conn.config.password,
          connectString: `${conn.config.host}:${conn.config.port}/${conn.config.serviceName}`,
          poolMin: 1,
          poolMax: 5,
          poolIncrement: 1
        });
      }
      return { client: await conn.pool.getConnection(), type: 'oracle' };
    }

    throw new Error(`Unknown connection type: ${conn.type}`);
  }

  releaseConnection(client, type) {
    if (type === 'postgresql') {
      client.release();
    } else if (type === 'mysql') {
      client.release();
    } else if (type === 'oracle') {
      client.close();
    }
  }

  async closeAll() {
    for (const [name, conn] of this.connections) {
      if (conn.pool) {
        try {
          if (conn.type === 'postgresql') {
            await conn.pool.end();
          } else if (conn.type === 'mysql') {
            await conn.pool.end();
          } else if (conn.type === 'oracle') {
            await conn.pool.close();
          }
        } catch (err) {
          console.error(`Error closing connection ${name}:`, err);
        }
      }
    }
  }
}
