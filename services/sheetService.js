
// Load config from local storage
const getScriptConfig = () => {
  const saved = localStorage.getItem('smart-ledger-script-config');
  return saved ? JSON.parse(saved) : null;
};

const saveScriptConfig = (config) => {
  localStorage.setItem('smart-ledger-script-config', JSON.stringify(config));
};

const appendToSheet = async (expenses) => {
  const config = getScriptConfig();
  if (!config || !config.scriptUrl) {
    throw new Error("尚未設定 Google Apps Script 網址");
  }

  // Use text/plain to avoid CORS preflight issues with GAS
  const response = await fetch(config.scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8", 
    },
    body: JSON.stringify({
      action: "add",
      data: expenses
    })
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || "寫入失敗");
  }

  return result;
};

const checkSheetConnection = async (url) => {
    if (!url) throw new Error("網址不得為空");
    
    // Test connection with a simple ping
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "test" })
    });
    
    if(!response.ok) throw new Error("連線失敗 (HTTP Error)");
    
    const result = await response.json();
    if(result.status !== 'success') throw new Error(result.message || "連線測試失敗");
    
    return true;
}

window.getScriptConfig = getScriptConfig;
window.saveScriptConfig = saveScriptConfig;
window.appendToSheet = appendToSheet;
window.checkSheetConnection = checkSheetConnection;
