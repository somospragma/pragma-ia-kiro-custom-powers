# Exportación y Visualización de Relaciones

## Exportar datos a CSV

La herramienta `export_query_csv` te permite exportar resultados de queries a archivos CSV.

### Ejemplos:

```
"Exporta SELECT * FROM users WHERE active = true a users_active.csv"
"Exporta los pedidos del último mes a orders_january.csv"
"Exporta SELECT id, name, email FROM customers LIMIT 5000 a customers.csv"
```

### Características:

- Límite por defecto: 1000 registros
- Límite máximo: 10000 registros
- Formato CSV estándar con headers
- Manejo automático de comillas y comas en los datos
- Valores NULL se exportan como campos vacíos

### Buenas prácticas:

1. **Usa LIMIT**: Especifica un límite razonable para evitar archivos enormes
2. **Filtra datos**: Usa WHERE para exportar solo lo necesario
3. **Selecciona columnas**: Evita SELECT * si no necesitas todas las columnas
4. **Nombres descriptivos**: Usa nombres de archivo que indiquen el contenido

## Visualizar relaciones entre tablas

### Ver relaciones de una tabla específica

Usa `get_table_relationships` para ver las foreign keys de una tabla:

```
"Muestra las relaciones de la tabla orders en el schema public"
"Qué foreign keys tiene la tabla users"
"Lista las relaciones de products en el schema inventory"
```

Esto te mostrará:
- Nombre del constraint
- Columna local
- Tabla referenciada
- Columna referenciada

### Diagrama de relaciones del schema

Usa `visualize_schema_relationships` para ver un diagrama ASCII de todas las relaciones:

```
"Visualiza las relaciones del schema public"
"Muestra el diagrama de relaciones del schema inventory"
"Genera un diagrama de las tablas relacionadas en public"
```

Ejemplo de salida:

```
Diagrama de relaciones del schema: public
==================================================

┌─ orders
│  └─ user_id ──→ users.id
│  └─ product_id ──→ products.id
│
┌─ order_items
│  └─ order_id ──→ orders.id
│  └─ product_id ──→ products.id
│
┌─ reviews
│  └─ user_id ──→ users.id
│  └─ product_id ──→ products.id
│
```

## Casos de uso comunes

### 1. Análisis de datos

```
"Exporta SELECT category, COUNT(*) as total, AVG(price) as avg_price 
 FROM products GROUP BY category a product_stats.csv"
```

### 2. Backup de datos específicos

```
"Exporta SELECT * FROM users WHERE created_at > '2024-01-01' 
 LIMIT 5000 a new_users_2024.csv"
```

### 3. Entender el modelo de datos

```
"Visualiza las relaciones del schema public"
"Muestra las relaciones de la tabla orders"
```

### 4. Documentación de base de datos

```
"Lista las tablas del schema public"
"Describe la tabla users"
"Muestra las relaciones de users"
```

## Limitaciones

- **CSV**: Máximo 10,000 registros por exportación
- **Relaciones**: Solo muestra foreign keys explícitas (no relaciones implícitas)
- **Diagrama**: Formato ASCII (no gráfico visual)
- **Performance**: Queries grandes pueden tardar más tiempo

## Tips de seguridad

- Los archivos CSV se generan en memoria y se devuelven como texto
- No se guardan automáticamente en disco (debes copiar el contenido)
- Evita exportar datos sensibles sin filtrar
- Usa LIMIT para controlar el tamaño de las exportaciones
