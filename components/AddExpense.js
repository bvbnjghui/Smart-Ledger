
import React, { useState, useRef } from 'react';
import { Camera, Upload, Type, Save, X, Loader2, Sparkles, Plus, CloudDownload, QrCode } from 'lucide-react';

const AddExpense = ({ onSave, onCancel }) => {
  const { Category, analyzeReceiptImage, parseInvoiceText, fileToGenerativePart, fetchCarrierInvoices } = window; // Get globals

  const [mode, setMode] = useState('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drafts, setDrafts] = useState([{
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: Category.FOOD,
    description: '',
    merchant: ''
  }]);

  // Carrier State
  const [carrierId, setCarrierId] = useState('');
  const [carrierCode, setCarrierCode] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const base64 = await fileToGenerativePart(file);
      const results = await analyzeReceiptImage(base64, file.type);
      if (results.length > 0) {
        setDrafts(results);
        setMode('manual'); // Switch to manual view to review results
      } else {
        alert("未能識別出有效的帳務資訊，請重試。");
      }
    } catch (error) {
      alert("解析失敗: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextParse = async (text) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const results = await parseInvoiceText(text);
      if (results.length > 0) {
        setDrafts(results);
        setMode('manual');
      }
    } catch (error) {
      alert("解析失敗");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleCarrierImport = async () => {
    if (!isTestMode && (!carrierId || !carrierCode)) {
      alert("請輸入手機條碼與驗證碼");
      return;
    }

    setIsAnalyzing(true);
    try {
      const results = await fetchCarrierInvoices(carrierId, carrierCode, "EINV001", isTestMode);
      if (results.length > 0) {
        setDrafts(results);
        setMode('manual');
      } else {
        alert("查無資料或發生錯誤");
      }
    } catch (error) {
       alert("載具匯入失敗: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAll = () => {
    // Validate
    const validDrafts = drafts.filter(d => d.amount && !isNaN(parseFloat(d.amount)) && d.description);
    if (validDrafts.length === 0) {
      alert("請至少填寫一筆完整的支出資料（需包含金額與描述）");
      return;
    }
    onSave(validDrafts);
  };

  const updateDraft = (index, field, value) => {
    const newDrafts = [...drafts];
    newDrafts[index] = { ...newDrafts[index], [field]: value };
    setDrafts(newDrafts);
  };

  const removeDraft = (index) => {
    setDrafts(drafts.filter((_, i) => i !== index));
  };

  const addEmptyDraft = () => {
      setDrafts([...drafts, {
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: Category.OTHER,
        description: '',
        merchant: ''
      }]);
  }

  return (
    <div className="bg-white min-h-[80vh] rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] p-6 relative animate-in slide-in-from-bottom-10 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">新增支出</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <X size={24} />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${mode === 'manual' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          手動/檢視
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${mode === 'scan' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Camera size={16} /> 掃描
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${mode === 'text' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Type size={16} /> 文字
        </button>
        <button
          onClick={() => setMode('carrier')}
          className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${mode === 'carrier' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CloudDownload size={16} /> 載具
        </button>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="font-medium animate-pulse">正在處理您的資料...</p>
          <p className="text-sm text-gray-400 mt-2">智慧分析金額、分類與商家中</p>
        </div>
      ) : (
        <>
          {mode === 'scan' && (
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                <Sparkles size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">上傳發票或收據</h3>
                <p className="text-gray-500 text-sm mt-1">AI 自動辨識金額與分類</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200"
              >
                <Upload size={20} />
                選擇圖片 / 拍照
              </button>
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-4">
                 <textarea 
                    className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700"
                    placeholder="請貼上發票文字內容、簡訊或是任何記帳筆記..."
                    id="invoice-text-input"
                 ></textarea>
                 <button
                    onClick={() => {
                        const el = document.getElementById('invoice-text-input');
                        handleTextParse(el.value);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-200"
                 >
                    開始解析
                 </button>
            </div>
          )}

          {mode === 'carrier' && (
            <div className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-purple-700 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                             <QrCode size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold">財政部雲端發票匯入</h3>
                            <p className="text-xs text-purple-600 opacity-80">自動同步手機條碼載具的消費</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div>
                            <label className="block text-xs font-medium text-purple-900 mb-1">手機條碼 (Card ID)</label>
                            <input
                                type="text"
                                placeholder="/ABC1234"
                                value={carrierId}
                                onChange={(e) => setCarrierId(e.target.value)}
                                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-purple-900 mb-1">驗證碼 (Verification Code)</label>
                            <input
                                type="password"
                                placeholder="財政部平台驗證碼"
                                value={carrierCode}
                                onChange={(e) => setCarrierCode(e.target.value)}
                                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 py-1">
                        <button 
                            type="button" 
                            onClick={() => setIsTestMode(!isTestMode)}
                            className={`w-10 h-6 rounded-full p-1 transition-colors ${isTestMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isTestMode ? 'translate-x-4' : ''}`} />
                        </button>
                        <span className="text-xs text-gray-600">開啟測試模式 (Mock Data)</span>
                    </div>
                    
                    <button
                        onClick={handleCarrierImport}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                    >
                        <CloudDownload size={20} />
                        同步發票資料
                    </button>
                </div>
                <div className="text-xs text-gray-400 text-center px-4">
                    注意：若無真實 API 金鑰或因瀏覽器安全限制 (CORS)，請使用測試模式體驗功能。
                </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-6 pb-20">
              {drafts.map((draft, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                  {drafts.length > 1 && (
                      <button onClick={() => removeDraft(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                          <X size={16} />
                      </button>
                  )}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">日期</label>
                      <input
                        type="date"
                        value={draft.date}
                        onChange={(e) => updateDraft(idx, 'date', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">金額</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={draft.amount}
                        onChange={(e) => updateDraft(idx, 'amount', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">類別</label>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.values(Category).map(cat => (
                            <button
                                key={cat}
                                onClick={() => updateDraft(idx, 'category', cat)}
                                className={`text-xs py-1.5 px-1 rounded-md border transition-all truncate ${draft.category === cat ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">品項名稱</label>
                        <input
                            type="text"
                            placeholder="例如：午餐、捷運"
                            value={draft.description}
                            onChange={(e) => updateDraft(idx, 'description', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                     <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">商家 (選填)</label>
                        <input
                            type="text"
                            placeholder="例如：7-11"
                            value={draft.merchant || ''}
                            onChange={(e) => updateDraft(idx, 'merchant', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-3">
                <button onClick={addEmptyDraft} className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    <Plus size={18} /> 新增一筆
                </button>
                <button
                    onClick={handleSaveAll}
                    className="flex-[2] bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Save size={20} /> 儲存 ({drafts.length})
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

window.AddExpense = AddExpense;
