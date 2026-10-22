import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

const COOKIE = "seg_session";
const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET mancante o troppo corto");
  return value;
};
const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

export async function createSession(userId: string) {
  const payload = `${userId}.${Date.now() + 1000 * 60 * 60 * 12}`;
  const value = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
export async function currentUser() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [id, expiry, signature] = parts;
  const payload = `${id}.${expiry}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b) || Number(expiry) < Date.now()) return null;
  return db.user.findFirst({ where: { id, active: true }, select: { id: true, name: true, email: true, role: true, siteId: true } });
}
export async function requireRole(roles: Role[]) {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
export function canSeeAllSites(role: Role) {
  return role === "DIREZIONE" || role === "SEGRETERIA" || role === "AMMINISTRAZIONE";
}
