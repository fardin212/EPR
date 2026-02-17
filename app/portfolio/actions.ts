// app/portfolio/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

// ضد اسپم ساده (honeypot + throttle ساده با کیلید حافظه در DB یا IP را می‌توان بعداً افزود)
function isSpam(form: FormData) {
  return (form.get("website") as string) ? true : false; // فیلد مخفی
}

function sanitize(s: unknown) {
  return String(s || "").trim();
}

export async function addQuestion(form: FormData) {
  if (isSpam(form)) return;
  const projectId = Number(form.get("projectId"));
  const name = sanitize(form.get("name"));
  const phone = sanitize(form.get("phone"));
  const question = sanitize(form.get("question"));

  if (!Number.isFinite(projectId) || !name || !question) throw new Error("ورودی نامعتبر است");

  await prisma.projectQuestion.create({
    data: { projectId, name, phone: phone || null, question },
  });

  redirect(`/portfolio/${form.get("slug") as string}#qa`);
}

export async function addComment(form: FormData) {
  if (isSpam(form)) return;
  const projectId = Number(form.get("projectId"));
  const name = sanitize(form.get("name"));
  const body = sanitize(form.get("body"));
  const rating = Math.max(1, Math.min(5, Number(form.get("rating") || 5)));

  if (!Number.isFinite(projectId) || !name || !body) throw new Error("ورودی نامعتبر است");

  await prisma.projectComment.create({
    data: { projectId, name, body, rating },
  });

  redirect(`/portfolio/${form.get("slug") as string}#comments`);
}
