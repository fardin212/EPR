// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // در Next 16، cookies() Promise برمی‌گرداند
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "بدون سشن" },
        { status: 401 }
      );
    }

    const userId = Number(sessionCookie.value);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: "سشن نامعتبر است" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "کاربر یافت نشد یا غیرفعال است" },
        { status: 401 }
      );
    }

    // چیزی که داشبورد لازم دارد را برگردان
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/auth/me] error", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
