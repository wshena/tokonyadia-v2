import {
  getRelevantProducts,
  type ProductContext,
} from "@/lib/ai/getRevelantProducts";
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildSystemPrompt(products: ProductContext[], currentPath?: string) {
  const productList = products
    .map((p) => {
      const price = p.price?.withDiscount ?? p.price?.withoutDiscount;
      const currency = p.price?.currency ?? "";
      const productUrl = p.path ?? `/product/${p.product_id}`;

      return `- ${p.title} | Kategori: ${p.category} | Harga: ${currency}${price} | Diskon: ${p.price?.discountPercentage ?? 0}% | URL: ${productUrl} | Stok: ${p.stock.map((stock) => `${stock.type}(${stock.quantity})`).join(", ")}`;
    })
    .join("\n");

  return `Kamu adalah asisten belanja Tokonyadia yang ramah, helpful, dan ringkas.
Tokonyadia adalah platform e-commerce yang menjual fashion, aksesoris, sepatu, olahraga, kosmetik, dan produk digital.

${currentPath ? `User sedang berada di halaman: ${currentPath}` : ""}

Produk yang relevan dengan pertanyaan user:
${productList || "Tidak ada produk spesifik yang ditemukan."}

Panduan menjawab:
- Jawab dalam bahasa yang sama dengan user (Indonesia atau Inggris)
- Rekomendasikan hanya produk dari list di atas; jangan rekomendasikan item di luar list
- Format setiap rekomendasi sebagai markdown link: [Nama Produk](/product/id/slug) - harga
- Jika ditanya produk yang tidak ada di list, katakan tidak tersedia saat ini
- Jangan membuat-buat produk yang tidak ada di list
- Jawaban singkat dan to the point, maksimal 3-4 kalimat
- Jika user hanya sapa atau tanya hal umum, jawab ramah tanpa perlu sebut produk`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, currentPath } = (await req.json()) as {
      messages: Message[];
      currentPath?: string;
    };

    if (!messages?.length) {
      return new Response("Messages kosong", { status: 400 });
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.parts[0]?.text ??
      "";

    const relevantProducts = await getRelevantProducts(lastUserMessage);

    // ✅ SDK baru: generateContentStream langsung di ai.models
    // systemInstruction masuk ke config, bukan parameter terpisah
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: messages,
      config: {
        systemInstruction: buildSystemPrompt(relevantProducts, currentPath),
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result) {
            // ✅ SDK baru: chunk.text adalah property, bukan method
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[AI Assistant]", error);
    return new Response("Gagal memproses permintaan", { status: 500 });
  }
}
