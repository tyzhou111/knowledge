import { usePageData } from "rspress/runtime";

export const BreadCrumb = () => {
  const pageData = usePageData();
  return (
    <div className="rp-mb-10">
      <span className="editLink" style={{ paddingLeft: 0 }}>
        <a href="/">
          <span>Knowledge</span>
        </a>
      </span>
      <span style={{ fontSize: "15px", fontWeight: 500 }}>
        {" "}
        &nbsp;/&nbsp;<span>{pageData.page.title}</span>
      </span>
    </div>
  );
};
