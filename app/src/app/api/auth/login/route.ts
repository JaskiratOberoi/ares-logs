import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const user = await login(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "That email and password don't match an Ares Sales account." }, { status: 401 });
  }
  return NextResponse.json({ user });
}
