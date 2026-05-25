import categories from "@/lib/data/categories.json";

export type Category = (typeof categories)[0];

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const normalizedCategories = categories.map((category) => ({
  category,
  title: category.title.toLowerCase(),
}));

const categoryById = new Map(
  categories.map((category) => [category.category_id, category]),
);
const categoriesByProductId = categories.reduce<Map<string, Category[]>>(
  (result, category) => {
    category.products.forEach((productId) => {
      const list = result.get(productId) ?? [];
      list.push(category);
      result.set(productId, list);
    });
    return result;
  },
  new Map(),
);

const paginate = <T>(
  data: T[],
  page: number,
  limit: number,
): PaginationResult<T> => {
  const offset = (page - 1) * limit;
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data.slice(offset, offset + limit),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Get all categories
export const getAllCategories = (page: number = 1, limit: number = 20) => {
  return paginate(categories, page, limit);
};

// Get category by ID
export const getCategoryById = (id: string): Category | null => {
  return categoryById.get(id) ?? null;
};

// Get category by path/slug
export const getCategoryByPath = (path: string): Category | null => {
  return categories.find((c) => c.path === path) ?? null;
};

// Search category by title
export const searchCategories = (
  keyword: string,
  page: number = 1,
  limit: number = 20,
) => {
  const filtered = normalizedCategories
    .filter((entry) => entry.title.includes(keyword.toLowerCase()))
    .map((entry) => entry.category);
  return paginate(filtered, page, limit);
};

// Get categories that contain a specific product
export const getCategoriesByProduct = (
  productId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const filtered = categoriesByProductId.get(productId) ?? [];
  return paginate(filtered, page, limit);
};
