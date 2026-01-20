# Configuración de MySQL

## Instalación de dependencias

El power usa `mysql2` que es compatible con MySQL 5.7+ y MariaDB 10.2+.

```bash
cd database-power/server
npm install
```

## Configuración de conexión MySQL

Formato de configuración para MySQL en `mcp.json`:

```json
{
  "mysql": [
    {
      "name": "mysql-local",
      "host": "localhost",
      "port": 3306,
      "database": "mydb",
      "user": "root",
      "password": "password"
    }
  ]
}
```

### Parámetros de conexión:

- **name**: Identificador único de la conexión (requerido)
- **host**: Servidor MySQL (default: localhost)
- **port**: Puerto MySQL (default: 3306)
- **database**: Nombre de la base de datos (requerido)
- **user**: Usuario de MySQL (requerido)
- **password**: Contraseña (requerido)

## Diferencias con PostgreSQL y Oracle

### Schemas en MySQL

MySQL usa el concepto de "database" en lugar de "schema". Cuando uses `list_schemas`, verás las bases de datos disponibles.

```
"Lista los schemas de mysql-local"  # Muestra las databases
```

### Sintaxis de queries

#### Límites:
```sql
-- MySQL
SELECT * FROM users LIMIT 10;

-- PostgreSQL (también funciona en MySQL)
SELECT * FROM users LIMIT 10;

-- Oracle (diferente)
SELECT * FROM users WHERE ROWNUM <= 10;
```

#### Fechas:
```sql
-- MySQL
SELECT * FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- PostgreSQL
SELECT * FROM orders WHERE created_at >= NOW() - INTERVAL '7 days';

-- Oracle
SELECT * FROM orders WHERE created_at >= SYSDATE - 7;
```

#### Concatenación:
```sql
-- MySQL
SELECT CONCAT(first_name, ' ', last_name) FROM users;

-- PostgreSQL
SELECT first_name || ' ' || last_name FROM users;

-- Oracle (igual que PostgreSQL)
SELECT first_name || ' ' || last_name FROM users;
```

## Permisos necesarios

El usuario de MySQL necesita al menos estos permisos:

```sql
-- Para consultas básicas
GRANT SELECT ON mydb.* TO 'app_user'@'%';

-- Para ver metadata (schemas, tablas, columnas)
GRANT SELECT ON information_schema.* TO 'app_user'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

## Troubleshooting

### Error: "Client does not support authentication protocol"

MySQL 8.0+ usa `caching_sha2_password` por defecto. Si tienes problemas:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"

Actualiza el método de autenticación:

```sql
ALTER USER 'user'@'host' IDENTIFIED WITH mysql_native_password BY 'password';
```

### Error: "Access denied"

Verifica:
1. Usuario y password correctos
2. Host permitido en MySQL (`'user'@'localhost'` vs `'user'@'%'`)
3. Permisos otorgados correctamente

```sql
-- Ver permisos del usuario
SHOW GRANTS FOR 'user'@'host';
```

### Error: "Unknown database"

Verifica que la base de datos existe:

```sql
SHOW DATABASES;
```

## Configuración de producción

### Usar SSL/TLS

Para conexiones seguras, MySQL soporta SSL. Aunque no está implementado en la versión actual, puedes extender la configuración:

```json
{
  "name": "mysql-prod",
  "host": "prod.example.com",
  "port": 3306,
  "database": "production",
  "user": "app_user",
  "password": "secure_password",
  "ssl": {
    "rejectUnauthorized": true
  }
}
```

### Connection pooling

El power usa connection pooling automáticamente con estos valores:

- **connectionLimit**: 5 conexiones máximas
- **waitForConnections**: true (espera si no hay conexiones disponibles)
- **queueLimit**: 0 (sin límite de cola)
- **connectTimeout**: 10000ms (10 segundos)

## Ejemplos de uso

```
"Lista los schemas de mysql-local"
"Muestra las tablas del schema mydb en mysql-local"
"Describe la tabla users en mydb"
"Ejecuta SELECT * FROM users WHERE active = 1 LIMIT 10 en mysql-local"
"Exporta SELECT * FROM orders WHERE date > '2024-01-01' a orders.csv"
"Visualiza las relaciones del schema mydb en mysql-local"
```

## Compatibilidad con MariaDB

Este power es totalmente compatible con MariaDB ya que usa el mismo protocolo y driver (`mysql2`).

Configuración idéntica:

```json
{
  "name": "mariadb-local",
  "host": "localhost",
  "port": 3306,
  "database": "mydb",
  "user": "root",
  "password": "password"
}
```
