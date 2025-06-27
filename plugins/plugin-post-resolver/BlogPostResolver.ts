import path from "node:path";
import fs, { PathLike } from "node:fs";
import { RspressPlugin } from "@rspress/shared";
import {
  addPost,
  getPostInfo,
  postInfos,
  postKinds,
  postProducts,
  resetPostInfo,
  sortPostInfos,
} from "./PostData";
import { PluginOptions } from "./types";
import { deDuplicate } from "./utils";

function traverseFolder(
  folderPath: PathLike,
  callback: (path: PathLike) => void
) {
  const items = fs.readdirSync(folderPath);
  items.forEach((item) => {
    const itemPath = path.join(folderPath.toString(), item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      traverseFolder(itemPath, callback);
    } else if (stats.isFile()) {
      callback(itemPath);
    }
  });
}

export function blogPostResolver(options?: PluginOptions): RspressPlugin {
  const { postsDir = process.cwd() } = options || {};
  return {
    name: "@yangxiaolang/rspress-plugin-post-resolver",
    beforeBuild() {
      resetPostInfo();
      traverseFolder(postsDir, (itemPath) => {
        const postInfo = getPostInfo(itemPath as string, postsDir);
        if (!postInfo) {
          return;
        }
        addPost(postInfo);
      });

      sortPostInfos();
    },
    addRuntimeModules() {
      return {
        "virtual-post-data": `
          export const postInfos = ${JSON.stringify(postInfos)}
        `,
        "virtual-post-postProducts": `
          export const postProducts = ${JSON.stringify(
            deDuplicate(postProducts)
          )}
        `,
        "virtual-post-postKinds": `
          export const postKinds = ${JSON.stringify(deDuplicate(postKinds))}
        `,
      };
    },
  };
}
