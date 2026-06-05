import { CategoryIcon } from "@/components/icon";
import type { Category } from "@/lib/db/categories";
import { createSlug } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const CategoryCard = ({ category }: { category: Category }) => {
  const id = category.category_id;
  const slug = createSlug(category.title);

  return (
    <Link
      href={`/categories/${id}/${slug}`}
      className="inline-block p-2 md:p-3 rounded-lg bg-white text-black border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <CategoryIcon size={20} color="black" />
        <span className="capitalize">{category.title}</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
