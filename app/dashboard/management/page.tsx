// app/dashboard/management/page.tsx
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const cls = {
  wrap: "max-w-7xl mx-auto px-4 py-6 text-[color:var(--text)]",
  headerRow:
    "mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)]",
  quickLinks: "flex flex-wrap gap-2",
  quickLinkBtn:
    "inline-flex items-center gap-1 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-[11px] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition",
  grid4: "grid gap-4 md:grid-cols-4",
  grid2: "grid gap-4 md:grid-cols-2",
  card: "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 flex flex-col gap-2",
  cardHeader: "flex items-center justify-between",
  cardTitle: "text-[11px] font-medium text-[color:var(--muted)]",
  cardIcon:
    "h-8 w-8 rounded-2xl bg-[color:var(--surface-soft)] flex items-center justify-center text-lg",
  cardValue: "text-2xl font-semibold",
  cardSub: "text-[11px] text-[color:var(--muted)]",
  section:
    "mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-start",
  sectionCard:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4",
  sectionTitleRow: "flex items-center justify-between mb-3",
  sectionTitle: "text-xs font-medium",
  badge:
    "inline-flex items-center gap-1 rounded-full bg-[color:var(--surface-soft)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]",

  // Alerts
  alertWrap:
    "mt-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4",
  alertGrid: "mt-3 grid gap-3 md:grid-cols-2",
  alertCard:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4",
  alertTitleRow: "flex items-start justify-between gap-3",
  alertTitle: "text-sm font-semibold",
  alertMeta: "text-[11px] text-[color:var(--muted)] mt-1",
  alertBadge:
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border",
  alertActions: "mt-3 flex flex-wrap gap-2",
  alertBtn:
    "inline-flex items-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-[11px] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition",
  alertBtnPrimary:
    "inline-flex items-center rounded-2xl border border-[color:var(--primary)] bg-[color:var(--surface)] px-3 py-1.5 text-[11px] text-[color:var(--primary)] hover:opacity-90 transition",
};

async function getStats() {
  const [inProgress, completed, stopped] = await Promise.all([
    prisma.project.count({ where: { status: "IN_PROGRESS" } }).catch(() => 0),
    prisma.project.count({ where: { status: "COMPLETED" } }).catch(() => 0),
    prisma.project.count({ where: { status: "STOPPED" } }).catch(() => 0),
  ]);

  const totalProjects = inProgress + completed + stopped;
  const inProgressPercent =
    totalProjects > 0 ? Math.round((inProgress / totalProjects) * 100) : 0;

  return {
    inProgress,
    completed,
    stopped,
    totalProjects,
    inProgressPercent,
  };
}

function fmt(n: number) {
  try {
    return new Intl.NumberFormat("fa-IR").format(n);
  } catch {
    return String(n);
  }
}

type ContractAlert = {
  contractId: number;
  projectId: number | null;
  projectTitle: string | null;
  contractorId: number | null;
  contractorName: string | null;
  contractorMobile: string | null;
  total: number;
  paid: number;
  remaining: number;
  endDate: Date | null;
  daysToDue: number | null;
  dueStatus: "DUE_SOON" | "OVERDUE";
};

function alertBadgeClass(s: ContractAlert["dueStatus"]) {
  if (s === "OVERDUE") {
    return "border-rose-400/60 bg-rose-500/10 text-rose-300";
  }
  return "border-amber-400/60 bg-amber-500/10 text-amber-300";
}

function alertLabel(s: ContractAlert["dueStatus"]) {
  return s === "OVERDUE" ? "سررسید گذشته" : "نزدیک سررسید";
}

/**
 * هشدار مانده قرارداد:
 * - قراردادهایی که remaining>0 و endDate دارند و (daysToDue<=7 یا overdue)
 *
 * ⚠️ نکته مهم:
 * اینجا فرض می‌کنیم مدل‌ها این اسامی را دارند:
 * - projectContract  (id, amount, endDate, projectId, contractorPartyId, relations: project, contractorParty)
 * - treasuryPayment  (amount, contractId)
 *
 * اگر در اسکیمای شما نام‌ها فرق دارد، فقط همین کوئری‌ها را مطابق مدل خودت اصلاح کن.
 */
async function getContractAlerts(limit = 6): Promise<ContractAlert[]> {
  try {
    const now = new Date();
    const lookAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1) قراردادهای پیمانکار پروژه که endDate نزدیک یا گذشته دارند
    const contracts = await prisma.projectContractor.findMany({
      where: {
        endDate: { not: null, lte: lookAhead },
      },
      include: {
        project: {
          select: { id: true, title: true },
        },
        contractor: {
          include: {
            party: {
              select: { id: true, name: true, mobile: true },
            },
          },
        },
      },
      orderBy: { endDate: "asc" },
      take: 50,
    });

    const rows: ContractAlert[] = [];

    for (const c of contracts) {
      const partyId = c.contractor?.party?.id;
      const projectId = c.project?.id;

      if (!partyId || !projectId) continue;

      // 2) جمع پرداخت‌های انجام‌شده به این پیمانکار در این پروژه
      const paidAgg = await prisma.treasuryPayment.aggregate({
        where: {
          projectId,
          partyId,
          direction: "OUT",
        },
        _sum: {
          amount: true,
        },
      });

      const paid = Number(paidAgg._sum.amount || 0);
      const total = Number(c.agreedAmount || 0);
      const remaining = Math.max(total - paid, 0);

      if (remaining <= 0) continue;

      const endDate = c.endDate ? new Date(c.endDate) : null;
      if (!endDate || Number.isNaN(endDate.getTime())) continue;

      const daysToDue = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const overdue = daysToDue < 0;
      const dueSoon = daysToDue >= 0 && daysToDue <= 7;

      if (!overdue && !dueSoon) continue;

      rows.push({
        contractId: c.id,
        projectId,
        projectTitle: c.project?.title || null,
        contractorId: partyId,
        contractorName: c.contractor?.party?.name || null,
        contractorMobile: c.contractor?.party?.mobile || null,
        total,
        paid,
        remaining,
        endDate,
        daysToDue,
        dueStatus: overdue ? "OVERDUE" : "DUE_SOON",
      });
    }

    // مرتب‌سازی: اول سررسید گذشته
    rows.sort((a, b) => {
      const ra = a.dueStatus === "OVERDUE" ? 0 : 1;
      const rb = b.dueStatus === "OVERDUE" ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return (a.daysToDue ?? 9999) - (b.daysToDue ?? 9999);
    });

    return rows.slice(0, limit);
  } catch (e) {
    console.error("getContractAlerts error:", e);
    return [];
  }
}

export default async function ManagementDashboardPage() {
  const [stats, alerts] = await Promise.all([getStats(), getContractAlerts(6)]);

  return (
    <div className={cls.wrap}>
      {/* Header */}
      <div className={cls.headerRow}>
        <div>
          <h1 className={cls.title}>داشبورد مدیریت ERP نیکان</h1>
          <p className={cls.subtitle}>
            نمای کلی مدیریتی از وضعیت پروژه‌ها و گزارش‌های مالی
          </p>
        </div>

        {/* Quick Links */}
        <div className={cls.quickLinks}>
          <a href="/dashboard/projects/new" className={cls.quickLinkBtn}>
            ➕ ثبت پروژه
          </a>
          <a href="/dashboard/accounting" className={cls.quickLinkBtn}>
            📑 اسناد حسابداری
          </a>
          <a
            href="/dashboard/management/reports/contractors"
            className={cls.quickLinkBtn}
          >
            💸 گزارش پیمانکاران
          </a>
        </div>
      </div>

      {/* KPI */}
      <div className={cls.grid4}>
        <div className={cls.card}>
          <div className={cls.cardHeader}>
            <div>
              <div className={cls.cardTitle}>پروژه‌های فعال</div>
              <div className={cls.cardValue}>{stats.inProgress}</div>
            </div>
            <div className={cls.cardIcon}>🏗️</div>
          </div>
        </div>

        <div className={cls.card}>
          <div className={cls.cardHeader}>
            <div>
              <div className={cls.cardTitle}>تکمیل‌شده</div>
              <div className={cls.cardValue}>{stats.completed}</div>
            </div>
            <div className={cls.cardIcon}>✅</div>
          </div>
        </div>

        <div className={cls.card}>
          <div className={cls.cardHeader}>
            <div>
              <div className={cls.cardTitle}>متوقف</div>
              <div className={cls.cardValue}>{stats.stopped}</div>
            </div>
            <div className={cls.cardIcon}>⏸️</div>
          </div>
        </div>

        <div className={cls.card}>
          <div className={cls.cardHeader}>
            <div>
              <div className={cls.cardTitle}>درصد فعال</div>
              <div className={cls.cardValue}>{stats.inProgressPercent}%</div>
            </div>
            <div className={cls.cardIcon}>📊</div>
          </div>
        </div>
      </div>

      {/* Alerts: Contract Remaining */}
      <div className={cls.alertWrap}>
        <div className={cls.sectionTitleRow}>
          <div className={cls.sectionTitle}>هشدار مانده قرارداد پیمانکاران</div>
          <span className={cls.badge}>مانده + سررسید</span>
        </div>

        {alerts.length === 0 ? (
          <div className="text-[11px] text-[color:var(--muted)]">
            فعلاً هشدار فعالی وجود ندارد ✅
          </div>
        ) : (
          <div className={cls.alertGrid}>
            {alerts.map((a) => (
              <div key={a.contractId} className={cls.alertCard}>
                <div className={cls.alertTitleRow}>
                  <div>
                    <div className={cls.alertTitle}>
                      {a.contractorName || "—"}
                      {a.projectTitle ? (
                        <span className="text-[11px] font-normal text-[color:var(--muted)]">
                          {" "}
                          — {a.projectTitle}
                        </span>
                      ) : null}
                    </div>
                    <div className={cls.alertMeta}>
                      مانده:{" "}
                      <span className="font-semibold">
                        {fmt(a.remaining)}
                      </span>{" "}
                      | کل: {fmt(a.total)} | پرداخت: {fmt(a.paid)}
                      {a.contractorMobile ? ` | ${a.contractorMobile}` : ""}
                    </div>
                  </div>

                  <span
                    className={`${cls.alertBadge} ${alertBadgeClass(
                      a.dueStatus
                    )}`}
                  >
                    {alertLabel(a.dueStatus)}
                    {typeof a.daysToDue === "number"
                      ? ` (${a.daysToDue} روز)`
                      : ""}
                  </span>
                </div>

                <div className={cls.alertActions}>
                  <a
                    href="/dashboard/management/reports/contractors"
                    className={cls.alertBtnPrimary}
                  >
                    مشاهده گزارش کامل
                  </a>

                  {a.projectId ? (
                    <a
                      href={`/dashboard/projects/${a.projectId}`}
                      className={cls.alertBtn}
                    >
                      مشاهده پروژه
                    </a>
                  ) : null}

                  {a.projectId ? (
                    <a
                      href={`/dashboard/projects/${a.projectId}/report`}
                      className={cls.alertBtn}
                    >
                      PDF پروژه
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Management Reports */}
      <div className="mt-8">
        <div className={cls.sectionTitleRow}>
          <div className={cls.sectionTitle}>گزارش‌های مدیریتی مالی</div>
          <span className={cls.badge}>ویژه مدیریت و حسابداری</span>
        </div>

        <div className={cls.grid2}>
          <a
            href="/dashboard/management/reports/contractors"
            className={cls.card}
          >
            <div className={cls.cardHeader}>
              <div>
                <div className={cls.cardTitle}>پیمانکاران</div>
                <div className={cls.cardSub}>
                  پرداخت‌های انجام‌شده به پیمانکاران اجرایی
                </div>
              </div>
              <div className={cls.cardIcon}>👷</div>
            </div>
          </a>

          <a
            href="/dashboard/management/reports/suppliers"
            className={cls.card}
          >
            <div className={cls.cardHeader}>
              <div>
                <div className={cls.cardTitle}>تأمین‌کنندگان</div>
                <div className={cls.cardSub}>خرید مصالح و مانده بدهی</div>
              </div>
              <div className={cls.cardIcon}>🏭</div>
            </div>
          </a>

          <a
            href="/dashboard/management/reports/expenses"
            className={cls.card}
          >
            <div className={cls.cardHeader}>
              <div>
                <div className={cls.cardTitle}>هزینه‌ها</div>
                <div className={cls.cardSub}>هزینه‌های عمومی و شخصی</div>
              </div>
              <div className={cls.cardIcon}>🧾</div>
            </div>
          </a>

          <a
            href="/dashboard/management/reports/payroll"
            className={cls.card}
          >
            <div className={cls.cardHeader}>
              <div>
                <div className={cls.cardTitle}>حقوق و دستمزد</div>
                <div className={cls.cardSub}>پرداخت حقوق کارمندان</div>
              </div>
              <div className={cls.cardIcon}>💼</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
