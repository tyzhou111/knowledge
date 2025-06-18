declare module "virtual-post-data" {
  import { PostInfo } from "@yangdxiaolang/plugin-post-resolve";
  const postInfos: PostInfo[];
}

declare module "virtual-post-tags" {
  import { PostTag } from "@yangdxiaolang/plugin-post-resolve";
  export const postTags: PostTag[];
}

declare module "virtual-post-categories" {
  import { PostCategory } from "@yangdxiaolang/plugin-post-resolve";
  export const postCategories: PostCategory[];
}
