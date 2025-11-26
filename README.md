# Smart Ledger AI

一個輕量級的智能記帳應用，使用 Alpine.js 構建，支援 AI 圖片辨識和 Google Sheets 同步。

## 🌟 特色功能

- 📊 **財務總覽** - 即時顯示總支出和本月支出統計
- 📝 **帳務明細** - 按日期分組的支出記錄列表
- ➕ **快速記帳** - 簡潔的手動輸入介面
- 🎨 **分類管理** - 8 種預設消費分類（飲食、交通、購物等）
- 💾 **本地儲存** - 使用 LocalStorage 自動保存資料
- 🔄 **雲端同步** - 可選的 Google Sheets 同步功能
- 🤖 **AI 辨識** - 支援 Gemini AI 圖片辨識（待實現）
- 📱 **響應式設計** - 完美適配手機和桌面裝置

## 🚀 快速開始

### 線上使用

直接訪問 GitHub Pages 部署版本：
**https://bvbnjghui.github.io/Smart-Ledger/**

### 本地運行

#### 方法 1：直接開啟（最簡單）
直接在瀏覽器中開啟 `index.html` 即可使用。

#### 方法 2：使用本地伺服器
```bash
# Python
python -m http.server 3000

# Node.js
npx serve

# PHP
php -S localhost:3000
```

然後訪問 `http://localhost:3000`

## 📦 技術棧

- **前端框架**：Alpine.js 3.x
- **樣式**：Tailwind CSS (CDN)
- **字體**：Noto Sans TC (Google Fonts)
- **資料儲存**：LocalStorage
- **部署**：GitHub Pages

## 🛠️ 專案結構

```
Smart-Ledger/
├── index.html          # 單一 HTML 檔案（包含所有代碼）
├── README.md           # 專案說明文件
├── .gitignore          # Git 忽略檔案
└── metadata.json       # 專案元資料
```

## ⚙️ 設定

### Gemini API Key（選用）

如需使用 AI 圖片辨識功能：

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey) 取得 API Key
2. 在應用程式中點擊右上角設定圖示
3. 輸入 API Key 並儲存

### Google Sheets 同步（選用）

如需同步資料到 Google Sheets：

1. 建立 Google Sheets 試算表
2. 點選「擴充功能」→「Apps Script」
3. 貼上後端程式碼（請參考專案文件）
4. 部署為「網頁應用程式」
5. 將產生的 URL 貼到應用程式設定頁面

## 📱 使用說明

### 新增支出

1. 點擊底部中央的 **+** 按鈕
2. 填寫日期、金額、類別、品項名稱
3. 選填商家資訊
4. 點擊「儲存」

### 查看明細

1. 點擊底部「明細」按鈕
2. 查看按日期分組的支出記錄
3. 點擊垃圾桶圖示可刪除記錄

### 查看統計

1. 點擊底部「總覽」按鈕
2. 查看總支出、本月支出
3. 查看各類別消費統計

## 🔧 開發

### 無需構建步驟

此專案使用 Alpine.js，無需任何構建工具或編譯步驟。直接編輯 `index.html` 即可。

### 部署到 GitHub Pages

```bash
git add index.html
git commit -m "Update application"
git push origin main
```

GitHub Pages 會自動部署更新。

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 聯絡

如有問題或建議，請開啟 Issue 討論。

---

**注意**：此應用使用 LocalStorage 儲存資料，請定期備份重要資料。
