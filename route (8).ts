import { NextResponse } from "next/server";
import { clearSession, currentUser } from "@/lib/auth";
export async function POST(request: Request) {
  const user = await currentUser();
  if (user) await import("@/lib/db").then(({db})=>db.auditEvent.create({data:{actorId:user.id,action:"LOGOUT"}}));
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
