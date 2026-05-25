import { Category } from "./db/categories";

type HttpMethod = "get" | "post" | "put" | "delete";
type FetcherValue = string | number | boolean | null | undefined;
type FetcherParams = Record<string, FetcherValue>;
type CacheStrategy = "default" | "force-cache" | "no-store";

interface ApiResponse {
  message?: string;
}

interface FetcherOptions {
  cache?: CacheStrategy;
  ttlMs?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map<string, { expiresAt: number; data: unknown }>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const createRequestUrl = (url: string, params: FetcherParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const fetcher = async <T extends ApiResponse = ApiResponse>(
  url: string,
  params: FetcherParams = {},
  method: HttpMethod = "get",
  data?: unknown,
  headers?: Record<string, string>,
  options: FetcherOptions = {},
): Promise<T> => {
  const requestUrl = createRequestUrl(url, params);
  const cacheMode =
    options.cache ?? (method === "get" ? "force-cache" : "no-store");
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const cacheKey = `${method}:${requestUrl}`;

  if (method === "get" && cacheMode !== "no-store") {
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) return inFlight as Promise<T>;
  }

  const request = (async () => {
    const response = await fetch(requestUrl, {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      cache: cacheMode,
    });

    const payload = (await response.json().catch(() => null)) as T | null;

    if (!response.ok) {
      throw new Error(
        payload?.message || `Request failed with status ${response.status}`,
      );
    }

    if (method === "get" && cacheMode !== "no-store") {
      memoryCache.set(cacheKey, {
        expiresAt: Date.now() + ttlMs,
        data: payload,
      });
    }

    return payload as T;
  })() as Promise<T>;

  if (method === "get" && cacheMode !== "no-store") {
    inFlightRequests.set(cacheKey, request);
  }

  try {
    return await request;
  } catch (error) {
    console.error("Fetcher error:", error);
    throw error instanceof Error
      ? error
      : new Error("Terjadi kesalahan yang tidak terduga");
  } finally {
    if (method === "get") {
      inFlightRequests.delete(cacheKey);
    }
  }
};

// ===== GLOBAL SEARCH =====
export const GlobalSearch = async (
  section: "products" | "categories" | "collections",
  keyword: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/search", { section, keyword, ...params }, "get");
};

// ===== PRODUCTS =====

export const GetAllProducts = async (params?: FetcherParams) => {
  return fetcher("/api/products", params, "get");
};

// GET /api/products?keyword=sepatu
export const SearchProducts = async (
  keyword: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/products", { keyword, ...params }, "get");
};

// GET /api/products?category=fashion
export const GetProductsByCategory = async (
  category: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/products", { category, ...params }, "get");
};

// GET /api/products?sortBy=price_asc
export const GetProductsSorted = async (
  sortBy: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/products", { sortBy, ...params }, "get");
};

// GET /api/products?keyword=...&category=...&minPrice=...&maxPrice=...&sortBy=...
export const GetFilteredProducts = async (params?: FetcherParams) => {
  return fetcher("/api/products", params, "get");
};

// GET /api/products/[id]
export const GetProductById = async (id: string) => {
  return fetcher(`/api/products/${id}`, {}, "get");
};

// GET /api/products/[id]/related
export const GetRelatedProducts = async (
  id: string,
  params?: FetcherParams,
) => {
  return fetcher(`/api/products/${id}/related`, params, "get");
};

// GET /api/products?random=true
export const GetRandomProducts = async (params?: FetcherParams) => {
  return fetcher("/api/products", { random: true, ...params }, "get");
};

// ===== CATEGORIES =====

export const GetAllCategories = async (params?: FetcherParams) => {
  return fetcher<PaginatedResponse<Category>>("/api/categories", params, "get");
};

export const GetCategoryById = async (id: string) => {
  return fetcher(`/api/categories/${id}`, {}, "get");
};

export const SearchCategories = async (
  keyword: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/categories", { keyword, ...params }, "get");
};

export const GetCategoriesByProduct = async (
  productId: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/categories", { productId, ...params }, "get");
};

// ===== COLLECTIONS =====

export const GetAllCollections = async (params?: FetcherParams) => {
  return fetcher("/api/collections", params, "get");
};

export const GetCollectionById = async (id: string) => {
  return fetcher(`/api/collections/${id}`, {}, "get");
};

export const SearchCollections = async (
  keyword: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/collections", { keyword, ...params }, "get");
};

export const GetCollectionsByProduct = async (
  productId: string,
  params?: FetcherParams,
) => {
  return fetcher("/api/collections", { productId, ...params }, "get");
};
