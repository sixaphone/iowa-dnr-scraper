import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const EnforcementOrderEntity = sqliteTable('enforcement_orders', {
  id: int().primaryKey({ autoIncrement: true }),
  defendant: text().notNull(),
  plaintiff: text().notNull(),
  year: int().notNull(),
  settlement: text().notNull(),
  violationType: text().notNull(),
  dataSourceLink: text().notNull(),
});

export type EnforcementOrder = typeof EnforcementOrderEntity.$inferInsert;