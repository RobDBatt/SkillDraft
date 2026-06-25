---
name: postgres-query-guardrails
description: Writes and reviews PostgreSQL queries and migrations with safety and performance guardrails. Use when the user says "write a query", "optimise this SQL", "design a table", "add a migration", or "why is this query slow" for Postgres. Do not use for ORM-only code with no SQL, or for non-Postgres engines without adapting the syntax.
---

# PostgreSQL Query Guardrails

Writes parameterised, index-aware PostgreSQL and reversible migrations, and reviews existing SQL for injection and performance risks.

## When to use this
- Writing, optimising, or reviewing PostgreSQL queries, schema, or migrations.
- Triggers: "write a query for", "optimise this SQL", "design a table", "add a migration", "why is this slow".

## When NOT to use this
- Application logic that uses an ORM and never touches SQL (because there is nothing to guard).
- MySQL, SQL Server, or other engines — the syntax and EXPLAIN output differ (adapt first).
- Non-database work.

## Instructions

### Query safety
- Always parameterise user input with `$1, $2, …` — never string-concatenate (because concatenation is the #1 SQL injection vector).
- Always use explicit column lists — never `SELECT *` in application code (because it breaks silently on a schema change and transfers unused columns).

### Schema and migrations
- Every migration ships with a reversible `down` (because an irreversible migration cannot be rolled back during an incident).
- Every foreign key gets a covering index (because an unindexed foreign key turns each join into a sequential scan as the table grows).
- Use `snake_case` for table and column names.

### Performance
- Run `EXPLAIN ANALYZE` on any new non-trivial query and confirm it uses an index, not a Seq Scan (because a query that passes on 100 dev rows can table-scan 10M in production).
- Wrap multi-statement writes in a transaction (because partial failure otherwise leaves the database inconsistent).

## Output format

```sql
-- up
CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES customers (id),
  total_cents integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);  -- covering FK index

-- parameterised query
SELECT id, total_cents, created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC
LIMIT 20;

-- down
DROP TABLE orders;
```

## Hard stops
- Never build SQL by concatenating user input — parameterise instead.
- Never run `DROP` or `TRUNCATE` without an explicit backup or confirmation step.
- Never write a destructive `UPDATE` / `DELETE` without a `WHERE` clause and a transaction.
- Never ship a migration with no `down` path.

## Anti-patterns
❌ `SELECT * FROM users` → ✅ `SELECT id, email, created_at FROM users`
❌ `"... WHERE name = '" + input + "'"` → ✅ `WHERE name = $1` with a bound parameter
❌ Foreign key with no index → ✅ `CREATE INDEX ON child (parent_id)`
❌ `UPDATE accounts SET balance = 0` with no WHERE → ✅ scoped `WHERE` inside a transaction

## Verification checklist
- [ ] All user input is parameterised ($1, $2, …)
- [ ] Explicit column lists, no SELECT *
- [ ] Migration has a reversible down path
- [ ] Every foreign key has a covering index
- [ ] EXPLAIN ANALYZE reviewed; no unexpected Seq Scan
- [ ] Destructive statements scoped and wrapped in a transaction
