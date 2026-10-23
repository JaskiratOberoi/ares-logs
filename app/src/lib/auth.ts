import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { getDb, plain } from "./db";
import { verifyPassword } from "./password";
import type { Role, User } from "./types";

const COOKIE = "ares_session";
const SESSION_DAYS = 14;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

type UserRow = { id: string; email: string; name: string; role: Role; region: string; password_hash: string };

export async function login(email: string, password: string): Promise<User | null> {
  const db = getDb();
  const row = db
    .prepare("SELECT id, email, name, role, region, password_hash FROM users WHERE lower(email) = lower(?)")
    .get(email.trim()) as UserRow | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) return null;

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    hashToken(token),
    row.id,
    expires.toISOString(),
  );
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  return { id: row.id, email: row.email, name: row.name, role: row.role, region: row.region };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  jar.delete(COOKIE);
}

export async function getSession(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.region FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), new Date().toISOString());
  return plain<User>(row);
}

export async function requireSession(): Promise<User> {
  const user = await getSession();
  if (!user) throw new AuthError();
  return user;
}

export class AuthError extends Error {
  status = 401;
  constructor() {
    super("Not signed in");
  }
}
