import path from "node:path";
import { Marked } from "@ts-stack/markdown";

export function norminalizeCategory(category: string | string[]): string[] {
  if (!category) {
    return [];
  }
  if (Array.isArray(category)) {
    return category;
  }
  return [category];
}

export function norminalizeTags(tags: string | string[]): string[] {
  if (!tags) {
    return [];
  }
  if (Array.isArray(tags)) {
    return tags;
  }
  return tags.split(",");
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
  // 1. 移除文件扩展名
  let route = filePath.replace(/\.[^.]+$/, "");

  // 2. 处理索引文件 (index -> 目录根路径)
  if (path.basename(route) === "index") {
    route = path.dirname(route);
  }

  // 3. 转换动态路由参数 [param] -> :param
  route = route.replace(/$$(\w+)$$/g, ":$1");

  if (route === ".") {
    return "/";
  }

  // 4. 确保路径以 / 开头
  if (!route.startsWith("/")) route = "/" + route;

  // 5. 处理 Windows 路径分隔符
  return route.replace(/\\/g, "/");
}
