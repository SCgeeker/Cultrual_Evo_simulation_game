# 文化演化賽局（Cost of Culture Game）

> 這是一款以 Joseph Henrich《The Secret of Our Success》(SOS)為理論基礎的瀏覽器策略桌遊，用於大學「文化演化心理學」課程的體驗式學習。

---

## 遊戲簡介

《文化演化賽局》是一款 **1–5 人的瀏覽器策略桌遊**。玩家扮演原始部落，在有限的能量預算下決定如何分配三種生存資源——大腦、消化、肌肉——並沿著四條技術路徑積累文化複雜度，率先跨越「盧比孔門檻」（解鎖「累積文化」）的玩家獲勝。

遊戲將 Henrich 書中的核心概念直接對應到遊戲機制，讓玩家在親身體驗後，更容易理解文化演化的真實邏輯。

---

## 快速開始

### 透過網路直接遊玩

以網路瀏覽器開啟[遊戲首頁](https://scgeeker.github.io/Cultrual_Evo_simulation_game/)

### 在本機瀏覽器遊玩

1. Clone 或下載此 repo
2. 在瀏覽器開啟 `index.html`（無需伺服器，純靜態頁面）
3. 設定玩家人數、回合上限等參數，點擊「開始遊戲」

```bash
git clone https://github.com/SCgeeker/Cultrual_Evo_simulation_game.git
cd Cultrual_Evo_simulation_game
# 直接開啟 index.html，或用 VS Code Live Server
```

> **提示**：推薦 3 人以上一起玩，以體驗「集體大腦」的效果（CH 12）。

---

## 遊戲核心機制

### 三軌資源投資

每回合，玩家將能量分配到三個領域，必須取捨：

| 投資領域 | 每單位成本 | 產出 | 理論對應 |
|----------|-----------|------|----------|
| 🧠 發展大腦 | 2 能量 | 1 AP（技術點） | 大腦耗能高但帶來文化累積能力 |
| 🍖 維護消化 | 3 能量 | 下回合 +2 能量 | 消化效率影響長期能量供給 |
| 💪 強化肌肉 | 2 能量 | 1 行動點 | 行動力換取短期競爭優勢 |

> **昂貴組織權衡假說（Expensive Tissue Trade-off）**：大腦、消化、肌肉競爭同一能量預算，是本遊戲的核心張力。（SOS CH 05）

### 四條技術路徑

| 路徑 | 主題 | 代表技術 |
|------|------|----------|
| 🔥 外部消化 | 食物處理 | 火的控制 → 烹飪 → 食物保存 |
| 🔧 工具製作 | 物質技術 | 石器製作 → 長矛狩獵 → 複雜工具 |
| 💬 社會學習 | 知識傳承 | 語言 → 族群認同 → 口語傳承 |
| 🌿 環境適應 | 生態智慧 | 採集知識 → 民俗生物學 → 環境適應 |

技術分 Tier 1–5，前置依賴形成棘輪效應（Ratchet Effect）。Tier 4–5 需跨路徑組合，模擬「集體大腦」的多元技術積累。

### 勝利條件

首位累積文化複雜度分數（CCS）達到目標值（預設 30），即解鎖「累積文化」技術獲勝。

---

## 隨附文件

| 文件 | 位置 | 對象 | 說明 |
|------|------|------|------|
| 📖 玩家手冊 | `manual.html` | 學生 | 完整遊戲規則、技術樹說明、策略提示 |
| 🎓 試玩引導手冊 | `guide.html` | 教師 | W1–W6 每週反思題、遊戲暫停時機、理論對照表 |

遊戲主頁（`index.html`）頂部可直接開啟這兩份文件。

---

## 理論背景

本遊戲對應以下兩本著作，適合在文化演化課程中使用：

| 書目 | 對應章節 | 課程用途 |
|------|----------|----------|
| **The Secret of Our Success** — Joseph Henrich | CH 01–17 | 遊戲主要理論依據（W1–W7） |
| **The WEIRDest People in the World** — Joseph Henrich | — | Phase 4 延伸，探討 WEIRD 心理起源 |

### 遊戲機制 × 理論概念對照

| 遊戲機制 | SOS 概念 | 章節 |
|----------|----------|------|
| 三軌投資取捨 | 昂貴組織權衡假說 | CH 05 |
| 技術卡改變投資報酬率 | 基因—文化共演化 | CH 05–06 |
| 技術前置依賴 | 累積文化棘輪效應 | CH 01, 12 |
| 環境事件卡 | 環境壓力創造選擇壓力 | CH 10, 16 |
| 語言解鎖情報共享 | 社會學習效率 | CH 04, 13 |
| 族群認同解鎖掠奪/結盟 | 群體標記與群體間競爭 | CH 09–10 |
| 社會規範卡（付代價懲罰） | 第三方懲罰 / 規範心理學 | CH 11 |
| 多人互動改變策略空間 | 集體大腦：人口 × 連通度 | CH 12 |
| 勝利條件：累積文化 | 盧比孔門檻 | CH 15 |

---

## 檔案結構

```
cost-of-culture-game/
├── index.html                    # 遊戲主頁（入口）
├── app.js                        # 遊戲邏輯（純 JS，無框架）
├── style.css                     # 深色主題樣式
├── manual.html                   # 📖 玩家手冊
├── guide.html                    # 🎓 試玩引導手冊（教師用）
├── GAME_MANUAL.md                # 純文字版遊戲規則（備用）
├── TECH_CARD_DEVELOPMENT_PLAN.md # 技術卡開發計畫文件
└── README.md                     # 本文件
```

---

## 開發歷程

本遊戲以迭代方式開發，與 AI 協作完成各 Phase：

| Phase | 主要功能 |
|-------|----------|
| Phase 1–2 | 多人熱座模式、事件系統、能量跨回合結轉 |
| Phase 3 | 持久化 AP、防禦機制、技術卡初版（含技術樹前置依賴） |
| Phase 4 | 技術樹擴展（4 路徑 × 5 Tier）、CCS 勝利條件、玩家手冊與引導手冊 |

---

## 課程使用建議

1. **W1 預習**：邀請學生閱讀遊戲手冊 `manual.html`，搭配閱讀 SOS CH 01–04
2. **W2 試玩**：課堂進行 30 分鐘快速局（開啟「強制消化投資」選項）
3. **W3–W6**：每週以遊戲導引手冊 `guide.html` 的對應討論題帶領課後反思
4. **W7 整合**：以 SOS CH 15–17 為框架討論遊戲設計與文化演化理論的關係

詳細導引流程請參閱 [`guide.html`](guide.html)。

---

## 延伸閱讀

- Henrich, J. (2016). *The Secret of Our Success: How Culture Is Driving Human Evolution, Domesticating Our Species, and Making Us Smarter*. Princeton University Press. — [購買電子書](https://www.kobo.com/tw/zh/ebook/the-secret-of-our-success?srsltid=AfmBOoodCXcazqdKP2UIJLy4CI4t3pp3mqdhVe8jf6irUbenfQ-jLHwv)
- Henrich, J. (2020). *The WEIRDest People in the World: How the West Became Psychologically Peculiar and Particularly Prosperous*. Farrar, Straus and Giroux. — [購買電子書](https://www.kobo.com/tw/zh/ebook/ynlx5hAJBjmEWaLpf8Wf6Q?sId=a0724536-9ca8-475f-951d-11da7e0a7987&ssId=PLjFds6qPtdZflX6fqk80&cPos=1)

---

## License

本專案供學術教學用途。遊戲內容改編自公開學術著作，理論概念歸原著作者所有。

---

*Version Phase 4 | 最後更新：2026-02-24*
