
import { GoogleGenAI, Type } from "@google/genai";

// Helper to get API key
const getApiKey = () => {
    // Use window.process to allow safe access in browser environment
    const envKey = window.process?.env?.API_KEY;
    return localStorage.getItem('smart-ledger-api-key') || envKey;
};

// Get globals
const { Category } = window;

// Helper to convert file to base64
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const analyzeReceiptImage = async (base64Data, mimeType) => {
  const apiKey = getApiKey();
  if (!apiKey) {
      throw new Error("請先至設定頁面輸入 Gemini API Key");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.5-flash"; // Efficient for multimodal tasks

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this image (receipt or invoice). Extract the transaction details. If there are multiple distinct items that clearly belong to different categories, separate them. Otherwise, group them into a single transaction. Return the data in Traditional Chinese."
          }
        ]
      },
      config: {
        systemInstruction: `You are an expert accountant assistant. Your job is to extract expense data from images of receipts, invoices, or handwritten notes. 
        Always date the transaction. If the year is missing, assume the current year. 
        Categorize strictly into one of these: '飲食', '交通', '購物', '娛樂', '居家', '醫療', '教育', '其他'.
        Return an empty list if no valid expense data is found.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
              amount: { type: Type.STRING, description: "The cost as a string number" },
              category: { 
                type: Type.STRING, 
                enum: Object.values(Category),
                description: "The category of the expense" 
              },
              description: { type: Type.STRING, description: "Brief description of the item(s)" },
              merchant: { type: Type.STRING, description: "Name of the store or payee" }
            },
            required: ["date", "amount", "category", "description", "merchant"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    throw new Error(error.message || "無法辨識圖片，請重試或手動輸入。");
  }
};

const parseInvoiceText = async (textInput) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("請先至設定頁面輸入 Gemini API Key");
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash";
    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [{ text: `Parse the following text into expense records: "${textInput}"` }]
            },
            config: {
                systemInstruction: `You are an accountant. Parse the unstructured text into expense records.
                Categorize strictly into one of these: '飲食', '交通', '購物', '娛樂', '居家', '醫療', '教育', '其他'.
                If date is missing, use today's date (YYYY-MM-DD). Return Traditional Chinese.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
                            amount: { type: Type.STRING, description: "The cost as a string number" },
                            category: { 
                                type: Type.STRING, 
                                enum: Object.values(Category),
                            },
                            description: { type: Type.STRING },
                            merchant: { type: Type.STRING }
                        },
                        required: ["date", "amount", "category", "description", "merchant"]
                    }
                }
            }
        });
         const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (error) {
        console.error("Error parsing text:", error);
        throw new Error(error.message || "無法解析文字內容。");
    }
}

// Expose globals
window.fileToGenerativePart = fileToGenerativePart;
window.analyzeReceiptImage = analyzeReceiptImage;
window.parseInvoiceText = parseInvoiceText;
