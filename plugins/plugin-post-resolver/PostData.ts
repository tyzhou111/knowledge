import path from "node:path";
import dayjs from "dayjs";
import grayMatter from "gray-matter";
import { PostCategory, InternalPostCategory, PostInfo, PostTag } from "./types";
import {
  excerptFilter,
  generateRoutePath,
  norminalizeCategory,
  norminalizeTags,
} from "./utils";

// 所有的文章列表
export const postInfos: PostInfo[] = [];

// 文章分类，树形结构
export const postCategories = new Map<string, InternalPostCategory>();

// 文章标签
export const postTags = new Map<string, PostTag>();

/**
 * 重置文章信息
 */
export function resetPostInfo() {
  postTags.clear();
  postCategories.clear();
  postInfos.length = 0;
}

/**
 * 解析文章信息
 * @param filepath 文章路径
 * @returns
 */
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

  // 解析文章的frontmatter
  const { data: frontmatter, excerpt } = grayMatter.read(filepath, {
    excerpt: excerptFilter,
  });

  const createTime = dayjs(frontmatter.date) || dayjs();

  return {
    title: frontmatter.title || filename,
    route: routePath,
    path: filepath,
    date: createTime.format("YYYY-MM-DD HH:mm:ss"),
    kinds: norminalizeCategory(frontmatter.kind || frontmatter.kinds),
    products: norminalizeTags(frontmatter.product || frontmatter.products),
    excerpt: frontmatter.description || excerpt,
  };
}

/**
 * 添加文章到数据库
 * @param post
 */
export function addPost(post: PostInfo) {
  postInfos.push(post);
}

/**
 * 整理文章信息
 */
export function sortPostInfos() {
  postInfos.sort((a, b) => {
    return dayjs(b.date).unix() - dayjs(a.date).unix();
  });

  // 分类中的文章也顺便排一下
  const sortPostCategories = (
    categories: Map<string, InternalPostCategory>
  ) => {
    categories.forEach((postCategory) => {
      postCategory.posts.sort((a, b) => {
        return dayjs(b.date).unix() - dayjs(a.date).unix();
      });
      sortPostCategories(postCategory.children);
    });
  };
  sortPostCategories(postCategories);

  // 标签中的文章也需要排序
  postTags.forEach((postTag) => {
    postTag.posts.sort((a, b) => {
      return dayjs(b.date).unix() - dayjs(a.date).unix();
    });
  });
}

/**
 * 获取数组格式的分类，递归进行转换
 */
export function getCategoriesArray(
  categories: Map<string, InternalPostCategory> = postCategories
): PostCategory[] {
  const result: PostCategory[] = [];
  categories.forEach((postCategory) => {
    result.push({
      ...postCategory,
      children: getCategoriesArray(postCategory.children),
    } as PostCategory);
  });
  return result;
}

/**
 * 获取数组格式的标签
 */
export function getTagsArray(): PostTag[] {
  return Array.from(postTags.values());
}
