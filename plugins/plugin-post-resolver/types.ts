export interface PluginOptions {
  postsDir?: string;
}

export interface PostInfo {
  id: string;
  title: string;
  route: string;
  path: string;
  date: string;
  kinds: string[];
  products: string[];
  excerpt: string;
}
