import CategoryCard from "@/components/ui/card/CategoryCard";
import ContentContainer from "@/components/ui/layouts/ContentContainer";
import { getAllCategories, type Category } from "@/lib/db/categories";
import React from "react";

// Get categories grouped by alphabet
export const getCategoriesGroupedByAlphabet = (categories: Category[]) => {
  const grouped = categories.reduce(
    (acc, category) => {
      const firstLetter = category.title[0].toUpperCase();

      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }

      acc[firstLetter].push(category);
      return acc;
    },
    {} as Record<string, typeof categories>,
  );

  // Sort key by alphabet (A, B, C, ...)
  const sorted = Object.keys(grouped)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = grouped[key];
        return acc;
      },
      {} as Record<string, typeof categories>,
    );

  return sorted;
};

const page = async () => {
  const { data: categories } = await getAllCategories();
  const groupedCategories = getCategoriesGroupedByAlphabet(categories);

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="flex flex-col gap-8">
          {Object.entries(groupedCategories).map(([letter, categories]) => (
            <div key={letter}>
              {/* Alphabet Header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-bold text-xl text-green-600">{letter}</h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Categories */}
              <ul className="flex flex-col md:flex-row flex-wrap gap-3">
                {categories.map((category) => (
                  <li key={category.category_id}>
                    <CategoryCard category={category} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ContentContainer>
    </main>
  );
};

export default page;
