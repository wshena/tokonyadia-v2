"use client";

import dynamic from "next/dynamic";
import { CategoryIcon } from "@/components/icon";
import { useUtilityStore } from "@/lib/zustand/utilityStore";

const CategoryListModal = dynamic(() => import("../modals/CategoryListModal"));

const CategoryModalButton = () => {
  const openModal = useUtilityStore((state) => state.openModal);

  return (
    <button
      type="button"
      onClick={() => openModal(<CategoryListModal />)}
      className="p-2 md:p-3 rounded-lg bg-white text-black border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <CategoryIcon size={20} color="black" />
        <span className="capitalize">kategori</span>
      </div>
    </button>
  );
};

export default CategoryModalButton;
