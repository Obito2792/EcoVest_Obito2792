import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { randomUUID } from "node:crypto";

// EcoVest uses Node's built-in `node:sqlite` module rather than an ORM like
// Prisma. This is a deliberate hackathon-speed choice: it ships with Node
// itself (Node 22.5+), needs zero installs or native binary downloads, and
// is still genuinely SQLite underneath. Swap this file out for Prisma or
// better-sqlite3 later if you want migrations/type-gen — every other file
// only talks to the small helper functions exported below.

declare global {
  // eslint-disable-next-line no-var
  var __ecovestDb: DatabaseSync | undefined;
}

/** Adds a column if it doesn't already exist. node:sqlite has no migration
 * system, so this lets us evolve the `users` table across app updates
 * without wiping existing local accounts (cash balance, positions, and
 * transaction history all survive). Throws only get swallowed when they're
 * the expected "duplicate column name" error from SQLite. */
function ensureColumn(db: DatabaseSync, table: string, column: string, ddl: string) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl};`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/duplicate column name/i.test(message)) {
      throw err;
    }
  }
}

function initDb(): DatabaseSync {
  const dbPath = path.join(process.cwd(), "ecovest.db");
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA journal_mode = WAL;`);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      cashBalance REAL NOT NULL DEFAULT 10000,
      createdAt TEXT NOT NULL
    );
  `);
  // Profile fields — added via migration so existing local databases (from
  // before the Create Your Profile step existed) keep their users, cash
  // balances, and history intact instead of needing a fresh ecovest.db.
  ensureColumn(db, "users", "firstName", "TEXT");
  ensureColumn(db, "users", "lastName", "TEXT");
  ensureColumn(db, "users", "interests", "TEXT NOT NULL DEFAULT '[]'");

  db.exec(`
    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      ticker TEXT NOT NULL,
      shares INTEGER NOT NULL,
      UNIQUE(userId, ticker)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      ticker TEXT NOT NULL,
      side TEXT NOT NULL,
      shares INTEGER NOT NULL,
      price REAL NOT NULL,
      cashAfter REAL NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  return db;
}

function getDb(): DatabaseSync {
  if (!global.__ecovestDb) {
    global.__ecovestDb = initDb();
  }
  return global.__ecovestDb;
}

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  cashBalance: number;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  /** Raw JSON-encoded array of INTEREST_CATEGORIES strings — parse with JSON.parse. */
  interests: string;
}

export function createUser(email: string, passwordHash: string): UserRow {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const normalizedEmail = email.toLowerCase();
  db.prepare(
    `INSERT INTO users (id, email, passwordHash, cashBalance, createdAt, firstName, lastName, interests) VALUES (?, ?, ?, 10000, ?, NULL, NULL, '[]')`
  ).run(id, normalizedEmail, passwordHash, createdAt);
  return {
    id,
    email: normalizedEmail,
    passwordHash,
    cashBalance: 10000,
    createdAt,
    firstName: null,
    lastName: null,
    interests: "[]",
  };
}

export function getUserByEmail(email: string): UserRow | undefined {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase());
  return row as UserRow | undefined;
}

export function getUserById(id: string): UserRow | undefined {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  return row as UserRow | undefined;
}

export function updateUserCash(id: string, cashBalance: number): void {
  const db = getDb();
  db.prepare(`UPDATE users SET cashBalance = ? WHERE id = ?`).run(cashBalance, id);
}

export function updateUserProfile(
  id: string,
  firstName: string,
  lastName: string,
  interests: string[]
): void {
  const db = getDb();
  db.prepare(`UPDATE users SET firstName = ?, lastName = ?, interests = ? WHERE id = ?`).run(
    firstName,
    lastName,
    JSON.stringify(interests),
    id
  );
}

export interface PositionRow {
  id: string;
  userId: string;
  ticker: string;
  shares: number;
}

export function getPositions(userId: string): PositionRow[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM positions WHERE userId = ? ORDER BY ticker`).all(userId);
  return rows as unknown as PositionRow[];
}

export function getPosition(userId: string, ticker: string): PositionRow | undefined {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM positions WHERE userId = ? AND ticker = ?`)
    .get(userId, ticker);
  return row as PositionRow | undefined;
}

export function upsertPositionShares(userId: string, ticker: string, shares: number): void {
  const db = getDb();
  const existing = getPosition(userId, ticker);
  if (existing) {
    db.prepare(`UPDATE positions SET shares = ? WHERE id = ?`).run(shares, existing.id);
  } else {
    db.prepare(`INSERT INTO positions (id, userId, ticker, shares) VALUES (?, ?, ?, ?)`).run(
      randomUUID(),
      userId,
      ticker,
      shares
    );
  }
}

export function deletePosition(userId: string, ticker: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM positions WHERE userId = ? AND ticker = ?`).run(userId, ticker);
}

export function clearPositions(userId: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM positions WHERE userId = ?`).run(userId);
}

export interface TransactionRow {
  id: string;
  userId: string;
  ticker: string;
  side: string;
  shares: number;
  price: number;
  cashAfter: number;
  createdAt: string;
}

export function insertTransaction(entry: {
  userId: string;
  ticker: string;
  side: "BUY" | "SELL" | "BONUS";
  shares: number;
  price: number;
  cashAfter: number;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO transactions (id, userId, ticker, side, shares, price, cashAfter, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    entry.userId,
    entry.ticker,
    entry.side,
    entry.shares,
    entry.price,
    entry.cashAfter,
    new Date().toISOString()
  );
}

export function getTransactions(userId: string): TransactionRow[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC`)
    .all(userId);
  return rows as unknown as TransactionRow[];
}
