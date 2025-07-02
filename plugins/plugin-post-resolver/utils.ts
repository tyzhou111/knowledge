import path from "node:path";
import { Marked } from "@ts-stack/markdown";
import * as cheerio from "cheerio";
import { execa } from "execa";

export function normalizeTags(tags: string | string[]): string[] {
  if (!tags) {
    return [];
  }
  if (Array.isArray(tags)) {
    return tags;
  }
  return [tags];
}

const excerptSeparator = /<!-- ?more ?-->/i;

export const extractTitle = (content: string): string => {
  const html = Marked.parse(content);
  const $ = cheerio.load(html);

  return $("h1").first().text() || "";
};

export const excerptFilter = (_input: unknown): any => {
  const input = _input as { content: string; excerpt: string };
  const { content } = input;
  if (excerptSeparator.test(content)) {
    const index = content.search(excerptSeparator);
    input.excerpt = content.substring(0, index);
  } else {
    const html = Marked.parse(content);

    const { issueContent, overviewContent, firstH2Content } =
      extractContent(html);

    input.excerpt = issueContent || overviewContent || firstH2Content || "";
  }
};

export function generateRoutePath(filePath: string): string {
  let route = filePath.replace(/\.[^.]+$/, "");

  if (path.basename(route) === "index") {
    route = path.dirname(route);
  }

  route = route.replace(/$$(\w+)$$/g, ":$1");

  if (route === ".") {
    return "/";
  }

  if (!route.startsWith("/")) route = "/" + route;

  return route.replace(/\\/g, "/");
}

export const deDuplicate = (arr: string[]) => {
  return Array.from(new Set(arr));
};

interface ExtractedContent {
  issueContent: string;
  overviewContent: string;
  firstH2Content: string;
}

function extractContent(html: string): ExtractedContent {
  const $ = cheerio.load(html);

  // 1. 提取 h2 text 为 "Issue" 元素后的内容
  const issueContent = extractContentAfterHeading($, "h2", "Issue");

  // 2. 提取 h2 text 为 "overview" 元素后的内容
  const overviewContent = extractContentAfterHeading($, "h2", "overview");

  // 3. 提取第一个 h2 元素后的内容
  const firstH2Content = extractContentAfterFirstHeading($, "h2");

  return {
    issueContent,
    overviewContent,
    firstH2Content,
  };
}

// 提取指定标题后的内容（直到下一个标题）
function extractContentAfterHeading(
  $: cheerio.CheerioAPI,
  heading: string,
  text: string
): string {
  const headingElement = $(heading)
    .filter((_, el) => $(el).text().trim().toLowerCase() === text.toLowerCase())
    .first();

  if (!headingElement.length) return "";

  return extractUntilNextHeading($, headingElement);
}

// 提取第一个指定标题后的内容
function extractContentAfterFirstHeading(
  $: cheerio.CheerioAPI,
  heading: string
): string {
  const firstHeading = $(heading).first();
  if (!firstHeading.length) return "";

  return extractUntilNextHeading($, firstHeading);
}

// 从起始元素提取内容直到遇到下一个标题
function extractUntilNextHeading(
  $: cheerio.CheerioAPI,
  startElement: cheerio.Cheerio<any>
): string {
  const contentParts: string[] = [];
  let currentNode = startElement.next();

  while (currentNode.length > 0 && !isHeadingElement(currentNode)) {
    // 收集文本内容（保留换行）
    const nodeText = currentNode
      .contents()
      .map((_, el) => (el.type === "text" ? $(el).text().trim() : $(el).text()))
      .get()
      .join(" ")
      .trim();

    if (nodeText) contentParts.push(nodeText);
    currentNode = currentNode.next();
  }

  return contentParts.join("\n").trim();
}

// 检查元素是否是标题元素
function isHeadingElement(element: cheerio.Cheerio<any>): boolean {
  const tagName = element[0]?.tagName?.toLowerCase() || "";
  return ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName);
}

export async function getGitLastUpdatedTimeStamp(filePath: string) {
  let lastUpdated;
  try {
    const { stdout } = await execa("git", [
      "log",
      "-1",
      "--format=%at",
      filePath,
    ]);
    lastUpdated = Number(stdout) * 1000;
  } catch (_e) {
    /* noop */
  }
  return lastUpdated;
}

export function transformTime(timestamp: number, lang: string) {
  return new Date(timestamp).toLocaleString(lang || "zh");
}
