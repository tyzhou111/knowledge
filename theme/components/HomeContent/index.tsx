import { useSearchContext } from "../../hooks/Search";
import Checkbox from "../Checkbox";
import { Card, useFullTextSearch } from "rspress/theme";
import { useCallback, useMemo, useState } from "react";
import { PostInfo, postInfos } from "virtual-post-data";
import { postProducts } from "virtual-post-postProducts";
import { postKinds } from "virtual-post-postKinds";
import { PostList } from "../PostList";
import Search from "../Search";
import Pagination from "../Pagination";

const SEARCHED_LIMIT = 1000;
const PAGE_SIZE = 10;

export const HomeContent: React.FC = () => {
  const {
    products,
    kinds,
    keyword,
    searchParams,
    onSearchParamsChange,
    onProductsChange,
    onKindsChange,
    onKeywordChange,
  } = useSearchContext();

  const { initialized, search } = useFullTextSearch();
  const [searchedPosts, setSearchedPosts] = useState<PostInfo[]>([]);

  const searchFull = useCallback(
    async (keyword: string) => {
      onKeywordChange(keyword);
      if (initialized) {
        const results = await search(keyword, SEARCHED_LIMIT);
        const searched = (
          (results[0].result || []) as Array<{ link: string }>
        ).map(({ link }) => link.split(".html")[0]);
        const searchPosts = postInfos.filter((post) => {
          return (
            searched.some((link) => {
              return post.route.endsWith(link);
            }) || post.id === keyword
          );
        });

        setSearchedPosts(searchPosts);
      }
    },
    [initialized]
  );

  const finalPosts = useMemo(() => {
    const filterPosts = keyword === "" ? postInfos : searchedPosts;
    return filterPosts.filter((post) => {
      const productsMatch =
        Array.from(products).every((product) =>
          post.products.includes(product)
        ) ?? true;

      const kindsMatch =
        Array.from(kinds)?.every((kind) => post.kinds.includes(kind)) ?? true;

      return productsMatch && kindsMatch;
    });
  }, [products, kinds, keyword, searchedPosts]);

  const totalPage = useMemo(
    () => Math.ceil(finalPosts.length / PAGE_SIZE),
    [finalPosts]
  );
  const currentPage = useMemo(() => {
    let page = Number(searchParams.get("page")) || 1;
    if (page < 1) {
      page = 1;
    }
    if (page > totalPage) {
      page = totalPage;
    }
    return page < 1 ? 1 : page;
  }, [searchParams]);

  const pageChange = useCallback(
    (number) => onSearchParamsChange({ page: `${number}` }),
    [onSearchParamsChange]
  );

  const currentPageData = useMemo(() => {
    return finalPosts.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );
  }, [currentPage, finalPosts]);

  const productsChange = (value: string) => {
    if (products.has(value)) {
      products.delete(value);
    } else {
      products.add(value);
    }
    onProductsChange(new Set(products));
    pageChange(1);
  };

  const kindsChange = (value: string) => {
    if (kinds.has(value)) {
      kinds.delete(value);
    } else {
      kinds.add(value);
    }
    onKindsChange(new Set(kinds));
    pageChange(1);
  };

  return (
    <div className="flex w-full relative">
      <div className="flex-1/4 mr-6 sticky">
        <Card
          style={{ marginBottom: "24px" }}
          title="Products"
          content={
            <>
              {postProducts.map((product) => (
                <Checkbox
                  key={product}
                  className="mb-2 ml-2"
                  checked={products.has(product)}
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
              {postKinds.map((kind) => (
                <Checkbox
                  key={kind}
                  className="mb-2 ml-2"
                  checked={kinds.has(kind)}
                  label={kind}
                  onChange={kindsChange}
                ></Checkbox>
              ))}
            </>
          }
        ></Card>
      </div>
      <div className="flex-3/4">
        <Search
          className="mb-4"
          value={keyword}
          onSearch={(keyword) => searchFull(keyword)}
        ></Search>
        <PostList postList={currentPageData}></PostList>
        <Pagination
          currentPage={currentPage}
          totalPage={totalPage}
          onChange={pageChange}
        ></Pagination>
      </div>
    </div>
  );
};
