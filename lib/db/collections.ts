import collections from "@/lib/data/collections.json";

export type Collection = (typeof collections)[0];

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

const normalizedCollections = collections.map((collection) => ({
  collection,
  title: collection.title.toLowerCase(),
}));

const collectionById = new Map(
  collections.map((collection) => [collection.collection_id, collection]),
);
const collectionsByProductId = collections.reduce<Map<string, Collection[]>>(
  (result, collection) => {
    collection.products.forEach((productId) => {
      const list = result.get(productId) ?? [];
      list.push(collection);
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

// Get all collections
export const getAllCollections = (page: number = 1, limit: number = 20) => {
  return paginate(collections, page, limit);
};

// Get collection by ID
export const getCollectionById = (id: string): Collection | null => {
  return collectionById.get(id) ?? null;
};

// Get collection by path/slug
export const getCollectionByPath = (path: string): Collection | null => {
  return collections.find((c) => c.path === path) ?? null;
};

// Search collection by title
export const searchCollections = (
  keyword: string,
  page: number = 1,
  limit: number = 20,
) => {
  const filtered = normalizedCollections
    .filter((entry) => entry.title.includes(keyword.toLowerCase()))
    .map((entry) => entry.collection);
  return paginate(filtered, page, limit);
};

// Get collections that contain a specific product
export const getCollectionsByProduct = (
  productId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const filtered = collectionsByProductId.get(productId) ?? [];
  return paginate(filtered, page, limit);
};
