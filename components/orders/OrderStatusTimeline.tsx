import type { OrderStatus } from "@/types/order";
import { getStepIndex, ORDER_STATUS_STEPS } from "@/utils/order";

type Props = { status: OrderStatus };

export function OrderStatusTimeline({ status }: Props) {
  const currentStep = getStepIndex(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-4">
        <p className="text-sm font-semibold text-red-600">
          ❌ Pesanan Dibatalkan
        </p>
        <p className="mt-1 text-xs text-red-400">
          Pesanan ini telah dibatalkan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <h2 className="mb-6 text-sm font-semibold text-gray-700">
        Status Pesanan
      </h2>
      <div className="flex items-center">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isDone = index <= currentStep;
          const isActive = index === currentStep;
          const isLast = index === ORDER_STATUS_STEPS.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all
                  ${
                    isDone
                      ? "bg-green-500 text-white shadow-md shadow-green-100"
                      : "bg-gray-100 text-gray-400"
                  } ${isActive ? "ring-4 ring-green-100" : ""}`}
                >
                  {isDone ? "✓" : step.icon}
                </div>
                <span
                  className={`text-center text-xs font-medium ${
                    isDone ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`mx-1 mb-5 h-0.5 flex-1 transition-all ${
                    index < currentStep ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
