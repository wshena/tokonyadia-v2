import axios from "axios";

type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type FetcherParams = Record<string, any>;

const fetcher = async (
  url: string,
  params: FetcherParams = {},
  method: HttpMethod = 'get',
  data?: any,
  headers?: Record<string, string>
) => {
  try {
    const response = await axios.request({
      method,
      url,
      params,
      data,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;

      console.error('Fetcher error:', {
        status: statusCode,
        data: responseData,
        message: error.message
      });

      throw new Error(
        responseData?.message ||
        error.message ||
        `Request failed with status ${statusCode}`
      );
    }

    console.error('Unexpected fetcher error:', error);
    throw new Error('Terjadi kesalahan yang tidak terduga');
  }
};

// ===== PRODUCTS =====

export const GetAllProducts = async (params?: FetcherParams) => {
  return fetcher('/api/products', params, 'get');
};

// GET /api/products?keyword=sepatu
export const SearchProducts = async (keyword: string, params?: FetcherParams) => {
  return fetcher('/api/products', { keyword, ...params }, 'get');
};

// GET /api/products?category=fashion
export const GetProductsByCategory = async (category: string, params?: FetcherParams) => {
  return fetcher('/api/products', { category, ...params }, 'get');
};

// GET /api/products?sortBy=price_asc
export const GetProductsSorted = async (sortBy: string, params?: FetcherParams) => {
  return fetcher('/api/products', { sortBy, ...params }, 'get');
};

// GET /api/products?keyword=...&category=...&minPrice=...&maxPrice=...&sortBy=...
export const GetFilteredProducts = async (params?: FetcherParams) => {
  return fetcher('/api/products', params, 'get');
};

// GET /api/products/[id]
export const GetProductById = async (id: string) => {
  return fetcher(`/api/products/${id}`, {}, 'get');
};

// GET /api/products/[id]/related
export const GetRelatedProducts = async (id: string, params?: FetcherParams) => {
  return fetcher(`/api/products/${id}/related`, params, 'get');
};

// ===== CATEGORIES =====

export const GetAllCategories = async (params?: FetcherParams) => {
  return fetcher('/api/categories', params, 'get');
};

export const GetCategoryById = async (id: string) => {
  return fetcher(`/api/categories/${id}`, {}, 'get');
};

export const SearchCategories = async (keyword: string, params?: FetcherParams) => {
  return fetcher('/api/categories', { keyword, ...params }, 'get');
};

export const GetCategoriesByProduct = async (productId: string, params?: FetcherParams) => {
  return fetcher('/api/categories', { productId, ...params }, 'get');
};

// ===== COLLECTIONS =====

export const GetAllCollections = async (params?: FetcherParams) => {
  return fetcher('/api/collections', params, 'get');
};

export const GetCollectionById = async (id: string) => {
  return fetcher(`/api/collections/${id}`, {}, 'get');
};

export const SearchCollections = async (keyword: string, params?: FetcherParams) => {
  return fetcher('/api/collections', { keyword, ...params }, 'get');
};

export const GetCollectionsByProduct = async (productId: string, params?: FetcherParams) => {
  return fetcher('/api/collections', { productId, ...params }, 'get');
};