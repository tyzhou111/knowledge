import { usePageData } from "rspress/runtime";

export const BreadCrumb = () => {
  const { page, siteData } = usePageData();
  const { base } = siteData;
  return (
    <div className="rp-mb-10">
      <span className="editLink" style={{ paddingLeft: 0 }}>
        <a href={base ? base : "/"}>
          <span>Knowledge</span>
        </a>
      </span>
      <span style={{ fontSize: "15px", fontWeight: 500 }}>
        {" "}
        &nbsp;/&nbsp;<span>{page.title}</span>
      </span>
    </div>
  );
};
