
import React, { useState, useEffect } from 'react';
import { getScriptConfig, saveScriptConfig, checkSheetConnection } from '../services/sheetService';
import { Save, ArrowLeft, ExternalLink, CheckCircle, AlertCircle, Loader2, Code, Copy } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const config = getScriptConfig();
    if (config) {
      setScriptUrl(config.scriptUrl);
    }
  }, []);

  const handleSave = async () => {
    if (!scriptUrl) {
      setStatus('error');
      setStatusMsg("請輸入 App Script 網址");
      return;
    }

    setStatus('loading');
    
    try {
      // Test connection
      await checkSheetConnection(scriptUrl);
      
      // Save
      saveScriptConfig({ scriptUrl });
      
      setStatus('success');
      setStatusMsg("連線成功！設定已儲存");
    } catch (e: any) {
      setStatus('error');
      setStatusMsg(e.message || "連線失敗，請檢查網址是否正確");
    }
  };

  return (
    <div className="bg-white min-h-[80vh] rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] p-6 relative animate-in slide-in-from-bottom-10 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">後端連結設定</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
          <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
            <Code size={16} /> 設定說明
          </h3>
          <ol className="list-decimal list-inside text-xs text-emerald-700 space-y-2 opacity-90 leading-relaxed">
            <li>在 Google Sheet 中點選 <strong>擴充功能 &gt; Apps Script</strong>。</li>
            <li>將後端程式碼貼上 (請參考文件)，並存檔。</li>
            <li>點擊右上角 <strong>部署 &gt; 新增部署作業</strong>。</li>
            <li>類型選 <strong>網頁應用程式</strong>。</li>
            <li>執行身分選 <strong>我 (Me)</strong>。</li>
            <li>誰可以存取選 <strong>所有人 (Anyone)</strong> <span className="text-red-500 font-bold">*重要</span>。</li>
            <li>複製產生的網址並貼在下方。</li>
          </ol>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">App Script 網頁應用程式網址</label>
          <input
            type="text"
            value={scriptUrl}
            onChange={(e) => setScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors break-all"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle size={18} />
            {statusMsg}
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg">
            <CheckCircle size={18} />
            {statusMsg}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={status === 'loading'}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {status === 'loading' ? (
                <>
                    <Loader2 size={20} className="animate-spin" /> 測試連線中...
                </>
            ) : (
                <>
                    <Save size={20} /> 儲存設定
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};