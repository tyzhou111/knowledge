import { Layout } from "rspress/theme";
import { usePageData } from "rspress/runtime";
import { useMemo } from "react";

export default () => {
  const { page } = usePageData();

  const uiSwitch = useMemo(
    () => (page.pageType === "doc" ? { showSidebar: false } : {}),
    [page]
  );

  return <Layout uiSwitch={uiSwitch}></Layout>;
};
