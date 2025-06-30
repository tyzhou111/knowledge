import path from "node:path";
import dayjs from "dayjs";
import grayMatter from "gray-matter";
import { PostInfo } from "./types";
import { excerptFilter, generateRoutePath, normalizeTags } from "./utils";

export const postInfos: PostInfo[] = [];
export const postProducts: string[] = [];
export const postKinds: string[] = [];

export function resetPostInfo() {
  postProducts.length = 0;
  postKinds.length = 0;
  postInfos.length = 0;
}

export function getPostInfo(
  filepath: string,
  baseDir: string
): PostInfo | null {
  let filename = path.basename(filepath.toString());
  const extname = path.extname(filename);
  if ([".mdx", ".md", ".html"].indexOf(extname) === -1) {
    return null;
  }

  const relativePath = path.relative(baseDir, filepath);

  const routePath = generateRoutePath(relativePath);

  if (routePath === "/") {
    return null;
  }

  const { data: frontmatter, excerpt } = grayMatter.read(filepath, {
    excerpt: excerptFilter,
  });

  const createTime = dayjs(frontmatter.date) || dayjs();
  return {
    title: frontmatter.title || filename,
    route: routePath,
    path: filepath,
    date: createTime.format("YYYY-MM-DD HH:mm:ss"),
    kinds: normalizeTags(frontmatter.kind || frontmatter.kinds),
    products: normalizeTags(frontmatter.product || frontmatter.products),
    id: frontmatter.id,
    excerpt: frontmatter.description || excerpt,
  };
}

export function addPost(post: PostInfo) {
  postInfos.push(post);

  postProducts.push(...post.products);
  postKinds.push(...post.kinds);
}

export function sortPostInfos() {
  postInfos.sort((a, b) => {
    return dayjs(b.date).unix() - dayjs(a.date).unix();
  });
}
