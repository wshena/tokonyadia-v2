import type { SupabaseClient } from "@supabase/supabase-js";

export type DigitalTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface DigitalTransaction {
  id: string;
  user_id: string;
  service_id: string;
  category: "topup" | "tagihan";
  service_label: string;
  price: number;
  nominal_label?: string;
  payment_method?: string;
  field_values: Record<string, string>;
  status: DigitalTransactionStatus;
  transaction_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDigitalTransactionPayload {
  serviceId: string;
  category: "topup" | "tagihan";
  serviceLabel: string;
  price: number;
  nominalLabel?: string;
  paymentMethod?: string;
  fieldValues: Record<string, string>;
  status?: DigitalTransactionStatus;
  transactionNotes?: string;
}

/**
 * Create a new digital transaction
 */
export const createDigitalTransaction = async (
  supabase: SupabaseClient,
  userId: string,
  payload: CreateDigitalTransactionPayload,
) => {
  const { data, error } = await supabase
    .from("digital_transactions")
    .insert({
      user_id: userId,
      service_id: payload.serviceId,
      category: payload.category,
      service_label: payload.serviceLabel,
      price: payload.price,
      nominal_label: payload.nominalLabel,
      payment_method: payload.paymentMethod,
      field_values: payload.fieldValues,
      status: payload.status || "completed",
      transaction_notes: payload.transactionNotes,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating digital transaction:", error.message);
    throw new Error(error.message);
  }

  return data as DigitalTransaction;
};

/**
 * Get all digital transactions for a user
 */
export const getUserDigitalTransactions = async (
  supabase: SupabaseClient,
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    category?: "topup" | "tagihan";
    status?: DigitalTransactionStatus;
  },
) => {
  let query = supabase
    .from("digital_transactions")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  query = query.order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching digital transactions:", error.message);
    throw new Error(error.message);
  }

  return {
    data: data as DigitalTransaction[],
    count: count ?? 0,
  };
};

/**
 * Get a single digital transaction by ID
 */
export const getDigitalTransactionById = async (
  supabase: SupabaseClient,
  transactionId: string,
  userId?: string,
) => {
  let query = supabase
    .from("digital_transactions")
    .select("*")
    .eq("id", transactionId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching digital transaction:", error.message);
    throw new Error(error.message);
  }

  return data as DigitalTransaction;
};

/**
 * Update a digital transaction
 */
export const updateDigitalTransaction = async (
  supabase: SupabaseClient,
  transactionId: string,
  userId: string,
  updates: Partial<CreateDigitalTransactionPayload> & {
    status?: DigitalTransactionStatus;
  },
) => {
  const updatePayload: Record<string, any> = {};

  if (updates.serviceId) updatePayload.service_id = updates.serviceId;
  if (updates.serviceLabel) updatePayload.service_label = updates.serviceLabel;
  if (updates.price !== undefined) updatePayload.price = updates.price;
  if (updates.nominalLabel) updatePayload.nominal_label = updates.nominalLabel;
  if (updates.paymentMethod)
    updatePayload.payment_method = updates.paymentMethod;
  if (updates.fieldValues) updatePayload.field_values = updates.fieldValues;
  if (updates.status) updatePayload.status = updates.status;
  if (updates.transactionNotes)
    updatePayload.transaction_notes = updates.transactionNotes;

  const { data, error } = await supabase
    .from("digital_transactions")
    .update({
      ...updatePayload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating digital transaction:", error.message);
    throw new Error(error.message);
  }

  return data as DigitalTransaction;
};

/**
 * Delete a digital transaction
 */
export const deleteDigitalTransaction = async (
  supabase: SupabaseClient,
  transactionId: string,
  userId: string,
) => {
  const { error } = await supabase
    .from("digital_transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting digital transaction:", error.message);
    throw new Error(error.message);
  }

  return true;
};

/**
 * Get statistics for user digital transactions
 */
export const getDigitalTransactionStats = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("digital_transactions")
    .select("category, price, status")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching transaction stats:", error.message);
    throw new Error(error.message);
  }

  const stats = {
    totalTransactions: data.length,
    totalSpent: data.reduce((sum, tx) => sum + tx.price, 0),
    topup: {
      count: data.filter((tx) => tx.category === "topup").length,
      total: data
        .filter((tx) => tx.category === "topup")
        .reduce((sum, tx) => sum + tx.price, 0),
    },
    tagihan: {
      count: data.filter((tx) => tx.category === "tagihan").length,
      total: data
        .filter((tx) => tx.category === "tagihan")
        .reduce((sum, tx) => sum + tx.price, 0),
    },
  };

  return stats;
};
