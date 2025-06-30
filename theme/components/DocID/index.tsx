import { usePageData } from "rspress/runtime";

export const DocID = () => {
  const pageData = usePageData();
  return pageData.page.frontmatter.id ? (
    <div className="rp-flex rp-text-sm rp-text-text-2 rp-leading-6 sm:rp-leading-8 rp-font-medium">
      ID: {pageData.page.frontmatter.id as string}
    </div>
  ) : (
    <></>
  );
};
