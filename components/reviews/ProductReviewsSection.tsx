import { StartIcon } from "@/components/icon";
import type { ProductReview, ProductReviewSummary } from "@/lib/db/reviews";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const renderStars = (value: number) =>
  Array.from({ length: 5 }, (_, index) => {
    const filled = index < value;

    return (
      <StartIcon
        key={`${value}-${index}`}
        size={16}
        className={filled ? "text-amber-400" : "text-gray-200"}
      />
    );
  });

const ProductReviewsSection = ({
  reviews,
  summary,
}: {
  reviews: ProductReview[];
  summary: ProductReviewSummary;
}) => {
  return (
    <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
            Review Produk
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Pendapat pembeli setelah pesanan sampai
          </h2>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {summary.reviewCount > 0
                ? summary.averageRating.toFixed(1)
                : "0.0"}
            </span>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(summary.averageRating))}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {summary.reviewCount} review terverifikasi
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          Belum ada review untuk produk ini. Review akan muncul setelah pembeli
          menerima pesanan.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.user_display_name}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {renderStars(review.rate)}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviewsSection;
