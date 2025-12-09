# Raw SQL Quick Reference Guide

## Import Pool
```typescript
import pool from '../config/database';
```

## Common Patterns

### 1. Simple SELECT (Get One)
```typescript
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
const user = result.rows[0]; // undefined if not found
```

### 2. Simple SELECT (Get Many)
```typescript
const result = await pool.query(
  'SELECT * FROM products WHERE category_id = $1 ORDER BY created_at DESC',
  [categoryId]
);
const products = result.rows; // array (empty if none found)
```

### 3. INSERT
```typescript
const result = await pool.query(
  `INSERT INTO users (email, name, created_at, updated_at)
   VALUES ($1, $2, NOW(), NOW())
   RETURNING *`,
  [email, name]
);
const newUser = result.rows[0];
```

### 4. UPDATE
```typescript
const result = await pool.query(
  `UPDATE users 
   SET name = $1, updated_at = NOW() 
   WHERE user_id = $2
   RETURNING *`,
  [newName, userId]
);
const updatedUser = result.rows[0];
```

### 5. DELETE
```typescript
const result = await pool.query(
  'DELETE FROM shopping_list_items WHERE item_id = $1 RETURNING *',
  [itemId]
);
const deletedItem = result.rows[0];
```

### 6. Check Existence
```typescript
const result = await pool.query(
  'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
  [email]
);
const exists = result.rows[0].exists; // boolean
```

### 7. Count
```typescript
const result = await pool.query(
  'SELECT COUNT(*) FROM products WHERE vendor_id = $1',
  [vendorId]
);
const count = parseInt(result.rows[0].count);
```

### 8. Upsert Pattern (Manual)
```typescript
// Check if exists
const existing = await pool.query(
  'SELECT * FROM vendor_listings WHERE product_id = $1 AND vendor_id = $2',
  [productId, vendorId]
);

if (existing.rows.length > 0) {
  // UPDATE
  await pool.query(
    'UPDATE vendor_listings SET price = $1 WHERE listing_id = $2',
    [price, existing.rows[0].listing_id]
  );
} else {
  // INSERT
  await pool.query(
    'INSERT INTO vendor_listings (product_id, vendor_id, price) VALUES ($1, $2, $3)',
    [productId, vendorId, price]
  );
}
```

### 9. PostgreSQL Native Upsert (ON CONFLICT)
```typescript
const result = await pool.query(
  `INSERT INTO vendor_listings (product_id, vendor_id, price, stock_quantity)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (product_id, vendor_id) 
   DO UPDATE SET 
     price = EXCLUDED.price,
     stock_quantity = EXCLUDED.stock_quantity,
     updated_at = NOW()
   RETURNING *`,
  [productId, vendorId, price, stock]
);
```

### 10. Transaction
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  const userResult = await client.query(
    'INSERT INTO users (...) VALUES (...) RETURNING user_id',
    [...]
  );
  
  await client.query(
    'INSERT INTO vendors (user_id, ...) VALUES ($1, ...)',
    [userResult.rows[0].user_id, ...]
  );
  
  await client.query('COMMIT');
  return userResult.rows[0];
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release(); // Always release connection back to pool
}
```

### 11. JOIN Queries
```typescript
const result = await pool.query(`
  SELECT 
    sl.list_id,
    sl.list_name,
    sli.item_id,
    sli.quantity,
    p.product_name,
    p.brand
  FROM shopping_lists sl
  LEFT JOIN shopping_list_items sli ON sl.list_id = sli.list_id
  LEFT JOIN products p ON sli.product_id = p.product_id
  WHERE sl.user_id = $1
  ORDER BY sl.created_at DESC
`, [userId]);

const lists = result.rows;
```

### 12. GROUP BY / Aggregations
```typescript
const result = await pool.query(`
  SELECT 
    vendor_id,
    COUNT(*) as product_count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
  FROM vendor_listings
  WHERE is_available = true
  GROUP BY vendor_id
  HAVING COUNT(*) > 5
  ORDER BY product_count DESC
`);
```

### 13. LIKE / ILIKE (Case-Insensitive Search)
```typescript
const result = await pool.query(
  `SELECT * FROM products 
   WHERE product_name ILIKE $1 OR brand ILIKE $1
   ORDER BY product_name`,
  [`%${searchTerm}%`]
);
```

### 14. IN Clause
```typescript
const result = await pool.query(
  'SELECT * FROM products WHERE product_id = ANY($1::int[])',
  [[1, 2, 3, 4, 5]] // Array of IDs
);
```

### 15. NULL Handling
```typescript
// COALESCE - return first non-null value
const result = await pool.query(
  'UPDATE users SET name = COALESCE($1, name) WHERE user_id = $2',
  [newName || null, userId]
);

// IS NULL / IS NOT NULL
const result = await pool.query(
  'SELECT * FROM products WHERE brand IS NOT NULL'
);

// Null-safe comparison
const result = await pool.query(
  'SELECT * FROM products WHERE (brand = $1 OR (brand IS NULL AND $1 IS NULL))',
  [brandFilter]
);
```

### 16. Date/Time Operations
```typescript
// Current timestamp
await pool.query('INSERT INTO logs (created_at) VALUES (NOW())');

// Date arithmetic
const result = await pool.query(`
  SELECT * FROM orders 
  WHERE created_at > NOW() - INTERVAL '7 days'
`);

// Date formatting
const result = await pool.query(
  "SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as formatted_date FROM users"
);
```

### 17. LIMIT & OFFSET (Pagination)
```typescript
const limit = 20;
const page = 2;
const offset = (page - 1) * limit;

const result = await pool.query(
  'SELECT * FROM products ORDER BY product_id LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

### 18. DISTINCT
```typescript
const result = await pool.query(
  'SELECT DISTINCT category_name FROM products ORDER BY category_name'
);
```

### 19. Subqueries
```typescript
const result = await pool.query(`
  SELECT * FROM products
  WHERE price < (
    SELECT AVG(price) FROM products WHERE category_id = $1
  )
  AND category_id = $1
`, [categoryId]);
```

### 20. CTE (Common Table Expressions)
```typescript
const result = await pool.query(`
  WITH product_stats AS (
    SELECT 
      product_id,
      COUNT(*) as listing_count,
      MIN(price) as min_price
    FROM vendor_listings
    GROUP BY product_id
  )
  SELECT p.*, ps.listing_count, ps.min_price
  FROM products p
  JOIN product_stats ps ON p.product_id = ps.product_id
  WHERE ps.listing_count > 2
`);
```

## Important Notes

### Always Use Parameterized Queries
```typescript
// ✅ GOOD - Safe from SQL injection
pool.query('SELECT * FROM users WHERE email = $1', [userEmail]);

// ❌ BAD - Vulnerable to SQL injection
pool.query(`SELECT * FROM users WHERE email = '${userEmail}'`);
```

### Connection Management
```typescript
// Simple queries - use pool directly
await pool.query('SELECT...');

// Transactions - get client, release when done
const client = await pool.connect();
try {
  // ... queries
} finally {
  client.release(); // CRITICAL - always release
}
```

### Error Handling
```typescript
try {
  const result = await pool.query('SELECT...');
} catch (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    throw new Error('Already exists');
  } else if (error.code === '23503') {
    // Foreign key violation
    throw new Error('Referenced record not found');
  }
  throw error;
}
```

### Common PostgreSQL Error Codes
- `23505` - Unique constraint violation
- `23503` - Foreign key violation
- `23502` - Not null violation
- `42P01` - Table does not exist
- `42703` - Column does not exist

### Result Object Structure
```typescript
const result = await pool.query('SELECT...');

result.rows       // Array of row objects
result.rowCount   // Number of rows affected
result.fields     // Array of field metadata
result.command    // SQL command (SELECT, INSERT, etc.)
```

### Type Conversion
```typescript
// String to Int
const userId = parseInt(req.params.id);

// String to Float
const price = parseFloat(record.price);

// Boolean
const isAvailable = Boolean(row.is_available);

// Array parameter
pool.query('... = ANY($1::int[])', [[1, 2, 3]]);
```

## Best Practices

1. **Always parameterize** - Use $1, $2, never string concatenation
2. **Release connections** - Always call `client.release()` in finally block
3. **Handle nulls** - Check for `undefined` or use COALESCE
4. **Use transactions** - For operations that must succeed together
5. **Validate input** - Check parameters before querying
6. **Return useful data** - Use RETURNING clause in INSERT/UPDATE/DELETE
7. **Index properly** - Ensure frequently queried columns are indexed
8. **Limit results** - Use LIMIT/OFFSET for large datasets
9. **Log queries** - In development, log SQL for debugging
10. **Test edge cases** - Empty results, null values, constraints

## Testing SQL Queries

### Using psql
```bash
psql postgresql://user:password@host:5432/database

# Run query
SELECT * FROM users WHERE email = 'test@example.com';

# Explain query plan
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 1;
```

### Using Prisma Studio (if kept for migrations)
```bash
npx prisma studio
```

### Using DBeaver / pgAdmin
Connect to your PostgreSQL database and run queries directly.
