"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OptionIcon } from "@/components/icon";
import {
  getDigitalServicesByCategory,
  type DigitalService,
  type DigitalServiceCategory,
} from "@/lib/data/digitalServices";
import { useUtilityStore } from "@/lib/zustand/utilityStore";

const categoryLabels: Record<
  DigitalServiceCategory,
  { title: string; description: string }
> = {
  topup: {
    title: "Top Up",
    description: "Pulsa, data, token listrik, hingga voucher digital.",
  },
  tagihan: {
    title: "Tagihan",
    description: "Listrik, PDAM, internet, BPJS, dan pembayaran rutin lainnya.",
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const visibleOptionLimit = 5;

const getInitialFieldValues = (service: DigitalService) =>
  service.fields.reduce<Record<string, string>>((result, field) => {
    result[field.id] =
      field.type === "select" ? (field.options?.[0] ?? "") : "";
    return result;
  }, {});

const getInitialService = (category: DigitalServiceCategory) =>
  getDigitalServicesByCategory(category)[0];

const DigitalProductTabs = () => {
  const router = useRouter();
  const setAlert = useUtilityStore((state) => state.setAlert);
  const initialService = getInitialService("topup");
  const [activeCategory, setActiveCategory] =
    useState<DigitalServiceCategory>("topup");
  const [activeServiceId, setActiveServiceId] = useState(
    initialService?.id ?? "",
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    initialService ? getInitialFieldValues(initialService) : {},
  );
  const [selectedNominal, setSelectedNominal] = useState(
    initialService?.nominalOptions[0]?.value ?? "",
  );
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement | null>(null);

  const services = useMemo(
    () => getDigitalServicesByCategory(activeCategory),
    [activeCategory],
  );
  const activeService = useMemo<DigitalService | undefined>(
    () =>
      services.find((service) => service.id === activeServiceId) ?? services[0],
    [activeServiceId, services],
  );
  const selectedNominalOption = activeService?.nominalOptions.find(
    (item) => item.value === selectedNominal,
  );
  const visibleServices = services.slice(0, visibleOptionLimit);
  const hiddenServices = services.slice(visibleOptionLimit);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!moreOptionsRef.current?.contains(event.target as Node)) {
        setIsMoreOptionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeService) return null;

  const selectService = (service: DigitalService) => {
    setActiveServiceId(service.id);
    setSelectedNominal(service.nominalOptions[0]?.value ?? "");
    setFieldValues(getInitialFieldValues(service));
    setIsMoreOptionsOpen(false);
  };

  const selectCategory = (category: DigitalServiceCategory) => {
    const nextService = getInitialService(category);
    setActiveCategory(category);
    if (nextService) selectService(nextService);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const handleSubmit = () => {
    const emptyField = activeService.fields.find(
      (field) => !fieldValues[field.id]?.trim(),
    );

    if (emptyField) {
      setAlert({ label: `${emptyField.label} wajib diisi`, type: "error" });
      return;
    }

    if (!selectedNominalOption) {
      setAlert({ label: "Pilih nominal terlebih dahulu", type: "error" });
      return;
    }

    const payload = {
      serviceId: activeService.id,
      category: activeCategory,
      serviceLabel: activeService.label,
      actionLabel: activeService.actionLabel,
      description: activeService.description,
      summaryLabel: activeService.summaryLabel,
      price: selectedNominalOption.price,
      nominalLabel: selectedNominalOption.label,
      fieldValues,
    };

    router.push(
      `/payment/digital?data=${encodeURIComponent(JSON.stringify(payload))}`,
    );
  };

  return (
    <section className="rounded-md border border-gray-200 bg-white p-3 shadow-sm md:p-7">
      {/* header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-green-600">
            Digital Service
          </span>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
            Top Up dan Tagihan dalam satu tempat
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
            Pilih layanan, isi data pelanggan, lalu lanjut ke halaman pembayaran
            seperti alur checkout produk.
          </p>
        </div>
        <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Lebih dari 15 opsi layanan tersedia untuk kebutuhan harian.
        </div>
      </div>

      {/* tab services select - top up / tagihan */}
      <div className="mt-6 flex gap-3 rounded-2xl bg-gray-100 p-2">
        {(Object.keys(categoryLabels) as DigitalServiceCategory[]).map(
          (category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={`flex-1 rounded-2xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <p className="font-semibold">
                  {categoryLabels[category].title}
                </p>
                <p className="hidden md:inline-block mt-1 text-sm">
                  {categoryLabels[category].description}
                </p>
              </button>
            );
          },
        )}
      </div>

      {/* options select */}
      <div className="mt-6 flex w-full flex-nowrap items-center gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
        {services.map((service) => {
          const isActive = activeService.id === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => selectService(service)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors md:hidden ${
                isActive
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {service.label}
            </button>
          );
        })}

        {visibleServices.map((service) => {
          const isActive = activeService.id === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => selectService(service)}
              className={`hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors md:inline-flex ${
                isActive
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {service.label}
            </button>
          );
        })}

        {hiddenServices.length > 0 && (
          <div ref={moreOptionsRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setIsMoreOptionsOpen((current) => !current)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-300 hover:text-green-700"
            >
              <OptionIcon size={16} color="currentColor" />
              Opsi lain
            </button>

            {isMoreOptionsOpen && (
              <div className="absolute left-0 top-[calc(100%+0.75rem)] z-20 min-w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                {hiddenServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => selectService(service)}
                    className="flex w-full flex-col rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-900">
                      {service.label}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      {service.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-5">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-900">
              {activeService.formTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {activeService.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activeService.fields.map((field) => (
              <label
                key={field.id}
                className="flex flex-col gap-2 text-sm font-medium text-gray-700"
              >
                {field.label}
                {field.type === "select" ? (
                  <select
                    value={fieldValues[field.id] ?? ""}
                    onChange={(event) =>
                      handleFieldChange(field.id, event.target.value)
                    }
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500"
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fieldValues[field.id] ?? ""}
                    onChange={(event) =>
                      handleFieldChange(field.id, event.target.value)
                    }
                    placeholder={field.placeholder}
                    inputMode={field.inputMode}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-500"
                  />
                )}
              </label>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Pilih nominal
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {activeService.nominalOptions.map((option) => {
                const isSelected = selectedNominal === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedNominal(option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                      isSelected
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:text-green-700"
                    }`}
                  >
                    <p className="text-sm">Nominal</p>
                    <p className="mt-1 text-base font-semibold">
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-md border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h3 className="text-xl font-semibold text-gray-900">Ringkasan</h3>
          <div className="mt-5 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Kategori</span>
              <span className="font-medium text-gray-900">
                {categoryLabels[activeCategory].title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Layanan</span>
              <span className="font-medium text-gray-900">
                {activeService.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{activeService.summaryLabel}</span>
              <span className="max-w-37.5 truncate text-right font-medium text-gray-900">
                {fieldValues[
                  activeService.fields[activeService.fields.length - 1]?.id
                ] || "-"}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span className="text-green-600">
                  {selectedNominalOption
                    ? formatCurrency(selectedNominalOption.price)
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
            Lanjutkan ke halaman pembayaran untuk menyelesaikan proses{" "}
            {activeCategory === "topup" ? "top up" : "tagihan"} ini.
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-6 w-full rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700"
          >
            {activeService.actionLabel} Sekarang
          </button>
        </aside>
      </div>
    </section>
  );
};

export default DigitalProductTabs;
