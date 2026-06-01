import products from "@/lib/data/products.json";
import { createSlug } from "@/lib/utils";

export type ProductContext = {
  product_id: string;
  title: string;
  category: string;
  price: {
    currency: string;
    withDiscount: number;
    withoutDiscount: number;
    discountPercentage: number;
  };
  description: string;
  keywords: string[];
  stock: { type: string; quantity: number }[];
  path: string;
};

const STOP_WORDS = new Set([
  "saya",
  "aku",
  "mau",
  "minta",
  "cari",
  "cariin",
  "carikan",
  "tolong",
  "bisa",
  "ada",
  "yang",
  "untuk",
  "dengan",
  "dan",
  "atau",
  "di",
  "ke",
  "dari",
  "ini",
  "itu",
  "ya",
  "dong",
  "deh",
  "sih",
  "nih",
  "kah",
  "lah",
  "produk",
  "barang",
  "rekomendasi",
  "rekomendasikan",
  "i",
  "want",
  "need",
  "find",
  "looking",
  "for",
  "can",
  "you",
  "please",
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "have",
  "has",
]);

const QUERY_SYNONYMS: Record<string, string[]> = {
  pria: ["men", "men's", "male", "mens"],
  cowok: ["men", "men's", "male", "mens"],
  laki: ["men", "men's", "male", "mens"],
  wanita: ["women", "women's", "female", "womens"],
  perempuan: ["women", "women's", "female", "womens"],
  cewek: ["women", "women's", "female", "womens"],
  anak: ["kids", "kid", "children", "baby"],
  jaket: ["jacket", "outerwear", "leather", "winter"],
  sepatu: ["shoes", "shoe", "sneakers", "boots", "footwear"],
  baju: ["shirt", "t-shirt", "hoodie", "dress", "clothing", "fashion"],
  kaos: ["t-shirt", "shirt", "tee"],
  tas: ["bag", "backpack", "handbag"],
  topi: ["hat", "cap", "headwear"],
  jam: ["watch"],
  kosmetik: ["cosmetics", "makeup", "beauty"],
  olahraga: ["sports", "sport", "fitness", "athletic"],
  komputer: ["computer", "computers", "laptop", "keyboard", "mouse"],
  mainan: ["toy", "toys", "kids"],
  rumah: ["home", "garden", "decor"],
  buku: ["book", "books"],
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string) =>
  normalize(value)
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

const expandTokens = (tokens: string[]) => [
  ...new Set(tokens.flatMap((token) => [token, ...(QUERY_SYNONYMS[token] ?? [])])),
];

const productToContext = (product: (typeof products)[number]): ProductContext => ({
  product_id: product.product_id,
  title: product.title,
  category: product.category,
  price: product.price,
  description: product.description,
  keywords: product.keywords,
  stock: product.stock,
  path: `/product/${product.product_id}/${createSlug(product.title)}`,
});

const scoreProduct = (
  product: (typeof products)[number],
  queryTokens: string[],
  expandedTokens: string[],
) => {
  const title = normalize(product.title);
  const category = normalize(product.category);
  const keywords = normalize(product.keywords.join(" "));
  const description = normalize(product.description);
  const haystack = `${title} ${category} ${keywords} ${description}`;

  let score = 0;
  for (const token of expandedTokens) {
    if (title.includes(token)) score += 8;
    if (keywords.includes(token)) score += 6;
    if (category.includes(token)) score += 5;
    if (description.includes(token)) score += 2;
  }

  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 3;
  }

  if (queryTokens.some((token) => ["murah", "termurah"].includes(token))) {
    score += Math.max(0, 1000 - product.price.withDiscount) / 1000;
  }

  if (queryTokens.some((token) => ["diskon", "promo", "sale"].includes(token))) {
    score += product.price.discountPercentage / 10;
  }

  return score;
};

export async function getRelevantProducts(
  query: string,
): Promise<ProductContext[]> {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const expandedTokens = expandTokens(queryTokens);

  return products
    .map((product) => ({
      product,
      score: scoreProduct(product, queryTokens, expandedTokens),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.product.performance.sales - a.product.performance.sales;
    })
    .slice(0, 8)
    .map(({ product }) => productToContext(product));
}
