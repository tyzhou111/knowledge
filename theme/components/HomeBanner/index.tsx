import { usePageData } from "@rspress/runtime";

interface StyledProps {
  className?: string;
}

interface BannerProps extends StyledProps {
  className?: string;
}

export const HomeBanner: React.FC<BannerProps> = ({ className }) => {
  const pageData = usePageData();

  const logo =
    typeof pageData.siteData.logo === "string"
      ? pageData.siteData.logo
      : pageData.siteData.themeConfig.darkMode
      ? pageData.siteData.logo.dark
      : pageData.siteData.logo.light;

  return (
    <div className={className}>
      <div className="max-w-3/5">
        <h1 className="!text-4xl !font-bold !mb-6">
          {pageData.siteData.title}
        </h1>
        <p className="text-xl !font-semibold ">
          {pageData.siteData.description}
        </p>
      </div>
      <img width={240} src={logo}></img>
    </div>
  );
};
