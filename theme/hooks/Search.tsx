import { createContext, useCallback, useContext, useState } from "react";

type SearchCondition = {
  products: Set<string>;
  kinds: Set<string>;
  keyword: string;
  onProductsChange: (products: Set<string>) => void;
  onKindsChange: (kinds: Set<string>) => void;
  onKeywordChange: (keyword: string) => void;
};

// 创建 Context
const SearchContext = createContext<SearchCondition | null>(null);

function parseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// Provider 组件
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const p = Array.from(
    parseJson(sessionStorage.getItem("ac-knowledge-products") || "") || []
  ) as string[];
  const k = Array.from(
    parseJson(sessionStorage.getItem("ac-knowledge-kinds") || "") || []
  ) as string[];
  const w = sessionStorage.getItem("ac-knowledge-keyword") || "";

  const [products, setProducts] = useState<Set<string>>(new Set(p));
  const [kinds, setKinds] = useState<Set<string>>(new Set(k));
  const [keyword, setKeyword] = useState<string>(w);

  const onProductsChange = useCallback(
    (products: Set<string>) => {
      sessionStorage.setItem(
        "ac-knowledge-products",
        JSON.stringify(Array.from(products))
      );
      setProducts(products);
    },
    [setProducts]
  );
  const onKindsChange = useCallback(
    (kinds: Set<string>) => {
      sessionStorage.setItem(
        "ac-knowledge-kinds",
        JSON.stringify(Array.from(kinds))
      );
      setKinds(kinds);
    },
    [setKinds]
  );
  const onKeywordChange = useCallback(
    (keyword: string) => {
      sessionStorage.setItem("ac-knowledge-keyword", keyword);
      setKeyword(keyword);
    },
    [setKeyword]
  );

  return (
    <SearchContext.Provider
      value={{
        products,
        kinds,
        keyword,
        onProductsChange,
        onKindsChange,
        onKeywordChange,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// 自定义 Hook
export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context)
    throw new Error("useSearchContext must be used within SearchProvider");
  return context;
}
