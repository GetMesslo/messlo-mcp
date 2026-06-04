import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cached = null;

export function loadBundledDocs() {
  if (cached) return cached;
  const filePath = path.join(__dirname, "api-docs.json");
  if (!fs.existsSync(filePath)) {
    return {
      sections: [],
      faqs: [],
      intro: [],
      templatePresets: {},
      sectionIds: [],
      loginWithWhatsAppReadme: "",
      mcpInstall: {},
    };
  }
  cached = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const supplementPath = path.join(__dirname, "api-docs-supplement.json");
  if (fs.existsSync(supplementPath)) {
    const supplement = JSON.parse(fs.readFileSync(supplementPath, "utf8"));
    const existingIds = new Set(cached.sections.map((s) => s.id));
    for (const section of supplement.sections || []) {
      if (!existingIds.has(section.id)) {
        cached.sections.push(section);
        existingIds.add(section.id);
      }
    }
    if (supplement.faqs?.length) {
      cached.faqs = [...(cached.faqs || []), ...supplement.faqs];
    }
    cached.sectionIds = [
      ...new Set([...(cached.sectionIds || []), ...cached.sections.map((s) => s.id)]),
    ];
  }

  return cached;
}

export function searchDocs(query) {
  const docs = loadBundledDocs();
  const q = String(query || "")
    .toLowerCase()
    .trim();
  if (!q) {
    return {
      sections: docs.sections.map((s) => ({
        id: s.id,
        title: s.title,
        endpointCount: s.endpoints.length,
      })),
      faqs: docs.faqs.slice(0, 5),
    };
  }

  const endpoints = [];
  for (const section of docs.sections) {
    for (const ep of section.endpoints) {
      const hay = `${section.title} ${ep.title} ${ep.path} ${ep.description} ${ep.method}`.toLowerCase();
      if (hay.includes(q)) {
        endpoints.push({ section: section.id, ...ep });
      }
    }
  }

  const faqs = docs.faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q)
  );

  return { endpoints: endpoints.slice(0, 25), faqs: faqs.slice(0, 10) };
}
