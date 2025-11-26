
// Get globals
const { Category } = window;

const guessCategory = (merchant, description) => {
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
const getMockInvoices = () => {
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

const fetchCarrierInvoices = async (
  cardId, 
  cardEncrypt, 
  appId, 
  isTestMode = true
) => {
  
  if (isTestMode) {
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockInvoices();
  }

  // 真實 API 呼叫邏輯
  const API_URL = "https://api.einvoice.nat.gov.tw/PB2CAPIVAN/invapp/InvApp";
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 查詢過去 30 天
  const endDate = new Date();
  
  const formatDate = (d) => `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;

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

    const invoices = (data.details || []).map((inv) => {
        const dateStr = `${inv.invDate.year + 1911}-${inv.invDate.month.toString().padStart(2, '0')}-${inv.invDate.date.toString().padStart(2, '0')}`;
        const desc = inv.invDetail?.map((d) => d.description).join('、') || "電子發票消費";
        
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

window.fetchCarrierInvoices = fetchCarrierInvoices;
