// app/api/project-types/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type CreateProjectTypeBody = {
  name: string;
  code: string;
  description?: string | null;
};

export async function GET() {
  try {
    const types = await prisma.projectType.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(types);
  } catch (err) {
    console.error("Error in GET /api/project-types:", err);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as CreateProjectTypeBody;

    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: "نام و کد نوع پروژه اجباری است." },
        { status: 400 },
      );
    }

    const created = await prisma.projectType.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim(),
        description: body.description ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/project-types:", err);

    if (err?.code === "P2002") {
      // unique constraint (کد تکراری)
      return NextResponse.json(
        { error: "کد نوع پروژه تکراری است." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد نوع پروژه" },
      { status: 500 },
    );
  }
}
