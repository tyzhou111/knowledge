import { FC, useMemo } from "react";
import { PostInfo } from "../../../plugins/plugin-post-resolver";
import { Badge, LinkCard } from "rspress/theme";
import { Marked } from "@ts-stack/markdown";
import { useI18n } from "rspress/runtime";
import EmptyState from "../Empty";

interface PostListProps {
  postList: PostInfo[];
}

const Empty = () => {
  return;
};

export const PostList: FC<PostListProps> = ({ postList }) => {
  const t = useI18n();

  const notEmpty = useMemo(() => postList.length > 0, [postList]);

  return (
    <div>
      {notEmpty ? (
        postList.map((post) => {
          const { kinds, products } = post;

          const badges = [...kinds, ...products];
          return (
            <LinkCard
              style={{ marginBottom: "24px" }}
              title={post.title}
              description={
                <>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: Marked.parse(post.excerpt),
                    }}
                  ></div>
                  <div className="flex mt-2">
                    {badges.map((badge) => (
                      <div className="mr-2">
                        <Badge>{t(badge)}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              }
              href={post.route}
              key={post.route}
            ></LinkCard>
          );
        })
      ) : (
        <EmptyState></EmptyState>
      )}
    </div>
  );
};
