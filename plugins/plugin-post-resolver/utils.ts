import path from "node:path";
import { Marked } from "@ts-stack/markdown";

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

export const excerptFilter = (_input: unknown): any => {
  const input = _input as { content: string; excerpt: string };
  const { content } = input;
  if (excerptSeparator.test(content)) {
    const index = content.search(excerptSeparator);
    input.excerpt = content.substring(0, index);
  } else {
    const html = Marked.parse(content);

    input.excerpt = html.match(/<p>(.*?)<\/p>/)?.[1] || "";
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
