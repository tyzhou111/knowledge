declare module "virtual-post-data" {
  interface PostInfo {
    id: string;
    title: string;
    route: string;
    path: string;
    date: string;
    kinds: string[];
    products: string[];
    excerpt: string;
  }

  const postInfos: PostInfo[];
}

declare module "virtual-post-postProducts" {
  export const postProducts: string[];
}

declare module "virtual-post-postKinds" {
  export const postKinds: string[];
}
