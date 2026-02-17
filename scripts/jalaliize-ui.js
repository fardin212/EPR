/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOTS = ["app", "components"];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walk(p));
    } else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      out.push(p);
    }
  }
  return out;
}

function ensureImport(code) {
  if (!code.includes("toJalali(")) return code;
  if (code.includes('from "@/lib/date"')) return code;

  const useClient = /^"use client";\s*\n/;
  if (useClient.test(code)) {
    return code.replace(
      useClient,
      (m) => m + 'import { toJalali } from "@/lib/date";\n'
    );
  }
  return 'import { toJalali } from "@/lib/date";\n' + code;
}

function transform(code) {
  let changed = false;

  // new Date(x).toLocaleDateString(...) => toJalali(x)
  const r1 = /new Date\(([^)]+)\)\.toLocaleDateString\(([^)]*)\)/g;
  code = code.replace(r1, (_, expr) => {
    changed = true;
    return `toJalali(${expr.trim()})`;
  });

  // new Date(x).toLocaleString(...) => toJalali(x, true)
  const r2 = /new Date\(([^)]+)\)\.toLocaleString\(([^)]*)\)/g;
  code = code.replace(r2, (_, expr) => {
    changed = true;
    return `toJalali(${expr.trim()}, true)`;
  });

  if (!changed) return { code, changed: false };

  code = ensureImport(code);
  return { code, changed: true };
}

const files = ROOTS.map(walk).flat();

let updated = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const { code, changed } = transform(src);
  if (changed && code !== src) {
    fs.writeFileSync(f, code, "utf8");
    updated++;
  }
}

console.log(`✅ Updated ${updated} files.`);
