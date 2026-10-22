import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse({ email: String(form.get("email") ?? "").trim().toLowerCase(), password: String(form.get("password") ?? "") });
  if (!parsed.success) return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }
  await createSession(user.id);
  await db.auditEvent.create({ data: { actorId: user.id, action: "LOGIN", details: { method: "password" } } });
  return NextResponse.redirect(new URL("/", request.url), 303);
}
