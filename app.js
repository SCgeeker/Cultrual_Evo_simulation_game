// === 預設值 ===
let BASE_ENERGY = 10; // 可由設定畫面覆寫
const COSTS = { brain: 2, guts: 3, muscle: 2 };

// === 事件資料 ===
const EVENTS = [
    { id: 'dry_season', name: '乾季來臨', icon: '🌵', desc: '消化回報 ×1.5', effect: { guts: 1.5 } },
    { id: 'ice_age', name: '冰河時期', icon: '❄️', desc: '全效益 ×0.5', effect: { brain: 0.5, guts: 0.5, muscle: 0.5 } },
    { id: 'pestilence', name: '瘟疫蔓延', icon: '🤢', desc: '肌肉/消化效益 ×0.5', effect: { guts: 0.5, muscle: 0.5 } },
    { id: 'hunt', name: '獵物豐富', icon: '🦌', desc: '肌肉回報 ×1.5', effect: { muscle: 1.5 } },
    { id: 'terrain', name: '複雜地形', icon: '⛰️', desc: '大腦回報 ×1.5', effect: { brain: 1.5 } },
    { id: 'abundance', name: '食物豐足', icon: '🍎', desc: '所有玩家 +3 能量', effect: { energyBonus: 3 } },
    { id: 'scarcity', name: '資源匱乏', icon: '💀', desc: '所有玩家 -2 能量', effect: { energyBonus: -2 } },
    { id: 'calm', name: '平靜時期', icon: '☀️', desc: '無特殊效果', effect: {} },
    { id: 'hunt', name: '狩獵機會', icon: '🏹', desc: '肌肉回報 ×2', effect: { muscle: 2 } },
    { id: 'learning', name: '學習浪潮', icon: '📚', desc: '大腦回報 ×2', effect: { brain: 2 } },
    { id: 'digest', name: '消化考驗', icon: '🔥', desc: '消化回報 ×2', effect: { guts: 2 } },
    { id: 'stable', name: '穩定發展', icon: '⚖️', desc: '所有回報 ×1.2', effect: { brain: 1.2, guts: 1.2, muscle: 1.2 } }
];

// === 技術路徑資料 (AP 成本制) ===
// 基於《The Secret of Our Success》理論設計
const TECH_PATHS = {
    // 路徑 A：外部消化路線 🔥
    digestion: {
        id: 'digestion',
        name: '外部消化路線',
        icon: '🔥',
        description: '透過火與烹飪降低消化成本，提升能量效率',
        techs: ['fire_control', 'cooking', 'food_preservation', 'artifacts']
    },
    // 路徑 B：工具製作路線 🪨
    tools: {
        id: 'tools',
        name: '工具製作路線',
        icon: '🪨',
        description: '製作工具增強身體能力，提升投資報酬',
        techs: ['stone_tools', 'spear_hunting', 'complex_tools', 'artifacts']
    },
    // 路徑 C：社會學習路線 🗣️
    social: {
        id: 'social',
        name: '社會學習路線',
        icon: '🗣️',
        description: '發展語言與社會組織，解鎖合作與競爭行動',
        techs: ['language', 'group_identity', 'oral_tradition', 'teaching_system', 'cumulative_culture'],
        branches: {
            // 從 group_identity 分支出的額外路徑
            norms: { after: 'group_identity', techs: ['social_norms'] }
        }
    },
    // 路徑 D：環境知識路線 🌿
    environment: {
        id: 'environment',
        name: '環境知識路線',
        icon: '🌿',
        description: '累積環境知識，提升採集效率與適應能力',
        techs: ['gathering_knowledge', 'folk_biology', 'environmental_adaptation', 'information_resources', 'cumulative_culture']
    }
};

// === 演化時代定義 ===
const EVO_ERAS = {
    1: { name: '舊石器時代早期', period: '260-150萬年前', icon: '🦴' },
    2: { name: '舊石器時代中期', period: '150-50萬年前', icon: '🔥' },
    3: { name: '認知革命', period: '50-30萬年前', icon: '🧠' },
    4: { name: '行為現代性', period: '30-10萬年前', icon: '🎨' },
    5: { name: '舊石器晚期', period: '10-5萬年前', icon: '⚒️' },
    6: { name: '文明曙光', period: '5萬-1萬年前', icon: '🏛️' },
    7: { name: '新石器革命', period: '1萬年前至今', icon: '🚀' }
};

// === 技術卡資料 (AP 成本制 + 演化時序) ===
const TECH_CARDS = {
    // ===== 路徑 A：外部消化路線 =====
    fire_control: {
        id: 'fire_control',
        name: '火的控制',
        path: 'digestion',
        tier: 1,
        cost: 3,
        ccsValue: 1,
        evoEra: 2,           // 150萬年前 - 直立人用火
        evoYear: 1500000,
        evoRequires: ['stone_tools'], // 跨路徑演化前置：需先有石器才能控制火
        icon: '🔥',
        effects: {
            digestionReduction: 0.20,  // 消化成本 -20%
            brainBonus: 0.10           // 大腦投資回報 +10%
        },
        eventModifiers: {
            'ice_age': { brain: 2.0, guts: 2.0, muscle: 2.0 } // 抵消冰河時期懲罰
        },
        description: '掌握火焰，開啟人類演化的關鍵一步',
        flavorText: '火讓我們能在夜間活動，驅趕掠食者，更重要的是——烹飪食物。'
    },
    cooking: {
        id: 'cooking',
        name: '烹飪技術',
        path: 'digestion',
        tier: 2,
        cost: 5,
        ccsValue: 2,
        evoEra: 3,           // 50萬年前 - 系統性烹飪
        evoYear: 500000,
        requires: ['fire_control'],
        icon: '🍖',
        effects: {
            digestionReduction: 0.30,  // 消化成本再 -30%
            energyCapBonus: 3          // 能量上限 +3
        },
        description: '烹飪讓食物更容易消化，釋放更多能量',
        flavorText: '熟食革命：我們的祖先開始用更少的腸道，換取更大的大腦。'
    },
    food_preservation: {
        id: 'food_preservation',
        name: '食物保存',
        path: 'digestion',
        tier: 3,
        cost: 8,
        ccsValue: 3,
        evoEra: 6,           // 5萬年前 - 醃製風乾技術
        evoYear: 50000,
        requires: ['cooking'],
        icon: '🧂',
        effects: {
            unlimitedStorage: true,    // 無限儲能
            digestionReduction: 1.0    // 消化需求歸零
        },
        unlocksAction: 'farming',      // 解鎖農耕行動
        description: '醃製、風乾、發酵——食物不再受限於當下',
        flavorText: '能夠儲存食物，意味著我們能夠規劃未來。'
    },
    artifacts: {
        id: 'artifacts',
        name: '人造物系統',
        path: 'digestion', // 也屬於 tools 路徑的終點
        tier: 4,
        cost: 12,
        ccsValue: 5,
        evoEra: 6,           // 5萬年前 - 建築與器具
        evoYear: 40000,
        requires: ['food_preservation', 'complex_tools'], // 需要兩條路徑匯聚（全部）
        // requiresAny 移除，預設為 requiresAll
        icon: '🏛️',
        effects: {
            passiveEnergy: 3,          // 每回合 +3 能量 (調整)
            muscleReduction: 1.0       // 肌肉投資成本 -1 (調整)
        },
        description: '建築、器具、機械——人造環境取代自然選擇',
        flavorText: '我們不再適應環境，而是讓環境適應我們。'
    },

    // ===== 路徑 B：工具製作路線 =====
    stone_tools: {
        id: 'stone_tools',
        name: '石器製作',
        path: 'tools',
        tier: 1,
        cost: 3,
        ccsValue: 1,
        evoEra: 1,           // 260萬年前 - 奧杜威石器（最早的技術）
        evoYear: 2600000,
        icon: '🪨',
        effects: {
            freeMuscleInvestment: 1    // 每回合免費 +1 肌肉投資點
        },
        description: '最早的技術：將石頭變成延伸的手臂',
        flavorText: '奧杜威石器，250萬年前的發明，至今仍影響著我們。'
    },
    spear_hunting: {
        id: 'spear_hunting',
        name: '長矛狩獵',
        path: 'tools',
        tier: 2,
        cost: 5,
        ccsValue: 2,
        evoEra: 3,           // 50萬年前 - Schöningen 長矛
        evoYear: 500000,
        requires: ['stone_tools'],
        icon: '🏹',
        effects: {
            huntingBonus: 1            // 狩獵行動額外 +1 能量
        },
        unlocksAction: 'enhanced_hunt', // 強化狩獵
        description: '遠距離武器改變了狩獵的遊戲規則',
        flavorText: '不再需要近身搏鬥，人類成為最危險的掠食者。'
    },
    complex_tools: {
        id: 'complex_tools',
        name: '複雜工具',
        path: 'tools',
        tier: 3,
        cost: 8,
        ccsValue: 3,
        evoEra: 5,           // 10萬年前 - 複合工具
        evoYear: 100000,
        requires: ['spear_hunting'],
        icon: '⚒️',
        effects: {
            investmentBonus: 0.20      // 所有投資報酬 +20%
        },
        description: '組合多種材料，創造功能更強大的工具',
        flavorText: '弓箭、陷阱、漁網——複合工具標誌著認知革命。'
    },

    // ===== 路徑 C：社會學習路線 =====
    language: {
        id: 'language',
        name: '語言 Lv.1',
        path: 'social',
        tier: 1,
        cost: 2,
        ccsValue: 1,
        evoEra: 3,           // 50-30萬年前 - 原語言能力
        evoYear: 300000,
        icon: '💬',
        effects: {
            canViewInvestment: 1       // 可查看 1 位玩家的投資分配
        },
        description: '符號與聲音的組合，開啟資訊傳遞的新紀元',
        flavorText: '語言讓我們能夠分享不在眼前的事物——過去、未來、想像。'
    },
    group_identity: {
        id: 'group_identity',
        name: '族群認同',
        path: 'social',
        tier: 2,
        cost: 3,
        ccsValue: 2,
        evoEra: 4,           // 30萬年前 - 部落認同
        evoYear: 300000,
        requires: ['language'],
        icon: '🏳️',
        effects: {
            canAlly: true              // 可與一位玩家結盟
        },
        unlocksAction: ['plunder', 'defend', 'alliance'], // 解鎖掠奪、防禦、結盟
        description: '「我們」與「他們」的區分，合作與競爭的起點',
        flavorText: '部落標誌、方言、儀式——這些都在說：我們是一體的。'
    },
    oral_tradition: {
        id: 'oral_tradition',
        name: '口語傳承',
        path: 'social',
        tier: 3,
        cost: 5,
        ccsValue: 3,
        evoEra: 5,           // 10萬年前 - 口述歷史
        evoYear: 100000,
        requires: ['group_identity'],
        icon: '📖',
        effects: {
            techEffectBonus: 0.50      // 技術卡效果 +50%
        },
        description: '故事、歌謠、諺語——知識跨越世代流傳',
        flavorText: '沒有文字的時代，長老的記憶就是部落的圖書館。'
    },
    social_norms: {
        id: 'social_norms',
        name: '社會規範',
        path: 'social',
        tier: 3, // 與 oral_tradition 同層，但從 group_identity 分支
        cost: 5,
        ccsValue: 3,
        evoEra: 5,           // 10萬年前 - 社會制度
        evoYear: 100000,
        requires: ['group_identity'],
        icon: '⚖️',
        effects: {
            canPunish: true            // 可懲罰違規者
        },
        unlocksAction: 'punish',       // 解鎖懲罰行動
        description: '禁忌、習俗、法律——社會秩序的基石',
        flavorText: '懲罰背叛者，獎勵合作者，這就是文明的起點。'
    },
    teaching_system: {
        id: 'teaching_system',
        name: '教學系統',
        path: 'social',
        tier: 4,
        cost: 12,
        ccsValue: 5,
        evoEra: 6,           // 5萬年前 - 有意識的教學
        evoYear: 50000,
        requires: ['oral_tradition'],
        icon: '🎓',
        effects: {
            canCopyTech: true          // 可複製對手的技術卡效果
        },
        description: '有意識的知識傳遞，加速累積性文化演化',
        flavorText: '教學讓每一代都能站在前人的肩膀上。'
    },

    // ===== 路徑 D：環境知識路線 =====
    gathering_knowledge: {
        id: 'gathering_knowledge',
        name: '採集知識',
        path: 'environment',
        tier: 1,
        cost: 2,
        ccsValue: 1,
        evoEra: 2,           // 150萬年前 - 早期採集知識
        evoYear: 1000000,
        icon: '🌱',
        effects: {
            gutsBonus: 0.20            // 消化投資報酬 +20%
        },
        description: '認識可食用的植物、果實、根莖',
        flavorText: '哪些蘑菇能吃？這個知識可能救你一命，或要你一命。'
    },
    folk_biology: {
        id: 'folk_biology',
        name: '民俗生物學',
        path: 'environment',
        tier: 2,
        cost: 3,
        ccsValue: 2,
        evoEra: 4,           // 30萬年前 - 系統性觀察
        evoYear: 200000,
        requires: ['gathering_knowledge'],
        icon: '🦋',
        effects: {
            eventPreview: true,        // 環境事件可查看
            eventReroll: true          // 環境事件可重抽
        },
        eventModifiers: {
            'pestilence': { guts: 2.0, muscle: 2.0 } // 抵消瘟疫懲罰
        },
        unlocksAction: 'explore',      // 解鎖探索行動
        description: '對動植物行為的系統性觀察與分類',
        flavorText: '原住民的生態知識，往往比現代科學更早發現真相。'
    },
    environmental_adaptation: {
        id: 'environmental_adaptation',
        name: '環境適應',
        path: 'environment',
        tier: 3,
        cost: 5,
        ccsValue: 3,
        evoEra: 5,           // 10萬年前 - 多環境適應
        evoYear: 70000,
        requires: ['folk_biology'],
        icon: '🏔️',
        effects: {
            negativeEventImmunity: true // 負面環境事件無效
        },
        description: '無論沙漠、雨林、極地，人類都能生存',
        flavorText: '文化適應讓我們比任何物種都更具彈性。'
    },
    information_resources: {
        id: 'information_resources',
        name: '資訊資源',
        path: 'environment',
        tier: 4,
        cost: 12,
        ccsValue: 5,
        evoEra: 7,           // 1萬年前 - 文字與記錄
        evoYear: 10000,
        requires: ['environmental_adaptation'],
        icon: '📚',
        effects: {
            bonusAP: 2                 // 每回合額外 +2 AP
        },
        description: '系統化的知識管理，資訊本身成為資源',
        flavorText: '從口耳相傳到文字記錄，知識的累積開始加速。'
    },
    // ===== Tier 5 終極技術 =====
    cumulative_culture: {
        id: 'cumulative_culture',
        name: '累積文化',
        path: 'social', // 同時出現在 social 和 environment
        tier: 5,
        cost: 15,
        ccsValue: 10,
        evoEra: 7,           // 1萬年前至今 - 累積文化的棘輪效應
        evoYear: 5000,
        requiresTier4Count: 2, // 需任兩個 T4 技術
        icon: '🚀',
        effects: {
            ccsPerTech: true           // 特殊效果：每個已解鎖技術 +1 CCS
        },
        description: '文化的棘輪效應，知識的指數級成長',
        flavorText: '從此刻起，我們不再是適應這顆星球，而是開始邁向星辰。'
    }
};

// === 遊戲狀態 ===
const game = {
    players: [],
    currentIndex: 0,
    round: 1,
    maxRounds: 20,
    currentEvent: null,
    pendingAttacks: [],     // 暫存本回合所有掠奪，於結算時統一處理
    pendingAlliances: [],   // 暫存本回合所有結盟
    pendingPunishments: [], // 暫存本回合所有懲罰
    baseMultipliers: { brain: 1, guts: 1, muscle: 1 }
};

// === DOM 元素 ===
const screens = {
    setup: document.getElementById('screen-setup'),
    event: document.getElementById('screen-event'),
    handover: document.getElementById('screen-handover'),
    invest: document.getElementById('screen-invest'),
    action: document.getElementById('screen-action'),
    actionInfo: document.getElementById('screen-action-info'),
    personalResult: document.getElementById('screen-personal-result'),
    result: document.getElementById('screen-result'),
    gameOver: document.getElementById('screen-game-over')
};

const sliders = {
    brain: document.getElementById('slider-brain'),
    guts: document.getElementById('slider-guts'),
    muscle: document.getElementById('slider-muscle')
};

// === 畫面切換 ===
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[name].classList.remove('hidden');
}

// === 設定畫面 ===
function initSetup() {
    const countSelect = document.getElementById('player-count');
    const namesDiv = document.getElementById('player-names');

    function renderNameInputs() {
        const count = parseInt(countSelect.value);
        namesDiv.innerHTML = '';
        for (let i = 0; i < count; i++) {
            namesDiv.innerHTML += `
                <div class="setup-form">
                    <label>部落 ${i + 1}</label>
                    <input type="text" id="name-${i}" value="部落 ${i + 1}" placeholder="輸入名稱">
                </div>
            `;
        }
    }

    countSelect.addEventListener('change', renderNameInputs);
    renderNameInputs();

    // 渲染演化時代瀏覽列表
    renderEvoEraBrowser();

    document.getElementById('start-btn').addEventListener('click', startGame);
}

// 首頁演化時代瀏覽器
function renderEvoEraBrowser() {
    const container = document.getElementById('evo-era-list');
    if (!container) return;
    container.innerHTML = '';

    // 按 evoEra 分組技術卡
    const eraTechs = {};
    for (const [techId, tech] of Object.entries(TECH_CARDS)) {
        const era = tech.evoEra;
        if (!era) continue;
        if (!eraTechs[era]) eraTechs[era] = [];
        eraTechs[era].push(tech);
    }

    // 按 era 編號排序顯示
    const sortedEras = Object.keys(EVO_ERAS).sort((a, b) => Number(a) - Number(b));

    sortedEras.forEach(eraKey => {
        const era = EVO_ERAS[eraKey];
        const techs = eraTechs[eraKey] || [];
        if (techs.length === 0) return;

        // 按 evoYear 降序排列（年代越久越前）
        techs.sort((a, b) => (b.evoYear || 0) - (a.evoYear || 0));

        const card = document.createElement('div');
        card.className = 'evo-era-card';
        card.innerHTML = `
            <div class="evo-era-header">
                <span class="evo-era-icon">${era.icon}</span>
                <div class="evo-era-info">
                    <div class="evo-era-name">${era.name}</div>
                    <div class="evo-era-period">${era.period}</div>
                </div>
                <span class="evo-era-arrow">▶</span>
            </div>
            <div class="evo-era-techs">
                ${techs.map(t => {
                    const pathInfo = TECH_PATHS[t.path];
                    const pathIcon = pathInfo ? pathInfo.icon : '';
                    return `<span class="evo-era-tech-chip">${t.icon} ${t.name} <span class="chip-path">${pathIcon}</span></span>`;
                }).join('')}
            </div>
        `;

        card.querySelector('.evo-era-header').addEventListener('click', () => {
            card.classList.toggle('active');
        });

        container.appendChild(card);
    });
}

function startGame() {
    const count = parseInt(document.getElementById('player-count').value);
    game.maxRounds = parseInt(document.getElementById('max-rounds').value) || 20;
    game.targetCCS = parseInt(document.getElementById('target-ccs').value) || 30;
    BASE_ENERGY = parseInt(document.getElementById('base-energy').value) || 10;
    game.requireGuts = !!document.getElementById('require-guts').checked;
    game.players = [];
    game.pendingAttacks = [];
    game.pendingAlliances = [];
    game.pendingPunishments = [];

    for (let i = 0; i < count; i++) {
        const name = document.getElementById(`name-${i}`).value || `部落 ${i + 1}`;
        game.players.push({
            name,
            energy: BASE_ENERGY,
            ccs: 0,              // 文化複雜度分數 (Cultural Complexity Score)
            // === 技術系統 (新版) ===
            unlockedTechs: [],   // 已解鎖的技術卡 ID 列表
            pathProgress: {      // 各路徑的解鎖進度
                digestion: 0,
                tools: 0,
                social: 0,
                environment: 0
            },
            // === 資源系統 ===
            totalAP: 0,          // 歷史累計獲得的 AP (統計用)
            currentAP: 0,        // 當前持有的 AP (智慧/技術點，用於升級)
            actionPoints: 0,     // 當前持有的行動點 (肌肉點，用於執行行動)
            // === 戰鬥系統 ===
            defensePoints: 0,    // 當回合防禦點數 (不累積)
            pendingEnergy: 0,    // 暫存下回合的能量調整
            allies: [],          // 結盟對象的索引列表
            // === 回合資料 ===
            bids: { brain: 0, guts: 0, muscle: 0 },
            results: { ccs: 0, energy: 0, ap: 0, actions: 0 },
            roundLog: { lost: 0, gained: 0 }
        });
    }
    game.currentIndex = 0;
    game.round = 1;

    // 清空所有玩家防禦點
    game.players.forEach(p => p.defensePoints = 0);

    startRound();
}

// === 回合開始：顯示事件 ===
function startRound() {
    // 回合開始時清空上一回合的佇列
    game.pendingAttacks = [];
    game.pendingAlliances = [];
    game.pendingPunishments = [];

    game.players.forEach(p => {
        // 重置防禦點
        p.defensePoints = 0;
        // 重置肌肉行動點 (本回合未使用則失效) - 根據使用者需求新增
        p.actionPoints = 0;

        // 重置回合紀錄
        p.roundLog = { lost: 0, gained: 0 };

        // 應用延遲的能量調整 (被掠奪的效果在此生效)
        // 確保 energy 不小於 0
        p.energy += p.pendingEnergy;
        if (p.energy < 0) p.energy = 0;
        p.pendingEnergy = 0; // 重置

        // 發放基礎能量 (回合開始時發放)
        if (game.round > 1) {
            p.energy += BASE_ENERGY;
        }
    });

    // 抽取隨機事件
    game.currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    // 重設基礎乘數
    game.baseMultipliers = { brain: 1, guts: 1, muscle: 1 };

    // 套用事件效果到基礎乘數
    const eff = game.currentEvent.effect;
    if (eff.brain) game.baseMultipliers.brain = eff.brain;
    if (eff.guts) game.baseMultipliers.guts = eff.guts;
    if (eff.muscle) game.baseMultipliers.muscle = eff.muscle;

    // 修正：能量事件直接影響當前可用能量 (Allocation)
    if (eff.energyBonus) {
        game.players.forEach(p => {
            p.energy += eff.energyBonus;
            if (p.energy < 0) p.energy = 0; // 防止負數
        });
    }

    // 紀錄本回合初始能量 (用於顯示，避免後手玩家看到對手已投資後的餘額，保持戰爭迷霧)
    game.players.forEach(p => {
        p.initialEnergy = p.energy;
    });

    // 更新事件畫面
    document.getElementById('event-round').textContent = game.round;
    document.getElementById('event-icon').textContent = game.currentEvent.icon;
    document.getElementById('event-name').textContent = game.currentEvent.name;
    document.getElementById('event-desc').textContent = game.currentEvent.desc;
    document.getElementById('game-phase').textContent = `第 ${game.round} 回合`;

    showScreen('event');
}

document.getElementById('event-continue-btn').addEventListener('click', () => {
    showHandover();
});

// === 交接畫面 ===
function showHandover() {
    const player = game.players[game.currentIndex];
    document.getElementById('next-player-name').textContent = player.name;
    showScreen('handover');
}

document.getElementById('ready-btn').addEventListener('click', () => {
    showInvest();
});

// === 投資畫面 ===
function showInvest() {
    const player = game.players[game.currentIndex];
    document.getElementById('current-player-label').textContent = player.name;
    document.getElementById('round-number').textContent = game.round;

    // 顯示玩家當前能量
    document.getElementById('total-energy').textContent = player.energy;

    // 更新滑桿最大值為玩家能量
    sliders.brain.max = player.energy;
    sliders.guts.max = player.energy;
    sliders.muscle.max = player.energy;

    // 清空滑桿
    sliders.brain.value = 0;
    sliders.guts.value = 0;
    sliders.muscle.value = 0;

    // 更新乘數顯示
    updateMultiplierBadges(player);
    updateInvestUI();

    // 顯示已生效的技術效果
    const activeBonusesList = document.getElementById('active-bonuses-list');
    const activeBonusesDiv = document.getElementById('active-bonuses');
    activeBonusesList.innerHTML = '';

    // 使用 TechTreeManager 獲取效果
    // 注意：TechTreeUI 定義在下面，但 TechTreeManager 可以擴充 helper
    // 這裡我們直接遍歷
    const activeEffects = [];
    player.unlockedTechs.forEach(techId => {
        const tech = TECH_CARDS[techId];
        if (tech && tech.effects) {
            Object.entries(tech.effects).forEach(([k, v]) => {
                // 借用 TechTreeUI 的格式化函數 (需確保 TechTreeUI 已被定義或提升)
                // 由於 TechTreeUI 在下方定義，我們這裡可能存取不到? 
                // JS function hoisting 不適用於 const assign。
                // 我們可以把 formatEffect 移動到 TechTreeManager 或獨立 helper。
                // 為了避免大規模重構，這裡先簡單處理，或者呼叫一個我們稍後會在 TechTreeManager 加上的 helper。
                activeEffects.push(`${tech.name}: ${TechTreeManager.getTechEffectDescription ? TechTreeManager.getTechEffectDescription(k, v) : k}`);
            });
        }
    });

    if (activeEffects.length > 0) {
        activeEffects.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            activeBonusesList.appendChild(li);
        });
        activeBonusesDiv.classList.remove('hidden');
    } else {
        activeBonusesDiv.classList.add('hidden');
    }

    showScreen('invest');
}

function updateMultiplierBadges(player) {
    const multipliers = TechTreeManager.getEffectiveMultipliers(player);
    ['brain', 'guts', 'muscle'].forEach(type => {
        const badge = document.getElementById(`mult-${type}`);
        const m = multipliers[type];
        const base = game.baseMultipliers[type];

        // 顯示條件：數值不為 1，或是與基礎環境數值不同（代表有技術介入）
        if (m !== 1 || m !== base) {
            badge.textContent = `×${m}`;
            badge.classList.remove('hidden');

            // 樣式邏輯
            if (m > base) {
                // 技術帶來增益 (抵消懲罰或額外加成)
                badge.style.backgroundColor = '#4CAF50'; // Green
                badge.style.color = 'white';
            } else if (m < 1) {
                // 負面效果
                badge.style.backgroundColor = '#F44336'; // Red
                badge.style.color = 'white';
            } else {
                // 正面效果 (環境自帶)
                badge.style.backgroundColor = '#2196F3'; // Blue (Default)
                badge.style.color = 'white';
            }
        } else {
            badge.classList.add('hidden');
        }
    });
}

function calcReward(type, val) {
    const units = Math.floor(val / COSTS[type]);
    const base = type === 'guts' ? units * 2 : units;
    return base;
}

function calcRewardWithMultiplier(player, type, val) {
    const base = calcReward(type, val);
    const multipliers = TechTreeManager.getEffectiveMultipliers(player);
    return Math.floor(base * multipliers[type]);
}

function updateInvestUI() {
    const bids = {
        brain: parseInt(sliders.brain.value) || 0,
        guts: parseInt(sliders.guts.value) || 0,
        muscle: parseInt(sliders.muscle.value) || 0
    };

    const player = game.players[game.currentIndex];
    const total = bids.brain + bids.guts + bids.muscle;
    const reserved = player.energy - total;

    document.getElementById('value-brain').textContent = bids.brain;
    document.getElementById('value-guts').textContent = bids.guts;
    document.getElementById('value-muscle').textContent = bids.muscle;

    // 加入乘數計算的預估
    document.getElementById('reward-brain').textContent = calcRewardWithMultiplier(player, 'brain', bids.brain);
    document.getElementById('reward-guts').textContent = '+' + calcRewardWithMultiplier(player, 'guts', bids.guts);
    document.getElementById('reward-muscle').textContent = calcRewardWithMultiplier(player, 'muscle', bids.muscle);

    document.getElementById('reserved-energy').textContent = reserved;

    // 下回合總能量預估 (Forecast)
    // 預估值包含：目前保留 + 消化收益 + 基礎收入 (10) + 待處理的增減 (pendingEnergy)
    // 這裡的 pendingEnergy 還不知道本回合的掠奪結果 (因為還沒發生)，所以只能是 0 (因為 startRound 已清空)
    // 這樣沒問題，玩家只能看到已知的。
    const estimatedYield = calcRewardWithMultiplier(player, 'guts', bids.guts);
    const estimatedTotal = reserved + estimatedYield + BASE_ENERGY + player.pendingEnergy;

    document.getElementById('forecast-total').textContent = estimatedTotal >= 0 ? estimatedTotal : 0;

    const warning = document.getElementById('warning');
    const btn = document.getElementById('confirm-btn');

    const MAX_RESERVE = 5;
    const MIN_GUTS = 3; // 最低消化投資

    if (reserved < 0) {
        warning.textContent = '超出預算！請減少投資。';
        warning.classList.remove('hidden');
        btn.disabled = true;
    } else if (reserved > MAX_RESERVE) {
        warning.textContent = `保留上限 ${MAX_RESERVE}！請再投資 ${reserved - MAX_RESERVE} 能量。`;
        warning.classList.remove('hidden');
        btn.disabled = true;
    } else if (game.requireGuts === true && bids.guts < MIN_GUTS) {
        warning.textContent = `生存規則：消化投資至少需要 ${MIN_GUTS} 點能量！`;
        warning.classList.remove('hidden');
        btn.disabled = true;
    } else {
        warning.classList.add('hidden');
        btn.disabled = false;
    }
}

sliders.brain.addEventListener('input', updateInvestUI);
sliders.guts.addEventListener('input', updateInvestUI);
sliders.muscle.addEventListener('input', updateInvestUI);

document.getElementById('confirm-btn').addEventListener('click', confirmInvest);

function confirmInvest() {
    const player = game.players[game.currentIndex];
    player.bids = {
        brain: parseInt(sliders.brain.value) || 0,
        guts: parseInt(sliders.guts.value) || 0,
        muscle: parseInt(sliders.muscle.value) || 0
    };

    const spent = player.bids.brain + player.bids.guts + player.bids.muscle;
    const reserved = player.energy - spent;

    // 結算時套用乘數 (本回合收益)
    const energyGain = calcRewardWithMultiplier(player, 'guts', player.bids.guts);

    player.results = {
        ap: calcRewardWithMultiplier(player, 'brain', player.bids.brain),    // 大腦 -> AP (用於累積技術)
        energy: energyGain,                                          // 消化 -> 能量
        actions: calcRewardWithMultiplier(player, 'muscle', player.bids.muscle), // 肌肉 -> 行動點 (用於本回合執行)
        reserved: reserved
    };

    // 資源發放
    player.totalAP += player.results.ap;
    player.currentAP += player.results.ap;
    player.actionPoints = player.results.actions; // 行動點不累積，本回合發放

    // 重新計算 CCS (文化複雜度)
    player.ccs = TechTreeManager.calculateCCS(player);

    // 修正：這裡只計算當前剩餘能量 + 收益，作為本回合"剩餘資產" (可被掠奪)。
    player.energy = reserved + energyGain;

    // 進入行動/技術階段的條件：有智慧 AP (可用於技術) 或有行動點 (可用於行動)
    if (player.currentAP > 0 || player.actionPoints > 0) {
        initActionPhase(player);
    } else {
        finalizeTurn(player);
    }
}

// === 技術樹管理器 ===
const TechTreeManager = {
    // 取得指定路徑的下一個可升級技術
    getNextTech(player, pathId) {
        const path = TECH_PATHS[pathId];
        if (!path) return null;

        // 找到該路徑中第一個尚未解鎖的技術
        for (const techId of path.techs) {
            if (!player.unlockedTechs.includes(techId)) {
                return TECH_CARDS[techId];
            }
        }
        return null; // 該路徑已全部解鎖
    },

    // 檢查玩家是否滿足升級前置條件 (加上 AP 檢查)
    canUnlock(player, techId) {
        if (!this.isAvailable(player, techId)) return false;

        const tech = TECH_CARDS[techId];
        // 如果在行動階段，優先檢查暫存 AP；否則檢查玩家點數
        const availableAP = (typeof tempState !== 'undefined' && tempState.techAP !== undefined)
            ? tempState.techAP
            : player.currentAP;

        return availableAP >= tech.cost;
    },

    // 檢查基礎可用性 (前置條件)
    isAvailable(player, techId) {
        const tech = TECH_CARDS[techId];
        if (!tech) return false;
        if (this.hasTech(player, techId)) return false;

        if (tech.requires) {
            if (tech.requiresAny) {
                if (!tech.requires.some(reqId => this.hasTech(player, reqId))) return false;
            } else {
                if (!tech.requires.every(reqId => this.hasTech(player, reqId))) return false;
            }
        }

        // 檢查跨路徑演化前置條件 (evoRequires，個別技術指定)
        if (tech.evoRequires) {
            if (!tech.evoRequires.every(reqId => this.hasTech(player, reqId))) return false;
        }

        // 檢查演化時代順序：解鎖 era N 的技術需至少擁有一個 era N-1 的技術
        if (tech.evoEra && tech.evoEra > 1) {
            const prevEra = tech.evoEra - 1;
            const allUnlocked = [
                ...player.unlockedTechs,
                ...(tempState.unlockedThisTurn || [])
            ];
            const hasPrevEraTech = allUnlocked.some(id => {
                const t = TECH_CARDS[id];
                return t && t.evoEra === prevEra;
            });
            if (!hasPrevEraTech) return false;
        }

        // 檢查 Tier 4 技術數量需求 (Tier 5)
        if (tech.requiresTier4Count) {
            const allUnlocked = [
                ...player.unlockedTechs,
                ...(tempState.unlockedThisTurn || [])
            ];
            const t4Count = allUnlocked.filter(id => {
                const t = TECH_CARDS[id];
                return t && t.tier === 4;
            }).length;
            if (t4Count < tech.requiresTier4Count) return false;
        }

        return true;
    },

    // 執行技術升級
    unlock(player, techId) {
        // commit 邏輯：直接檢查玩家物件或暫存狀態
        const tech = TECH_CARDS[techId];
        if (!tech) return false;

        // 這裡的 unlock 通常用於最終確認 commit
        // 注意：在交易式設計中，此方法將在 end-action-btn 中被統一呼叫

        // 扣除 AP
        player.currentAP -= tech.cost;

        // 加入已解鎖列表
        player.unlockedTechs.push(techId);

        // 更新路徑進度
        if (tech.path && player.pathProgress[tech.path] !== undefined) {
            player.pathProgress[tech.path]++;
        }

        // 套用技術效果
        this.applyTechEffects(player, tech);

        // 更新 CCS 分數
        player.ccs = this.calculateCCS(player);

        return true;
    },

    // 套用技術效果（立即生效的部分）
    applyTechEffects(player, tech) {
        // 效果的實際應用將在 Phase 3 完整實作
        // 這裡先記錄解鎖的行動
        console.log(`[TechTree] ${player.name} 解鎖了 ${tech.name}`);

        if (tech.unlocksAction) {
            console.log(`[TechTree] 解鎖行動: ${tech.unlocksAction}`);
        }
    },

    // 取得玩家已解鎖的所有技術
    getUnlockedTechs(player) {
        return player.unlockedTechs.map(id => TECH_CARDS[id]).filter(Boolean);
    },

    // 取得玩家可解鎖的所有技術（滿足前置但尚未解鎖）
    getAvailableTechs(player) {
        const available = [];
        for (const techId in TECH_CARDS) {
            const tech = TECH_CARDS[techId];
            if (!player.unlockedTechs.includes(techId)) {
                // 檢查前置條件（不檢查 AP）
                let prereqMet = true;
                if (tech.requires) {
                    if (tech.requiresAny) {
                        prereqMet = tech.requires.some(req => player.unlockedTechs.includes(req));
                    } else {
                        prereqMet = tech.requires.every(req => player.unlockedTechs.includes(req));
                    }
                }

                // 檢查 Tier 4 技術數量需求 (Tier 5)
                if (tech.requiresTier4Count) {
                    const t4Count = player.unlockedTechs.filter(id => {
                        const t = TECH_CARDS[id];
                        return t && t.tier === 4;
                    }).length;
                    if (t4Count < tech.requiresTier4Count) prereqMet = false;
                }

                // Tier 1 技術沒有前置，自動滿足
                if (prereqMet || tech.tier === 1) {
                    available.push(tech);
                }
            }
        }
        return available;
    },

    // 檢查玩家是否擁有特定技術
    hasTech(player, techId) {
        const permanent = player.unlockedTechs.includes(techId);
        const pending = tempState.unlockedThisTurn && tempState.unlockedThisTurn.includes(techId);
        return permanent || !!pending;
    },

    // 檢查還未解鎖了某行動
    hasAction(player, actionName) {
        // 檢查永久解鎖
        for (const techId of player.unlockedTechs) {
            if (this._techUnlocksAction(techId, actionName)) return true;
        }
        // 檢查本回合暫時解鎖
        if (typeof tempState !== 'undefined' && tempState.unlockedThisTurn) {
            for (const techId of tempState.unlockedThisTurn) {
                if (this._techUnlocksAction(techId, actionName)) return true;
            }
        }
        return false;
    },

    _techUnlocksAction(techId, actionName) {
        const tech = TECH_CARDS[techId];
        if (tech && tech.unlocksAction) {
            if (Array.isArray(tech.unlocksAction)) {
                return tech.unlocksAction.includes(actionName);
            }
            return tech.unlocksAction === actionName;
        }
        return false;
    },

    // 計算文化複雜度分數 (CCS)
    calculateCCS(player) {
        let score = 0;
        // 1. 基礎技術分
        player.unlockedTechs.forEach(id => {
            const tech = TECH_CARDS[id];
            if (tech && tech.ccsValue) {
                score += tech.ccsValue;
            }
        });
        // 2. 組合加成
        score += this.checkComboBonuses(player);

        // 3. 特殊效果：累積文化棘輪 (每個技術 +1 CCS)
        if (player.unlockedTechs.includes('cumulative_culture')) {
            score += player.unlockedTechs.length;
        }

        return score;
    },

    // 檢查組合加成
    checkComboBonuses(player) {
        let bonus = 0;
        const techs = player.unlockedTechs;

        // 火與食 (火的控制 + 烹飪技術 + 食物保存)
        if (techs.includes('fire_control') && techs.includes('cooking') && techs.includes('food_preservation')) {
            bonus += 5;
        }
        // 狩獵專精 (石器製作 + 長矛狩獵 + 複雜工具)
        if (techs.includes('stone_tools') && techs.includes('spear_hunting') && techs.includes('complex_tools')) {
            bonus += 5;
        }
        // 社會結構 (語言 + 族群認同 + 社會規範)
        if (techs.includes('language') && techs.includes('group_identity') && techs.includes('social_norms')) {
            bonus += 5;
        }
        // 知識體系 (民俗生物學 + 口語傳承 + 教學系統)
        if (techs.includes('folk_biology') && techs.includes('oral_tradition') && techs.includes('teaching_system')) {
            bonus += 7;
        }

        return bonus;
    },
    // 顯示技術效果描述
    getTechEffectDescription(key, value) {
        return TechTreeUI.formatEffect(key, value);
    },

    getEffectiveMultipliers(player) {
        const base = game.baseMultipliers || { brain: 1, guts: 1, muscle: 1 };
        const mults = { ...base };
        const eventId = game.currentEvent ? game.currentEvent.id : null;
        if (eventId) {
            player.unlockedTechs.forEach(techId => {
                const tech = TECH_CARDS[techId];
                if (tech && tech.eventModifiers && tech.eventModifiers[eventId]) {
                    const mods = tech.eventModifiers[eventId];
                    if (mods.brain) mults.brain *= mods.brain;
                    if (mods.guts) mults.guts *= mods.guts;
                    if (mods.muscle) mults.muscle *= mods.muscle;
                }
            });
        }
        return mults;
    },

    // 取得玩家所有生效中的技術效果列表
    getActiveEffects(player) {
        const effects = [];
        player.unlockedTechs.forEach(techId => {
            const tech = TECH_CARDS[techId];
            if (tech && tech.effects) {
                for (const [key, val] of Object.entries(tech.effects)) {
                    // 排除一次性或開關型效果，只顯示數值型加成或特殊能力
                    // 這裡可以根據需要過濾
                    effects.push({
                        source: tech.name,
                        desc: this.getTechEffectDescription(key, val)
                    });
                }
            }
        });
        return effects;
    }
};

// === 技術樹 UI 管理器 ===
const TechTreeUI = {
    currentTechId: null, // 目前彈窗顯示的技術

    // 初始化頁籤切換
    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                // 切換按鈕狀態
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // 切換內容
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    },

    // 渲染技術樹面板
    renderTechTree(player) {
        const container = document.getElementById('tech-paths-container');
        container.innerHTML = '';

        for (const pathId in TECH_PATHS) {
            const path = TECH_PATHS[pathId];
            const pathEl = this.createPathElement(player, pathId, path);
            container.appendChild(pathEl);
        }
    },

    // 建立單條路徑元素
    createPathElement(player, pathId, path) {
        const pathEl = document.createElement('div');
        pathEl.className = 'tech-path';
        pathEl.dataset.path = pathId;

        // 計算進度 (包括暫時解鎖)
        const unlockedCount = path.techs.filter(techId =>
            TechTreeManager.hasTech(player, techId)
        ).length;
        const totalCount = path.techs.length;

        pathEl.innerHTML = `
            <div class="tech-path-header">
                <span class="tech-path-icon">${path.icon}</span>
                <span class="tech-path-name">${path.name}</span>
                <span class="tech-path-progress">${unlockedCount}/${totalCount}</span>
            </div>
            <div class="tech-nodes"></div>
        `;

        // 渲染技術節點
        const nodesContainer = pathEl.querySelector('.tech-nodes');
        path.techs.forEach(techId => {
            const tech = TECH_CARDS[techId];
            if (tech) {
                const nodeEl = this.createTechNode(player, tech);
                nodesContainer.appendChild(nodeEl);
            }
        });

        return pathEl;
    },

    // 建立技術節點元素
    createTechNode(player, tech) {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tech-node';
        nodeEl.dataset.techId = tech.id;

        // 判斷狀態
        const isUnlocked = TechTreeManager.hasTech(player, tech.id);
        const canUnlock = TechTreeManager.canUnlock(player, tech.id);
        const prereqMet = TechTreeManager.isAvailable(player, tech.id) || isUnlocked;

        if (isUnlocked) {
            nodeEl.classList.add('unlocked');
            // 如果是本回合剛點的，可以加個樣式區分 (選配)
            if (tempState.unlockedThisTurn.includes(tech.id)) {
                nodeEl.classList.add('pending-unlock');
            }
        } else if (canUnlock) {
            nodeEl.classList.add('available');
        } else if (!prereqMet) {
            nodeEl.classList.add('locked');
        }

        const eraInfo = EVO_ERAS[tech.evoEra];
        const eraLabel = eraInfo ? `<div class="tech-node-era">${eraInfo.icon} ${eraInfo.period}</div>` : '';

        nodeEl.innerHTML = `
            <div class="tech-node-icon">${tech.icon}</div>
            <div class="tech-node-name">${tech.name}</div>
            ${eraLabel}
            ${!isUnlocked ? `<div class="tech-node-cost">${tech.cost} AP</div>` : ''}
        `;

        // 點擊事件
        nodeEl.addEventListener('click', () => {
            this.showTechModal(player, tech);
        });

        return nodeEl;
    },

    // 檢查前置條件（不檢查 AP）
    checkPrerequisites(player, tech) {
        return TechTreeManager.isAvailable(player, tech.id);
    },

    // 顯示技術卡彈窗
    showTechModal(player, tech) {
        this.currentTechId = tech.id;
        const modal = document.getElementById('tech-modal');
        const path = TECH_PATHS[tech.path];

        // 填入資料
        document.getElementById('modal-tech-icon').textContent = tech.icon;
        document.getElementById('modal-tech-name').textContent = tech.name;
        const eraInfo = EVO_ERAS[tech.evoEra];
        const eraText = eraInfo ? ` | ${eraInfo.icon} ${eraInfo.name} (${eraInfo.period})` : '';
        document.getElementById('modal-tech-path').innerHTML = `${path ? path.name : ''}${eraText}`;
        document.getElementById('modal-tech-desc').textContent = tech.description;
        document.getElementById('modal-tech-flavor').textContent = tech.flavorText;
        document.getElementById('modal-tech-cost').textContent = `${tech.cost} AP`;

        // 渲染效果列表
        const effectsEl = document.getElementById('modal-tech-effects');
        effectsEl.innerHTML = '<h4>效果</h4>';
        for (const [key, value] of Object.entries(tech.effects)) {
            const effectText = this.formatEffect(key, value);
            effectsEl.innerHTML += `
                <div class="tech-effect-item">
                    <span class="effect-icon">✦</span>
                    <span>${effectText}</span>
                </div>
            `;
        }

        // 渲染解鎖行動（顯示中文名稱）
        if (tech.unlocksAction) {
            const ACTION_NAMES = {
                farming: '🌾 農耕（+2能量）',
                enhanced_hunt: '🏹 強化狩獵（狩獵改為+2能量）',
                plunder: '⚔️ 掠奪（搶奪對手2能量）',
                defend: '🛡️ 防禦（抵消1次掠奪）',
                alliance: '🤝 結盟（目標+1能量，取消雙方掠奪）',
                punish: '⚖️ 懲罰（目標-1能量）',
                explore: '🧭 探索（+2能量）'
            };
            const actions = Array.isArray(tech.unlocksAction) ? tech.unlocksAction : [tech.unlocksAction];
            const actionLabels = actions.map(a => ACTION_NAMES[a] || a).join('<br>');
            effectsEl.innerHTML += `
                <div class="tech-effect-item">
                    <span class="effect-icon">🔓</span>
                    <span>解鎖行動:<br><span class="effect-value">${actionLabels}</span></span>
                </div>
            `;
        }

        // 渲染前置需求
        const reqEl = document.getElementById('modal-tech-requirements');

        let reqHTML = '';
        if (tech.requiresTier4Count) {
            const currentT4 = player.unlockedTechs.filter(id => TECH_CARDS[id] && TECH_CARDS[id].tier === 4).length;
            const isMet = currentT4 >= tech.requiresTier4Count;
            const icon = isMet ? '✓' : '✗';
            const className = isMet ? 'req-met' : 'req-missing';
            reqHTML += `<span class="${className}">${icon} 需要任 ${tech.requiresTier4Count} 個 Tier 4 技術 (目前: ${currentT4})</span>`;
        } else if (tech.requires && tech.requires.length > 0) {
            const reqTexts = tech.requires.map(reqId => {
                const reqTech = TECH_CARDS[reqId];
                const hasTech = TechTreeManager.hasTech(player, reqId);
                const className = hasTech ? 'req-met' : 'req-missing';
                const icon = hasTech ? '✓' : '✗';
                return `<span class="${className}">${icon} ${reqTech ? reqTech.name : reqId}</span>`;
            });
            const reqType = tech.requiresAny ? '(任一)' : '(全部)';
            reqHTML += `需要: ${reqTexts.join(' ')} ${reqType}`;
        }
        // 顯示跨路徑演化前置條件（個別指定）
        if (tech.evoRequires && tech.evoRequires.length > 0) {
            const evoReqTexts = tech.evoRequires.map(reqId => {
                const reqTech = TECH_CARDS[reqId];
                const hasTech = TechTreeManager.hasTech(player, reqId);
                const className = hasTech ? 'req-met' : 'req-missing';
                const icon = hasTech ? '✓' : '✗';
                return `<span class="${className}">${icon} ${reqTech ? reqTech.name : reqId}</span>`;
            });
            reqHTML += `${reqHTML ? '<br>' : ''}演化前置: ${evoReqTexts.join(' ')}`;
        }
        // 顯示演化時代順序限制
        if (tech.evoEra && tech.evoEra > 1) {
            const prevEra = tech.evoEra - 1;
            const prevEraInfo = EVO_ERAS[prevEra];
            const allUnlocked = [
                ...player.unlockedTechs,
                ...(tempState.unlockedThisTurn || [])
            ];
            const hasPrevEraTech = allUnlocked.some(id => {
                const t = TECH_CARDS[id];
                return t && t.evoEra === prevEra;
            });
            const className = hasPrevEraTech ? 'req-met' : 'req-missing';
            const icon = hasPrevEraTech ? '✓' : '✗';
            reqHTML += `${reqHTML ? '<br>' : ''}<span class="${className}">${icon} 需先掌握「${prevEraInfo.icon} ${prevEraInfo.name}」時代的技術</span>`;
        }
        reqEl.innerHTML = reqHTML || '無前置需求';

        // 更新按鈕狀態
        const unlockBtn = document.getElementById('modal-unlock-btn');
        const isUnlocked = TechTreeManager.hasTech(player, tech.id);
        const canUnlock = TechTreeManager.canUnlock(player, tech.id);

        // 使用暫存 AP
        const availableAP = tempState.techAP;

        if (isUnlocked) {
            unlockBtn.textContent = '已解鎖';
            unlockBtn.disabled = true;
        } else if (canUnlock) {
            unlockBtn.textContent = `解鎖 (${tech.cost} AP)`;
            unlockBtn.disabled = false;
        } else if (availableAP < tech.cost) {
            unlockBtn.textContent = `AP 不足 (需要 ${tech.cost})`;
            unlockBtn.disabled = true;
        } else {
            unlockBtn.textContent = '未滿足前置條件';
            unlockBtn.disabled = true;
        }

        modal.classList.remove('hidden');
    },

    // 格式化效果文字
    formatEffect(key, value) {
        const effectMap = {
            digestionReduction: `消化效率 +${Math.round(value * 100)}% (節省能量)`,
            brainBonus: `AP 產出 +${Math.round(value * 100)}%`,
            energyCapBonus: `每回合額外 +${value} 能量`,
            unlimitedStorage: '能量儲存無上限',
            passiveEnergy: `每回合 +${value} 能量`,
            muscleReduction: `肌肉投資效率 +${Math.round(value * 100)}%`,
            freeMuscleInvestment: `每回合免費 +${value} 肌肉投資`,
            huntingBonus: `狩獵額外 +${value} 能量`,
            investmentBonus: `所有投資回報 +${Math.round(value * 100)}%`,
            canViewInvestment: `可查看 ${value} 位玩家的投資`,
            canAlly: '可與其他玩家結盟',
            techEffectBonus: `技術效果 +${Math.round(value * 100)}%`,
            canPunish: '可懲罰違規者',
            canCopyTech: '可複製對手技術效果',
            gutsBonus: `消化投資回報 +${Math.round(value * 100)}%`,
            eventPreview: '可預覽環境事件',
            eventReroll: '可重抽環境事件',
            negativeEventImmunity: '免疫負面環境事件',
            bonusAP: `每回合額外 +${value} AP`,
            ccsPerTech: '每個已解鎖技術 +1 CCS (勝利條件)'
        };
        return effectMap[key] || `${key}: ${value}`;
    },

    // 關閉彈窗
    closeModal() {
        document.getElementById('tech-modal').classList.add('hidden');
        this.currentTechId = null;
    },

    // 執行暫時升級 (交易式)
    performUpgrade(player) {
        if (!this.currentTechId) return;

        const tech = TECH_CARDS[this.currentTechId];
        if (!tech) return;

        // 檢查條件 (暫存狀態)
        const canUnlock = TechTreeManager.isAvailable(player, this.currentTechId);
        const hasEnoughAP = tempState.techAP >= tech.cost;

        if (canUnlock && hasEnoughAP) {
            // 執行暫時扣除與解鎖
            tempState.techAP -= tech.cost;
            tempState.unlockedThisTurn.push(this.currentTechId);

            // 播放 AP 扣除動畫
            const apDisplay = document.getElementById('current-ap');
            if (apDisplay) {
                apDisplay.classList.add('deducting');
                setTimeout(() => apDisplay.classList.remove('deducting'), 300);
                apDisplay.textContent = tempState.techAP;
            }

            // 重新渲染技術樹
            this.renderTechTree(player);

            // 標記剛解鎖的節點
            const node = document.querySelector(`.tech-node[data-tech-id="${this.currentTechId}"]`);
            if (node) {
                node.classList.add('just-unlocked');
                setTimeout(() => node.classList.remove('just-unlocked'), 500);
            }

            // 關閉彈窗
            this.closeModal();

            // 更新行動 UI (有些技術可能解鎖新行動)
            updateActionUI();

            // 檢查勝利條件：首位解鎖「累積文化」的玩家獲勝
            if (this.currentTechId === 'cumulative_culture') {
                game.winner = player;
                showVictoryScreen(player);
                return;
            }
        } else {
            // 提示失敗
            const btn = document.getElementById('modal-unlock-btn');
            if (btn) {
                btn.classList.add('shake');
                setTimeout(() => btn.classList.remove('shake'), 500);
            }
        }
    },

    // 初始化彈窗事件
    initModalEvents() {
        // 關閉按鈕
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // 點擊背景關閉
        document.getElementById('tech-modal').addEventListener('click', (e) => {
            if (e.target.id === 'tech-modal') {
                this.closeModal();
            }
        });

        // 解鎖按鈕
        document.getElementById('modal-unlock-btn').addEventListener('click', () => {
            const player = game.players[game.currentIndex];
            this.performUpgrade(player);
        });
    }
};

// 初始化技術樹 UI 事件
TechTreeUI.initTabs();
TechTreeUI.initModalEvents();

// === 行動階段 (交易式設計) ===
let tempState = {
    ap: 0,              // 肌肉行動點 (本回合可用)
    techAP: 0,          // 智慧點 (用於技術，暫存)
    unlockedThisTurn: [], // 本回合暫時解鎖的技術 ID
    energyChange: 0,
    defenseToAdd: 0,
    plunderTargets: [],
    allyTargets: [],    // 本回合結盟目標
    punishTargets: [],  // 本回合懲罰目標
    counts: {
        hunt: 0,
        farm: 0,
        defend: 0,
        alliance: 0,
        punish: 0,
        explore: 0
    }
};

function initActionPhase(player) {
    // 初始化暫存狀態
    resetTempState(player);

    if (game.players.length === 1) {
        // 單人模式：只顯示說明
        document.getElementById('info-ap').textContent = tempState.ap;
        showScreen('actionInfo');
        return;
    }

    document.getElementById('action-player-name').textContent = player.name;

    // 綁定基本行動按鈕
    document.getElementById('btn-hunt').onclick = () => performAction('hunt');
    document.getElementById('btn-defend').onclick = () => performAction('defend');
    document.getElementById('btn-explore').onclick = () => performAction('explore');

    let btnFarm = document.getElementById('btn-farm');
    if (!btnFarm) {
        const optionsDiv = document.querySelector('.action-options');
        btnFarm = document.createElement('button');
        btnFarm.id = 'btn-farm';
        btnFarm.className = 'action-card';
        btnFarm.innerHTML = `
            <div class="action-icon">🌾</div>
            <h3>農耕</h3>
            <p>消耗 1 AP</p>
            <p>獲得 2 能量</p>
            <p class="desc-text">(需解鎖 [食物保存] 技術)</p>
        `;
        optionsDiv.insertBefore(btnFarm, document.getElementById('btn-defend'));
    }

    btnFarm.onclick = () => performAction('farm');

    // 檢查解鎖狀態（需要 food_preservation 技術）
    if (TechTreeManager.hasAction(player, 'farming')) {
        btnFarm.classList.remove('locked');
        btnFarm.title = "";
    } else {
        btnFarm.classList.add('locked');
        btnFarm.title = "需要解鎖 [食物保存] 技術";
        btnFarm.onclick = null;
        btnFarm.style.opacity = '0.5';
        btnFarm.style.cursor = 'not-allowed';
    }

    document.getElementById('reset-action-btn').onclick = () => resetTempState(player);

    // 重新綁定確認按鈕，確保最新狀態
    document.getElementById('end-action-btn').onclick = () => {
        // 1. 寫入行動結果
        player.actionPoints = tempState.ap; // 賸餘的行動點
        player.energy += tempState.energyChange;
        player.defensePoints += tempState.defenseToAdd;
        player.roundLog.gained += tempState.energyChange;

        // 2. 提交技術解鎖 (交易式 commit)
        if (tempState.unlockedThisTurn.length > 0) {
            tempState.unlockedThisTurn.forEach(techId => {
                // 直接寫入玩家主體，因為此時已點擊確認
                if (!player.unlockedTechs.includes(techId)) {
                    player.unlockedTechs.push(techId);

                    const tech = TECH_CARDS[techId];
                    if (tech && tech.path && player.pathProgress[tech.path] !== undefined) {
                        player.pathProgress[tech.path] = Math.max(player.pathProgress[tech.path], tech.tier);
                    }
                }
            });
            player.currentAP = tempState.techAP;
        }

        // 無論有無新解鎖，都重新計算 CCS 確保同步
        player.ccs = TechTreeManager.calculateCCS(player);

        // 3. 處理掠奪請求
        tempState.plunderTargets.forEach(action => {
            game.pendingAttacks.push({
                attackerIndex: game.currentIndex,
                targetIndex: action.targetIndex,
                amount: 2
            });
        });

        // 4. 處理結盟請求（目標 +1 pendingEnergy，雙方掠奪取消於 showResult 處理）
        tempState.allyTargets.forEach(action => {
            game.pendingAlliances.push({
                fromIndex: game.currentIndex,
                targetIndex: action.targetIndex
            });
        });

        // 5. 處理懲罰請求
        tempState.punishTargets.forEach(action => {
            game.pendingPunishments.push({
                attackerIndex: game.currentIndex,
                targetIndex: action.targetIndex,
                amount: 1
            });
        });

        finalizeTurn(player);
    };

    // 渲染技術樹
    TechTreeUI.renderTechTree(player);

    // 重置頁籤到行動頁
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === 'actions');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === 'tab-actions');
    });

    // 初始渲染
    updateActionUI();
    showScreen('action');
}

function resetTempState(player) {
    tempState.ap = player.actionPoints;
    tempState.techAP = player.currentAP;
    tempState.unlockedThisTurn = [];
    tempState.energyChange = 0;
    tempState.defenseToAdd = 0;
    tempState.plunderTargets = [];
    tempState.allyTargets = [];
    tempState.punishTargets = [];
    tempState.counts = {
        hunt: 0,
        farm: 0,
        defend: 0,
        alliance: 0,
        punish: 0,
        explore: 0
    };
    updateActionUI();
    TechTreeUI.renderTechTree(player);
}

function updateActionUI() {
    // 顯示兩類資源 (顯示暫存狀態)
    const player = game.players[game.currentIndex];
    document.getElementById('current-ap').textContent = tempState.techAP; // 暫存智慧 AP (可取消)
    document.getElementById('current-action-points').textContent = tempState.ap; // 暫存肌肉行動點 (可重置)

    // 定義 helper 函數來更新 Badge
    const updateBadge = (btnId, count) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        // 查找或創建 badge
        let badge = btn.querySelector('.count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'count-badge';
            // 簡單樣式：絕對定位右上角 或 inline
            badge.style.position = 'absolute';
            badge.style.top = '5px';
            badge.style.right = '5px';
            badge.style.background = '#ffeb3b';
            badge.style.color = '#000';
            badge.style.borderRadius = '50%';
            badge.style.width = '24px';
            badge.style.height = '24px';
            badge.style.display = 'flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.fontWeight = 'bold';
            badge.style.fontSize = '14px';
            // 確保 button position 是 relative
            if (getComputedStyle(btn).position === 'static') {
                btn.style.position = 'relative';
            }
            btn.appendChild(badge);
        }

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
            btn.classList.add('selected'); // 可加上選中樣式
            btn.style.border = '2px solid #ffeb3b';
        } else {
            badge.style.display = 'none';
            btn.classList.remove('selected');
            btn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        }
    };

    updateBadge('btn-hunt', tempState.counts.hunt);
    updateBadge('btn-defend', tempState.counts.defend);
    updateBadge('btn-farm', tempState.counts.farm);
    updateBadge('btn-explore', tempState.counts.explore);

    const btnHunt = document.getElementById('btn-hunt');
    const btnDefend = document.getElementById('btn-defend');
    const btnFarm = document.getElementById('btn-farm');
    const btnExplore = document.getElementById('btn-explore');
    const groupPlunder = document.getElementById('group-plunder');
    const groupAlliance = document.getElementById('group-alliance');
    const groupPunish = document.getElementById('group-punish');

    const hasAP = tempState.ap > 0;
    const canDefend = TechTreeManager.hasAction(player, 'defend');
    const canPlunder = TechTreeManager.hasAction(player, 'plunder');
    const canAlly = TechTreeManager.hasAction(player, 'alliance');
    const canPunish = TechTreeManager.hasAction(player, 'punish');
    const canExplore = TechTreeManager.hasAction(player, 'explore');
    const hasSpear = TechTreeManager.hasTech(player, 'spear_hunting');

    // 1. 狩獵（基礎行動，矛術解鎖後顯示強化效益）
    if (hasAP) btnHunt.classList.remove('disabled');
    else btnHunt.classList.add('disabled');
    const huntEffect = btnHunt.querySelector('.effect');
    if (huntEffect) huntEffect.textContent = hasSpear ? '獲得 +2 能量 ⚡（矛術強化）' : '獲得 +1 能量';

    // 2. 防禦 (需解鎖族群認同)
    const defLocked = !canDefend;
    btnDefend.classList.toggle('locked', defLocked);
    btnDefend.title = defLocked ? "需解鎖 [族群認同] 技術" : "";
    btnDefend.classList.toggle('disabled', !hasAP || defLocked);

    // 3. 掠奪 (需解鎖族群認同)
    const pluLocked = !canPlunder;
    groupPlunder.classList.toggle('locked', pluLocked);
    groupPlunder.title = pluLocked ? "需解鎖 [族群認同] 技術" : "";
    groupPlunder.classList.toggle('disabled', !hasAP || pluLocked);

    // 4. 農耕 (需解鎖食物保存)
    if (btnFarm) {
        const isFarmLocked = !TechTreeManager.hasAction(player, 'farming');
        btnFarm.classList.toggle('locked', isFarmLocked);
        btnFarm.title = isFarmLocked ? "需解鎖 [食物保存] 技術" : "";
        btnFarm.classList.toggle('disabled', !hasAP || isFarmLocked);
    }

    // 5. 結盟 (需解鎖族群認同)
    if (groupAlliance) {
        groupAlliance.classList.toggle('locked', !canAlly);
        groupAlliance.title = !canAlly ? "需解鎖 [族群認同] 技術" : "";
        groupAlliance.classList.toggle('disabled', !hasAP || !canAlly);
    }

    // 6. 懲罰 (需解鎖社會規範)
    if (groupPunish) {
        groupPunish.classList.toggle('locked', !canPunish);
        groupPunish.title = !canPunish ? "需解鎖 [社會規範] 技術" : "";
        groupPunish.classList.toggle('disabled', !hasAP || !canPunish);
    }

    // 7. 探索 (需解鎖民俗生物學)
    if (btnExplore) {
        btnExplore.classList.toggle('locked', !canExplore);
        btnExplore.title = !canExplore ? "需解鎖 [民俗生物學] 技術" : "";
        btnExplore.classList.toggle('disabled', !hasAP || !canExplore);
    }

    // 渲染掠奪目標
    const targetList = document.getElementById('plunder-targets');
    targetList.innerHTML = '';

    game.players.forEach((p, index) => {
        if (index !== game.currentIndex) {
            const btn = document.createElement('button');
            btn.className = 'btn-target';

            const count = tempState.plunderTargets.filter(t => t.targetIndex === index).length;
            const plunderMark = count > 0 ? ` <span style="color:red">-${count * 2}</span>` : '';
            const displayEnergy = (p.initialEnergy !== undefined) ? p.initialEnergy : p.energy;

            btn.innerHTML = `${p.name} <span class="energy-badge">⚡${displayEnergy}</span>${plunderMark}`;
            btn.onclick = () => performAction('plunder', index);

            if (count > 0) {
                btn.style.border = '2px solid #ff5252';
                const badge = document.createElement('span');
                badge.textContent = count;
                badge.style.cssText = 'background:#ff5252;color:white;border-radius:50%;padding:2px 6px;margin-left:5px;font-size:12px;';
                btn.appendChild(badge);
            }
            if (!hasAP) { btn.disabled = true; btn.style.opacity = 0.5; }
            targetList.appendChild(btn);
        }
    });

    // 渲染結盟目標
    const allianceList = document.getElementById('alliance-targets');
    if (allianceList) {
        allianceList.innerHTML = '';
        if (canAlly) {
            game.players.forEach((p, index) => {
                if (index !== game.currentIndex) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-target';
                    const count = tempState.allyTargets.filter(t => t.targetIndex === index).length;
                    const allyMark = count > 0 ? ` <span style="color:#4CAF50">✓結盟</span>` : '';
                    const displayEnergy = (p.initialEnergy !== undefined) ? p.initialEnergy : p.energy;
                    btn.innerHTML = `${p.name} <span class="energy-badge">⚡${displayEnergy}</span>${allyMark}`;
                    btn.onclick = () => performAction('alliance', index);
                    if (count > 0) btn.style.border = '2px solid #4CAF50';
                    if (!hasAP) { btn.disabled = true; btn.style.opacity = 0.5; }
                    allianceList.appendChild(btn);
                }
            });
        }
    }

    // 渲染懲罰目標
    const punishList = document.getElementById('punish-targets');
    if (punishList) {
        punishList.innerHTML = '';
        if (canPunish) {
            game.players.forEach((p, index) => {
                if (index !== game.currentIndex) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-target';
                    const count = tempState.punishTargets.filter(t => t.targetIndex === index).length;
                    const punishMark = count > 0 ? ` <span style="color:#FF9800">×${count}</span>` : '';
                    const displayEnergy = (p.initialEnergy !== undefined) ? p.initialEnergy : p.energy;
                    btn.innerHTML = `${p.name} <span class="energy-badge">⚡${displayEnergy}</span>${punishMark}`;
                    btn.onclick = () => performAction('punish', index);
                    if (count > 0) {
                        btn.style.border = '2px solid #FF9800';
                        const badge = document.createElement('span');
                        badge.textContent = count;
                        badge.style.cssText = 'background:#FF9800;color:white;border-radius:50%;padding:2px 6px;margin-left:5px;font-size:12px;';
                        btn.appendChild(badge);
                    }
                    if (!hasAP) { btn.disabled = true; btn.style.opacity = 0.5; }
                    punishList.appendChild(btn);
                }
            });
        }
    }
}

function performAction(type, targetIndex) {
    if (tempState.ap < 1) return;

    // 檢查技術加成
    // 再次確保 player 正確
    const player = game.players[game.currentIndex];

    // 簡單的狩獵加成檢查
    let huntBonus = 0;
    if (type === 'hunt' && TechTreeManager.hasTech(player, 'spear_hunting')) {
        huntBonus = 1;
    }

    if (type === 'hunt') {
        tempState.energyChange += (1 + huntBonus);
        tempState.counts.hunt++;
        tempState.ap--;
    } else if (type === 'farm') {
        tempState.energyChange += 2;
        tempState.counts.farm++;
        tempState.ap--;
    } else if (type === 'defend') {
        tempState.defenseToAdd += 1;
        tempState.counts.defend++;
        tempState.ap--;
    } else if (type === 'plunder') {
        tempState.plunderTargets.push({ targetIndex, amount: 2 });
        // 不立即獲得能量，於回合結束統一結算（可能被防禦阻擋）
        tempState.ap--;
    } else if (type === 'alliance') {
        // 結盟：目標下回合 +1 能量，雙方取消互相掠奪（於結算時處理）
        tempState.allyTargets.push({ targetIndex });
        tempState.counts.alliance++;
        tempState.ap--;
    } else if (type === 'punish') {
        // 懲罰：目標下回合 -1 能量（於結算時處理）
        tempState.punishTargets.push({ targetIndex });
        tempState.counts.punish++;
        tempState.ap--;
    } else if (type === 'explore') {
        // 探索：利用環境知識獲得 +2 能量
        tempState.energyChange += 2;
        tempState.counts.explore++;
        tempState.ap--;
    }

    updateActionUI();
}



// 說明畫面確認
document.getElementById('info-confirm-btn').onclick = () => {
    const player = game.players[game.currentIndex];
    finalizeTurn(player);
};

function finalizeTurn(player) {
    // 分數已在 confirmInvest 及 TechTreeManager.unlock 中即時計算
    showPersonalResult(player);
}

// === 個人結果畫面 ===
function showPersonalResult(player) {
    document.getElementById('personal-player-name').textContent = player.name;
    document.getElementById('personal-brain').textContent = player.bids.brain;
    document.getElementById('personal-guts').textContent = player.bids.guts;
    document.getElementById('personal-muscle').textContent = player.bids.muscle;
    document.getElementById('personal-cards').textContent = player.ccs; // 顯示 CCS 而非 Cards
    document.getElementById('personal-energy').textContent = (player.results.energy >= 0 ? '+' : '') + player.results.energy;
    document.getElementById('personal-ap').textContent = player.results.ap;
    document.getElementById('personal-actions').textContent = player.results.actions; // 改為顯示獲得的行動點
    const reservedEl = document.getElementById('personal-reserved');
    if (reservedEl) reservedEl.textContent = player.results.reserved;

    // 計算潛在收益
    // const multipliers = TechTreeManager.getEffectiveMultipliers(player); // 暫時未使用，保留供未來擴充
    let huntReward = 1;
    if (TechTreeManager.hasTech(player, 'spear_hunting')) huntReward += 1;

    // 簡單預估：剩餘 AP * huntReward
    const potentialActions = player.actionPoints * huntReward;

    let nextTotal = player.energy + BASE_ENERGY + player.pendingEnergy + potentialActions;
    if (nextTotal < 0) nextTotal = 0;

    document.getElementById('personal-potentials').textContent = `+${potentialActions}`;
    document.getElementById('personal-final-next').textContent = nextTotal;

    const isLast = game.currentIndex >= game.players.length - 1;
    document.getElementById('next-player-btn').textContent = isLast ? '查看結算' : '交給下一位';

    showScreen('personalResult');
}

document.getElementById('next-player-btn').addEventListener('click', () => {
    game.currentIndex++;
    if (game.currentIndex >= game.players.length) {
        showResult();
    } else {
        showHandover();
    }
});

// === 結算畫面 ===
function showResult() {
    document.getElementById('result-round').textContent = game.round;
    document.getElementById('game-phase').textContent = `第 ${game.round} 回合結算`;

    // ─── 1. 結盟結算（先執行，影響後續掠奪過濾）───
    // 每次結盟：目標下回合 +1 能量；同時過濾掉盟友之間的掠奪
    const allianceSet = new Set(); // 儲存 "fromIdx-targetIdx" 對
    game.pendingAlliances.forEach(a => {
        const key = `${a.fromIndex}-${a.targetIndex}`;
        if (!allianceSet.has(key)) {
            allianceSet.add(key);
            const target = game.players[a.targetIndex];
            target.pendingEnergy += 1;       // 結盟禮物：目標下回合 +1 能量
            target.roundLog.gained += 1;
        }
    });
    // 過濾掉結盟雙方之間的掠奪（雙向皆保護）
    game.pendingAttacks = game.pendingAttacks.filter(att => {
        const blockedAtoT = game.pendingAlliances.some(a =>
            a.fromIndex === att.attackerIndex && a.targetIndex === att.targetIndex
        );
        const blockedTtoA = game.pendingAlliances.some(a =>
            a.fromIndex === att.targetIndex && a.targetIndex === att.attackerIndex
        );
        return !(blockedAtoT || blockedTtoA);
    });
    game.pendingAlliances = [];

    // ─── 2. 懲罰結算 ───
    game.pendingPunishments.forEach(p => {
        const target = game.players[p.targetIndex];
        target.pendingEnergy -= p.amount;
        target.roundLog.lost += p.amount;
    });
    game.pendingPunishments = [];

    // ─── 3. 掠奪結算（Delayed Resolution，確保所有防禦點已設定）───
    game.pendingAttacks.forEach(att => {
        const attacker = game.players[att.attackerIndex];
        const target = game.players[att.targetIndex];

        if (target.defensePoints > 0) {
            // 防禦成功
            target.defensePoints--;
        } else {
            // 攻擊成功
            // 攻擊者獲得 +2 (下回合生效 -> pendingEnergy)
            attacker.pendingEnergy += 2;
            attacker.roundLog.gained += 2;

            // 目標損失 -2 (下回合生效 -> pendingEnergy)
            target.pendingEnergy -= 2;
            target.roundLog.lost += 2;
        }
    });
    // 清空佇列，避免重複計算
    game.pendingAttacks = [];


    const winners = {
        brain: findWinner('brain'),
        guts: findWinner('guts'),
        muscle: findWinner('muscle')
    };

    const tbody = document.getElementById('result-body');
    tbody.innerHTML = '';

    let rubiconWinner = null;

    game.players.forEach(p => {
        const row = document.createElement('tr');
        // 修正：總可用能量 (預測下回合起始)
        let nextTotal = p.energy + BASE_ENERGY + p.pendingEnergy;
        if (nextTotal < 0) nextTotal = 0;

        // 生成行動階段的描述字串
        let actionStr = '';
        if (p.results.energy > 0) actionStr += `+${p.results.energy}(消化) `;
        if (p.roundLog.gained > 0) actionStr += `<span style="color:#4CAF50">+${p.roundLog.gained}(行動/結盟)</span> `;
        if (p.roundLog.lost > 0) actionStr += `<span style="color:#F44336">-${p.roundLog.lost}(被奪/懲罰)</span> `;
        if (actionStr === '') actionStr = '+0';

        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.bids.brain}${winners.brain === p.name ? ' ★' : ''}</td>
            <td>${p.bids.guts}${winners.guts === p.name ? ' ★' : ''}</td>
            <td>${p.bids.muscle}${winners.muscle === p.name ? ' ★' : ''}</td>
            <td><strong style="color:#e91e63">${p.ccs}</strong> <span style="font-size:0.8em; color:#888">(${p.unlockedTechs.length}項)</span></td>
            <td>${actionStr}</td>
            <td>${p.results.reserved}</td>
            <td>${nextTotal}</td>
        `;
        tbody.appendChild(row);

        // 檢查盧比孔門檻 (Custom CCS)
        if (p.ccs >= game.targetCCS) {
            rubiconWinner = p;
        }
    });

    if (rubiconWinner) {
        setTimeout(() => {
            alert(`${rubiconWinner.name} 已達成盧比孔門檻 (${game.targetCCS} CCS)，完成文化演化突破！`);
            showGameOver();
        }, 500);
        return;
    }

    showScreen('result');
}

function findWinner(field) {
    if (game.players.length < 2) return null;
    const sorted = [...game.players].sort((a, b) => b.bids[field] - a.bids[field]);
    if (sorted[0].bids[field] > 0 && sorted[0].bids[field] > sorted[1].bids[field]) {
        return sorted[0].name;
    }
    return null;
}

document.getElementById('next-round-btn').addEventListener('click', () => {
    if (game.round >= game.maxRounds) {
        showGameOver();
    } else {
        game.round++;
        game.currentIndex = 0;
        startRound();
    }
});

// 顯示勝利畫面 (技術勝利)
function showVictoryScreen(winner) {
    document.querySelector('.subtitle').textContent = '文化演化最終王者 (解鎖累積文化)';

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-score').textContent = winner.ccs;

    const ranked = [...game.players].sort((a, b) => {
        if (a === winner) return -1;
        if (b === winner) return 1;
        if (b.ccs !== a.ccs) return b.ccs - a.ccs;
        return b.energy - a.energy;
    });

    const tbody = document.getElementById('final-rank-body');
    tbody.innerHTML = '';
    ranked.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${p.name}${p === winner ? ' 🏆' : ''}</td>
            <td>${p.ccs}</td>
            <td>${p.energy}</td>
            <td>${p.unlockedTechs.length}</td>
        `;
        tbody.appendChild(row);
    });

    showScreen('gameOver');
}

function showGameOver() {
    document.querySelector('.subtitle').textContent = '文化演化最終王者';

    const ranked = [...game.players].sort((a, b) => {
        if (b.ccs !== a.ccs) return b.ccs - a.ccs;
        return b.energy - a.energy;
    });

    const winner = ranked[0];

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-score').textContent = winner.ccs;

    const tbody = document.getElementById('final-rank-body');
    tbody.innerHTML = '';
    ranked.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${p.name}${index === 0 ? ' 🏆' : ''}</td>
            <td>${p.ccs}</td>
            <td>${p.energy}</td>
            <td>${p.unlockedTechs.length}</td>
        `;
        tbody.appendChild(row);
    });

    showScreen('gameOver');
}

document.getElementById('restart-btn').addEventListener('click', () => {
    showScreen('setup');
});

// === 初始化 ===
initSetup();
