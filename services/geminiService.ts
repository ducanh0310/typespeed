
import { GoogleGenAI } from "@google/genai";
import { type GroundingChunk } from "../types";

// Assume process.env.API_KEY is available in the environment
const API_KEY = "AIzaSyAyUy70cDKLNOTyxnSLHO8mWYWtHAcn0mg";

if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const fetchLyrics = async (songTitle: string): Promise<{ lyrics: string; sources: GroundingChunk[] }> => {
  if (!API_KEY) {
    throw new Error("API Key not configured. Please set the API_KEY environment variable.");
  }

  const model = "gemini-2.5-flash";
  // A system instruction provides context and rules for the AI, making the request more robust.
  const systemInstruction = "Bạn là một trợ lý tìm lời bài hát. Nhiệm vụ của bạn là tìm lời bài hát chính xác cho một bài hát và trả về chúng dưới dạng văn bản thuần túy. Loại bỏ tất cả các tiêu đề, tên nghệ sĩ và các nhãn cấu trúc như '[Điệp khúc]' hoặc '[Câu hát]'. Chỉ trả về lời bài hát.";
  // The user prompt is now simpler, focusing only on the specific request.
  const prompt = `Lời bài hát cho bài "${songTitle}". Output trả về chỉ lấy lời bài hát, không thêm thắt bất kỳ câu dẫn nào của bạn`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const lyrics = response.text;
    if (!lyrics) {
      throw new Error("Không tìm thấy lời bài hát. Vui lòng thử một bài hát khác.");
    }

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    // The model should be better at cleaning the text now, but a simple backup cleanup is fine.
    const cleanedLyrics = lyrics.replace(/^(Lyrics|Lời bài hát)\s*:\s*\n/i, "").trim();

    return { lyrics: cleanedLyrics, sources };
  } catch (error) {
    console.error("Error fetching lyrics from Gemini API:", error);
    // Re-throw a user-friendly error. The 500 error suggests a server-side issue.
    // We provide a more informative message to the user.
    throw new Error("Đã xảy ra lỗi khi tìm kiếm lời bài hát. Dịch vụ có thể đang tạm thời không khả dụng. Vui lòng thử lại sau.");
  }
};
