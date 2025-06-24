import { usePageData } from "@rspress/runtime";
import { ReactNode, useState } from "react";
import { postInfos } from "virtual-post-data";
import {
  LinkCard,
  Card,
  Search,
  renderInlineMarkdown,
} from "@rspress/theme-default";
import Checkbox from "../../components/Checkbox";

interface StyledProps {
  className?: string;
}

interface BannerProps extends StyledProps {
  className?: string;
}

const HomeBanner: React.FC<BannerProps> = ({ className }) => {
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

const products = ["acp", "devops", "ai", "aas"];
const kinds = ["solution", "trouble-shooting", "article", "docs"];

const HomeContent: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set([])
  );
  const [selectedKinds, setKinds] = useState<Set<string>>(new Set([]));

  const productsChange = (value: string) => {
    if (selectedProducts.has(value)) {
      selectedProducts.delete(value);
    } else {
      selectedProducts.add(value);
    }
    setSelectedProducts(new Set(selectedProducts));
  };

  const kindsChange = (value: string) => {
    if (selectedKinds.has(value)) {
      selectedKinds.delete(value);
    } else {
      selectedKinds.add(value);
    }
    setKinds(new Set(selectedKinds));
  };

  const aa = renderInlineMarkdown("asd");
  aa;

  return (
    <div className="flex w-full h-[200px] relative">
      <div className="flex-1/4 mr-6 sticky">
        <Card
          style={{ marginBottom: "24px" }}
          title="Products"
          content={
            <>
              {products.map((product) => (
                <Checkbox
                  key={product}
                  className="mb-2"
                  checked={selectedProducts.has(product)}
                  label={product}
                  onChange={productsChange}
                ></Checkbox>
              ))}
            </>
          }
        ></Card>
        <Card
          style={{ marginBottom: "24px" }}
          title="Kinds"
          content={
            <>
              {kinds.map((kind) => (
                <Checkbox
                  key={kind}
                  className="mb-2"
                  checked={selectedKinds.has(kind)}
                  label={kind}
                  onChange={kindsChange}
                ></Checkbox>
              ))}
            </>
          }
        ></Card>
      </div>
      <div className="flex-3/4">
        <div style={{ marginBottom: "24px" }}>
          <Search />
        </div>

        {postInfos.map((post) => {
          console.log(post.excerpt, renderInlineMarkdown(post.excerpt));
          return (
            <LinkCard
              style={{ marginBottom: "24px" }}
              title={post.title}
              description={<div {...renderInlineMarkdown(post.excerpt)}></div>}
              href={post.route}
              key={post.route}
            ></LinkCard>
          );
        })}
      </div>
    </div>
  );
};

const HomeLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="m-auto w-2/3 flex flex-col items-center px-3">
      {children}
    </div>
  );
};

export default () => {
  return (
    <HomeLayout>
      <HomeBanner className="flex items-stretch justify-between w-full mt-6 mb-4"></HomeBanner>
      <HomeContent></HomeContent>
    </HomeLayout>
  );
};
