import { Layout } from "rspress/theme";
import { usePageData } from "rspress/runtime";
import { useMemo } from "react";
import HomeLayout from "./HomeLayout";
import { EditOnGithub } from "../components/EditOnGithub";
import { SearchProvider } from "../hooks/Search";

export default () => {
  const { page } = usePageData();

  const uiSwitch = useMemo(
    () => (page.pageType === "doc" ? { showSidebar: false } : {}),
    [page]
  );

  return (
    <SearchProvider>
      <Layout
        uiSwitch={uiSwitch}
        HomeLayout={HomeLayout}
        beforeOutline={<EditOnGithub></EditOnGithub>}
      ></Layout>
    </SearchProvider>
  );
};
