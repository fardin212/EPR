// app/api/parties/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

type Context = {
  params: Promise<{ id: string }>;
};

type PartyKind = "CUSTOMER" | "CONTRACTOR" | "SUPPLIER" | "PERSON";
type PartyType =
  | "CUSTOMER"
  | "CONTRACTOR"
  | "SUPPLIER"
  | "OWNER"
  | "EMPLOYEE"
  | "OTHER";

function normStr(v: any, max = 200) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}
function normIban(v: any) {
  const s = normStr(v, 34);
  if (!s) return null;
  return s.replace(/\s+/g, "").toUpperCase();
}
function normCard(v: any) {
  const s = normStr(v, 19);
  if (!s) return null;
  return s.replace(/[^\d]/g, "").slice(0, 16) || null;
}
function normAccountNo(v: any) {
  const s = normStr(v, 64);
  if (!s) return null;
  return s.replace(/\s+/g, " ");
}

export async function GET(_req: NextRequest, context: Context) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id } = await context.params; // ✅ fix Next params Promise
    const partyId = Number(id);
    if (!Number.isFinite(partyId) || partyId <= 0) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const party = await prisma.party.findFirst({
      where: { id: partyId, companyId },
      include: {
        contractorProfile: { include: { skills: true } },
        employee: true,
        partyBankAccounts: {
          orderBy: [{ isDefault: "desc" }, { id: "desc" }],
          select: {
            id: true,
            title: true,
            bankName: true,
            accountNo: true,
            cardNumber: true,
            iban: true,
            isDefault: true,
          },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
    }

    const bankAccounts = (party as any).partyBankAccounts ?? [];
    const defaultBankAccount = bankAccounts.find((b: any) => b.isDefault) ?? bankAccounts[0] ?? null;

    return NextResponse.json({
      ...party,
      bankAccounts,
      defaultBankAccount,
      partyBankAccounts: undefined,
    });
  } catch (err) {
    console.error("GET /api/parties/[id] error:", err);
    return NextResponse.json({ error: "خطا در دریافت طرف‌حساب" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id } = await context.params; // ✅ fix Next params Promise
    const partyId = Number(id);
    if (!Number.isFinite(partyId) || partyId <= 0) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const body = await req.json();

    const {
      name,
      kind,
      type,
      phone,
      mobile,
      email,
      nationalId,
      companyName,
      address,
      note,
      description,
      contractor,
      bankAccount,
    } = body as {
      name?: string;
      kind?: PartyKind;
      type?: PartyType;
      phone?: string;
      mobile?: string;
      email?: string;
      nationalId?: string;
      companyName?: string;
      address?: string;
      note?: string;
      description?: string;
      contractor?:
        | {
            dayRate?: number | null;
            note?: string | null;
            specialty?: string | null;
            skills?: {
              name: string;
              level?: number;
              category?: string;
              projectTypeId?: number | null;
              description?: string;
            }[];
          }
        | null;
      bankAccount?:
        | {
            id?: number;
            title?: string;
            bankName?: string;
            accountNo?: string;
            cardNumber?: string;
            iban?: string;
          }
        | null;
    };

    const existing = await prisma.party.findFirst({
      where: { id: partyId, companyId },
      include: { contractorProfile: { include: { skills: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
    }

    let contractorUpdate: any = undefined;

    if (contractor !== undefined) {
      if (!existing.contractorProfile && contractor) {
        contractorUpdate = {
          create: {
            companyId,
            specialty: contractor.specialty ?? undefined,
            note: contractor.note ?? undefined,
            dayRate: contractor.dayRate ?? undefined,
            skills: contractor.skills
              ? {
                  create: contractor.skills.map((s) => ({
                    name: s.name,
                    level: s.level,
                    category: s.category ?? "",
                    projectTypeId: s.projectTypeId ?? null,
                    description: s.description,
                  })),
                }
              : undefined,
          },
        };
      } else if (existing.contractorProfile && contractor === null) {
        contractorUpdate = { delete: true };
      } else if (existing.contractorProfile && contractor) {
        contractorUpdate = {
          update: {
            specialty: contractor.specialty ?? undefined,
            note: contractor.note ?? undefined,
            dayRate: contractor.dayRate ?? undefined,
          },
        };

        if (contractor.skills) {
          await prisma.contractorSkill.deleteMany({
            where: { contractorId: existing.contractorProfile.id },
          });
          contractorUpdate.update.skills = {
            create: contractor.skills.map((s) => ({
              name: s.name,
              level: s.level,
              category: s.category ?? "",
              projectTypeId: s.projectTypeId ?? null,
              description: s.description,
            })),
          };
        }
      }
    }

    // ✅ بانک: ساخت/آپدیت حساب پیش‌فرض بدون DELETE (تا اگر در پرداخت‌ها استفاده شده، نشکند)
    const bankTitle = normStr(bankAccount?.title, 120);
    const bankName = normStr(bankAccount?.bankName, 120);
    const accountNo = normAccountNo(bankAccount?.accountNo);
    const cardNumber = normCard(bankAccount?.cardNumber);
    const iban = normIban(bankAccount?.iban);

    const hasBank =
      bankAccount !== undefined &&
      (bankTitle || bankName || accountNo || cardNumber || iban);

    const updated = await prisma.$transaction(async (tx) => {
      const party = await tx.party.update({
        where: { id: partyId } as any,
        data: {
          name,
          kind,
          type,
          phone,
          mobile,
          email,
          nationalId,
          companyName,
          address,
          note,
          description,
          contractorProfile: contractorUpdate,
        },
        include: {
          contractorProfile: { include: { skills: true } },
          employee: true,
        },
      });

      if (bankAccount === null) {
        // اگر خواستی بعداً UI برای "غیرفعال کردن" بسازیم. فعلاً حذف نمی‌کنیم.
        // می‌گذاریم دست‌نخورده بماند تا تراکنش‌ها نشکنند.
      } else if (hasBank) {
        // پیش‌فرض‌های قبلی خاموش
        await tx.partyBankAccount.updateMany({
          where: { partyId, isDefault: true },
          data: { isDefault: false },
        });

        if (bankAccount?.id) {
          await tx.partyBankAccount.update({
            where: { id: Number(bankAccount.id) } as any,
            data: {
              title: bankTitle ?? undefined,
              bankName,
              accountNo,
              cardNumber,
              iban,
              isDefault: true,
            } as any,
          });
        } else {
          await tx.partyBankAccount.create({
            data: {
              companyId,
              partyId,
              title: bankTitle ?? "حساب پیش‌فرض",
              bankName,
              accountNo,
              cardNumber,
              iban,
              isDefault: true,
            } as any,
          });
        }
      }

      const bankAccounts = await tx.partyBankAccount.findMany({
        where: { partyId },
        orderBy: [{ isDefault: "desc" }, { id: "desc" }],
        select: {
          id: true,
          title: true,
          bankName: true,
          accountNo: true,
          cardNumber: true,
          iban: true,
          isDefault: true,
        },
      });

      const defaultBankAccount =
        bankAccounts.find((b) => b.isDefault) ?? bankAccounts[0] ?? null;

      return { party, bankAccounts, defaultBankAccount };
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/parties/[id] error:", err);
    return NextResponse.json({ error: "خطا در ویرایش طرف‌حساب" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id } = await context.params; // ✅ fix Next params Promise
    const partyId = Number(id);

    if (!Number.isFinite(partyId) || partyId <= 0) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    // فقط داخل شرکت خودت حذف شود
    const existing = await prisma.party.findFirst({ where: { id: partyId, companyId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

    await prisma.party.delete({ where: { id: partyId } as any });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/parties/[id] error:", err);
    return NextResponse.json(
      {
        error:
          "خطا در حذف. احتمالاً این طرف‌حساب در پروژه، وچر یا رکورد دیگری استفاده شده است.",
      },
      { status: 400 }
    );
  }
}
