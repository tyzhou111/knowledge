import { Layout } from "rspress/theme";
import { usePageData } from "rspress/runtime";
import { useMemo } from "react";
import HomeLayout from "./HomeLayout";

export default () => {
  const { page } = usePageData();

  const uiSwitch = useMemo(
    () => (page.pageType === "doc" ? { showSidebar: false } : {}),
    [page]
  );

  return <Layout uiSwitch={uiSwitch} HomeLayout={HomeLayout}></Layout>;
};
