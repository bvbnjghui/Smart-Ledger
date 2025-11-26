
import { Category, ExpenseDraft } from "../types";

// 模擬財政部 API 回傳的資料結構簡化版
interface MofInvoice {
  invNum: string;
  cardType: string;
  cardNo: string;
  sellerName: string;
  invStatus: string;
  invDonatable: string;
  amount: string;
  invPeriod: string;
  invDate: {
    year: number;
    month: number;
    date: number;
  };
  sellerAddress: string;
  sellerBan: string;
  invDetail: {
    rowNum: string;
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
  }[];
}

const guessCategory = (merchant: string, description: string): Category => {
  const m = merchant.toLowerCase();
  const d = description.toLowerCase();

  if (m.includes('7-eleven') || m.includes('全家') || m.includes('萊爾富') || m.includes('ok mart') || m.includes('星巴克') || m.includes('路易莎') || m.includes('餐飲') || m.includes('食品') || d.includes('茶') || d.includes('咖啡') || d.includes('便當')) {
    return Category.FOOD;
  }
  if (m.includes('中油') || m.includes('台亞') || m.includes('全國加油站') || m.includes('台鐵') || m.includes('高鐵') || m.includes('捷運') || m.includes('客運') || m.includes('uber') || m.includes('車隊')) {
    return Category.TRANSPORT;
  }
  if (m.includes('全聯') || m.includes('家樂福') || m.includes('大潤發') || m.includes('好市多') || m.includes('屈臣氏') || m.includes('康是美') || m.includes('寶雅')) {
    return Category.HOUSING; // 歸類為居家/日用
  }
  if (m.includes('新光三越') || m.includes('sogo') || m.includes('百貨') || m.includes('uniqlo') || m.includes('zara') || m.includes('服飾')) {
    return Category.SHOPPING;
  }
  if (m.includes('電影') || m.includes('好樂迪') || m.includes('錢櫃') || m.includes('netflix') || m.includes('spotify') || m.includes('steam')) {
    return Category.ENTERTAINMENT;
  }
  if (m.includes('診所') || m.includes('醫院') || m.includes('藥局')) {
    return Category.MEDICAL;
  }
  
  return Category.OTHER;
};

// 產生模擬資料
const getMockInvoices = (): ExpenseDraft[] => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  return [
    {
      date: dateStr,
      amount: "155",
      merchant: "統一超商股份有限公司",
      description: "拿鐵咖啡、御飯糰",
      category: Category.FOOD
    },
    {
      date: dateStr,
      amount: "860",
      merchant: "全聯實業股份有限公司",
      description: "衛生紙、洗髮精、雞蛋",
      category: Category.HOUSING
    },
    {
      date: dateStr,
      amount: "1200",
      merchant: "台灣中油股份有限公司",
      description: "95無鉛汽油",
      category: Category.TRANSPORT
    }
  ];
};

export const fetchCarrierInvoices = async (
  cardId: string, 
  cardEncrypt: string, 
  appId: string, 
  isTestMode: boolean = true
): Promise<ExpenseDraft[]> => {
  
  if (isTestMode) {
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockInvoices();
  }

  // 真實 API 呼叫邏輯
  // 注意：瀏覽器端直接呼叫財政部 API 通常會遇到 CORS 問題，建議在後端 Server 處理
  // 這裡僅提供實作範例結構
  
  const API_URL = "https://api.einvoice.nat.gov.tw/PB2CAPIVAN/invapp/InvApp";
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 查詢過去 30 天
  const endDate = new Date();
  
  const formatDate = (d: Date) => `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;

  const params = new URLSearchParams();
  params.append("version", "0.5");
  params.append("action", "carrierInvChk");
  params.append("cardType", "3J0002"); // 手機條碼
  params.append("cardNo", cardId);
  params.append("cardEncrypt", cardEncrypt);
  params.append("appID", appId);
  params.append("startDate", formatDate(startDate));
  params.append("endDate", formatDate(endDate));
  params.append("onlyWinningInv", "N");
  params.append("uuid", "smart-ledger-ai-web");
  params.append("timeStamp", (Date.now() / 1000 + 10).toFixed(0));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.msg || "查詢失敗");
    }

    // 解析回傳資料
    // 注意：實際 API 回傳的 details 可能需要額外呼叫 invDetail 才能取得完整品項
    // 這裡假設 details 已包含或僅使用總金額與商家
    
    const invoices: ExpenseDraft[] = (data.details || []).map((inv: any) => {
        const dateStr = `${inv.invDate.year + 1911}-${inv.invDate.month.toString().padStart(2, '0')}-${inv.invDate.date.toString().padStart(2, '0')}`;
        const desc = inv.invDetail?.map((d: any) => d.description).join('、') || "電子發票消費";
        
        return {
            date: dateStr,
            amount: inv.amount,
            merchant: inv.sellerName,
            description: desc,
            category: guessCategory(inv.sellerName, desc)
        };
    });

    return invoices;

  } catch (error) {
    console.error("Mof API Error:", error);
    throw new Error("連線失敗，請檢查網路或改用測試模式 (CORS 限制)");
  }
};
