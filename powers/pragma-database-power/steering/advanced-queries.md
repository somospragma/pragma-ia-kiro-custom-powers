# Consultas avanzadas con Database Power

## Consultas con JOINs

```sql
SELECT u.id, u.name, o.order_date, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
LIMIT 20
```

## Agregaciones

```sql
SELECT 
  category,
  COUNT(*) as total_products,
  AVG(price) as avg_price,
  MAX(price) as max_price
FROM products
GROUP BY category
ORDER BY total_products DESC
```

## Subconsultas

```sql
SELECT *
FROM users
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM orders 
  WHERE created_at > '2024-01-01'
)
LIMIT 50
```

## Filtros complejos

```sql
SELECT *
FROM products
WHERE (category = 'Electronics' AND price < 500)
   OR (category = 'Books' AND stock > 10)
ORDER BY created_at DESC
LIMIT 30
```

## Trabajar con fechas

### PostgreSQL:
```sql
SELECT *
FROM orders
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
```

### Oracle:
```sql
SELECT *
FROM orders
WHERE created_at >= SYSDATE - 7
ORDER BY created_at DESC
```

## Límites y paginación

Siempre usa LIMIT para evitar resultados masivos:

```sql
-- Primeras 50 filas
SELECT * FROM large_table LIMIT 50

-- Con offset para paginación
SELECT * FROM large_table LIMIT 50 OFFSET 100
```

## Buenas prácticas

1. **Siempre usa LIMIT**: Evita queries que devuelvan millones de filas
2. **Filtra primero**: Usa WHERE antes de JOIN cuando sea posible
3. **Índices**: Consulta columnas indexadas para mejor performance
4. **Explica el plan**: Usa EXPLAIN para entender queries lentas
5. **Evita SELECT ***: Especifica solo las columnas que necesitas

## Limitaciones

- Solo queries SELECT están permitidas
- Límite máximo de 1000 resultados por query
- No se permiten: INSERT, UPDATE, DELETE, DROP, CREATE, ALTER
- Timeout de 30 segundos por query
