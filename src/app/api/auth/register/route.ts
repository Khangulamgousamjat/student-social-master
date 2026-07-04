import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstIssue, issues: parsed.error.flatten() }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash,
        college: parsed.data.college?.trim(),
        department: parsed.data.department?.trim(),
        year: parsed.data.year,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Registration failed", 
        message: message,
      }, 
      { status: 500 }
    );
  }
}
