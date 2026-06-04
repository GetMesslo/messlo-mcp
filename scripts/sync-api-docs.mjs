/**
 * Bundles developer docs from mess-frontend into messlo-mcp.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const apiDocsPath = path.join(
  repoRoot,
  "mess-frontend/src/data/ApiDocs.tsx"
);
const apiDocsExtendedPath = path.join(
  repoRoot,
  "mess-frontend/src/data/apiDocsExtendedSections.ts"
);
const seoPath = path.join(repoRoot, "mess-frontend/src/data/developerSeo.ts");
const sectionsPath = path.join(
  repoRoot,
  "mess-frontend/src/data/developerDocSections.ts"
);
const waReadmePath = path.join(
  repoRoot,
  "mess-api/modules/whatsapp-auth/README.md"
);
const outPath = path.join(__dirname, "../src/bundled/api-docs.json");

function extractFaqs(source) {
  const faqs = [];
  const re =
    /question:\s*"([^"]+)"[\s\S]*?answer:\s*\n\s*"([^"]+(?:\\.[^"]*)*)"/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    faqs.push({
      question: m[1],
      answer: m[2].replace(/\\n/g, " ").replace(/\s+/g, " ").trim(),
    });
  }
  return faqs;
}

function extractSectionIds(source) {
  const ids = [];
  const re = /"([a-z-]+)"/g;
  const block = source.match(
    /DEVELOPER_DOC_SECTION_IDS\s*=\s*\[([\s\S]*?)\]/
  );
  if (!block) return ids;
  let m;
  while ((m = re.exec(block[1])) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

function extractApiDocs(source) {
  const sections = [];
  const sectionRe =
    /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)"/g;
  let sm;
  const sectionStarts = [];
  while ((sm = sectionRe.exec(source)) !== null) {
    sectionStarts.push({
      id: sm[1],
      title: sm[2],
      description: sm[3],
      index: sm.index,
    });
  }

  for (let i = 0; i < sectionStarts.length; i++) {
    const sec = sectionStarts[i];
    const end =
      i + 1 < sectionStarts.length
        ? sectionStarts[i + 1].index
        : source.length;
    const chunk = source.slice(sec.index, end);
    const endpoints = [];
    const epRe =
      /title:\s*"([^"]+)"[\s\S]*?method:\s*"(GET|POST|PUT|DELETE)"[\s\S]*?path:\s*"([^"]+)"/g;
    let em;
    while ((em = epRe.exec(chunk)) !== null) {
      let description = "";
      const descMatch = em[0].match(/description:\s*\n?\s*"([^"]+)"/);
      if (descMatch) description = descMatch[1];
      let payload = null;
      const payloadMatch = chunk.slice(em.index).match(
        /payload:\s*(\{[\s\S]*?\n\s*\})/
      );
      if (payloadMatch) {
        try {
          payload = Function(
            `"use strict"; return (${payloadMatch[1]})`
          )();
        } catch {
          payload = null;
        }
      }
      endpoints.push({
        title: em[1],
        method: em[2],
        path: em[3].replace(/\/api\/templates\/create/g, "/api/template/create"),
        description,
        payload,
      });
    }
    sections.push({
      id: sec.id,
      title: sec.title,
      description: sec.description,
      endpoints,
    });
  }

  return sections;
}

function buildTemplatePresets(sections) {
  const templateSection = sections.find((s) => s.id === "template");
  if (!templateSection) return {};

  const presets = {};
  const map = [
    ["Simple Template", "simple"],
    ["Template with Variables", "variables"],
    ["OTP / Authentication Template", "otp"],
    ["Template with Quick Reply Buttons", "quick_reply"],
    ["Carousel Template", "carousel"],
  ];

  for (const ep of templateSection.endpoints) {
    const key = map.find(([t]) => ep.title.startsWith(t) || ep.title === t);
    if (key && ep.payload) {
      presets[key[1]] = { ...ep.payload, _example_title: ep.title };
    }
  }

  if (!presets.simple && templateSection.endpoints[0]?.payload) {
    presets.simple = templateSection.endpoints[0].payload;
  }

  return presets;
}

const apiDocsSource = fs.readFileSync(apiDocsPath, "utf8");
const seoSource = fs.readFileSync(seoPath, "utf8");
const sectionsSource = fs.readFileSync(sectionsPath, "utf8");
const waReadme = fs.existsSync(waReadmePath)
  ? fs.readFileSync(waReadmePath, "utf8")
  : "";

const extendedSource = fs.existsSync(apiDocsExtendedPath)
  ? fs.readFileSync(apiDocsExtendedPath, "utf8")
  : "";
const sections = [
  ...extractApiDocs(apiDocsSource),
  ...extractApiDocs(extendedSource),
];
const bundle = {
  generatedAt: new Date().toISOString(),
  sectionIds: extractSectionIds(sectionsSource),
  sections,
  faqs: extractFaqs(seoSource),
  intro: [
    "Messlo provides a developer-friendly REST API on top of the WhatsApp Business Platform (Cloud API).",
    "Authenticate with X-API-Key or Authorization: ApiKey <key>.",
  ],
  templatePresets: buildTemplatePresets(sections),
  loginWithWhatsAppReadme: waReadme.slice(0, 12000),
  mcpInstall: {
    cursor: {
      mcpServers: {
        messlo: {
          command: "npx",
          args: ["-y", "@getmesslo/messlo-mcp"],
          env: {
            MESSLO_API_KEY: "your_key_here",
          },
        },
      },
    },
  },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2));
console.log(`Wrote ${outPath} (${sections.length} sections, ${bundle.faqs.length} FAQs)`);
