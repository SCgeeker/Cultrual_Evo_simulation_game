// === 常數 ===
const TOTAL_ENERGY = 10;
const COSTS = { brain: 2, guts: 3, muscle: 2 };

// === 事件資料 ===
const EVENTS = [
    { id: 'dry_season', name: '乾季來臨', icon: '🌵', desc: '消化回報 ×1.5', effect: { guts: 1.5 } },
    { id: 'migration', name: '大型獵物遷徙', icon: '🦌', desc: '肌肉回報 ×1.5', effect: { muscle: 1.5 } },
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
        techs: ['language', 'group_identity', 'oral_tradition', 'teaching_system'],
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
        techs: ['gathering_knowledge', 'folk_biology', 'environmental_adaptation', 'information_resources']
    }
};

// === 技術卡資料 (AP 成本制) ===
const TECH_CARDS = {
    // ===== 路徑 A：外部消化路線 =====
    fire_control: {
        id: 'fire_control',
        name: '火的控制',
        path: 'digestion',
        tier: 1,
        cost: 2,
        icon: '🔥',
        effects: {
            digestionReduction: 0.20,  // 消化成本 -20%
            brainBonus: 0.10           // 大腦投資回報 +10%
        },
        description: '掌握火焰，開啟人類演化的關鍵一步',
        flavorText: '火讓我們能在夜間活動，驅趕掠食者，更重要的是——烹飪食物。'
    },
    cooking: {
        id: 'cooking',
        name: '烹飪技術',
        path: 'digestion',
        tier: 2,
        cost: 3,
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
        cost: 5,
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
        cost: 8,
        requires: ['food_preservation', 'complex_tools'], // 需要兩條路徑匯聚（任一即可）
        requiresAny: true, // 標記為「任一前置」而非「全部前置」
        icon: '🏛️',
        effects: {
            passiveEnergy: 5,          // 每回合 +5 能量
            muscleReduction: 0.50      // 肌肉投資成本減半
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
        cost: 2,
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
        cost: 3,
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
        cost: 5,
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
        cost: 8,
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
        requires: ['gathering_knowledge'],
        icon: '🦋',
        effects: {
            eventPreview: true,        // 環境事件可查看
            eventReroll: true          // 環境事件可重抽
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
        cost: 8,
        requires: ['environmental_adaptation'],
        icon: '📚',
        effects: {
            bonusAP: 2                 // 每回合額外 +2 AP
        },
        description: '系統化的知識管理，資訊本身成為資源',
        flavorText: '從口耳相傳到文字記錄，知識的累積開始加速。'
    }
};

// === 遊戲狀態 ===
const game = {
    players: [],
    currentIndex: 0,
    round: 1,
    maxRounds: 20,
    currentEvent: null,
    pendingAttacks: [], // 新增：暫存本回合所有攻擊，於結算時統一處理
    multipliers: { brain: 1, guts: 1, muscle: 1 }
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

    document.getElementById('start-btn').addEventListener('click', startGame);
}

function startGame() {
    const count = parseInt(document.getElementById('player-count').value);
    game.maxRounds = parseInt(document.getElementById('max-rounds').value) || 20;
    game.players = [];
    game.pendingAttacks = []; // 清空攻擊佇列

    for (let i = 0; i < count; i++) {
        const name = document.getElementById(`name-${i}`).value || `部落 ${i + 1}`;
        game.players.push({
            name,
            energy: TOTAL_ENERGY,
            totalCards: 0,
            // === 技術系統 (新版) ===
            unlockedTechs: [],   // 已解鎖的技術卡 ID 列表 (例如: ['fire_control', 'cooking'])
            pathProgress: {      // 各路徑的解鎖進度
                digestion: 0,    // 外部消化路線
                tools: 0,        // 工具製作路線
                social: 0,       // 社會學習路線
                environment: 0   // 環境知識路線
            },
            // === AP 系統 ===
            totalAP: 0,          // 歷史累計獲得的 AP (統計用)
            currentAP: 0,        // 當前持有的 AP (可累積，用於升級或行動)
            // === 戰鬥系統 ===
            defensePoints: 0,    // 當回合防禦點數 (不累積)
            pendingEnergy: 0,    // 暫存下回合的能量調整
            allies: [],          // 結盟對象的索引列表
            // === 回合資料 ===
            bids: { brain: 0, guts: 0, muscle: 0 },
            results: { cards: 0, energy: 0, ap: 0 },
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
    // 回合開始時清空上一回合的攻擊佇列 (以防萬一)
    game.pendingAttacks = [];

    game.players.forEach(p => {
        // 重置防禦點
        p.defensePoints = 0;
        // 重置回合紀錄
        p.roundLog = { lost: 0, gained: 0 };

        // 應用延遲的能量調整 (被掠奪的效果在此生效)
        // 確保 energy 不小於 0
        p.energy += p.pendingEnergy;
        if (p.energy < 0) p.energy = 0;
        p.pendingEnergy = 0; // 重置

        // 發放基礎能量 (回合開始時發放)
        if (game.round > 1) {
            p.energy += TOTAL_ENERGY;
        }
    });

    // 抽取隨機事件
    game.currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    // 重設乘數
    game.multipliers = { brain: 1, guts: 1, muscle: 1 };

    // 套用事件效果到乘數
    const eff = game.currentEvent.effect;
    if (eff.brain) game.multipliers.brain = eff.brain;
    if (eff.guts) game.multipliers.guts = eff.guts;
    if (eff.muscle) game.multipliers.muscle = eff.muscle;

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
    updateMultiplierBadges();
    updateInvestUI();

    showScreen('invest');
}

function updateMultiplierBadges() {
    ['brain', 'guts', 'muscle'].forEach(type => {
        const badge = document.getElementById(`mult-${type}`);
        const m = game.multipliers[type];
        if (m !== 1) {
            badge.textContent = `×${m}`;
            badge.classList.remove('hidden');
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

function calcRewardWithMultiplier(type, val) {
    const base = calcReward(type, val);
    return Math.floor(base * game.multipliers[type]);
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
    document.getElementById('reward-brain').textContent = calcRewardWithMultiplier('brain', bids.brain);
    document.getElementById('reward-guts').textContent = '+' + calcRewardWithMultiplier('guts', bids.guts);
    document.getElementById('reward-muscle').textContent = calcRewardWithMultiplier('muscle', bids.muscle);

    document.getElementById('reserved-energy').textContent = reserved;

    // 下回合總能量預估 (Forecast)
    // 預估值包含：目前保留 + 消化收益 + 基礎收入 (10) + 待處理的增減 (pendingEnergy)
    // 這裡的 pendingEnergy 還不知道本回合的掠奪結果 (因為還沒發生)，所以只能是 0 (因為 startRound 已清空)
    // 這樣沒問題，玩家只能看到已知的。
    const estimatedYield = calcRewardWithMultiplier('guts', bids.guts);
    const estimatedTotal = reserved + estimatedYield + TOTAL_ENERGY + player.pendingEnergy;

    document.getElementById('forecast-total').textContent = estimatedTotal >= 0 ? estimatedTotal : 0;

    const warning = document.getElementById('warning');
    const btn = document.getElementById('confirm-btn');

    const MAX_RESERVE = 5;

    if (reserved < 0) {
        warning.textContent = '超出預算！請減少投資。';
        warning.classList.remove('hidden');
        btn.disabled = true;
    } else if (reserved > MAX_RESERVE) {
        warning.textContent = `保留上限 ${MAX_RESERVE}！請再投資 ${reserved - MAX_RESERVE} 能量。`;
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
    const energyGain = calcRewardWithMultiplier('guts', player.bids.guts);

    player.results = {
        cards: calcRewardWithMultiplier('brain', player.bids.brain),
        energy: energyGain,
        ap: calcRewardWithMultiplier('muscle', player.bids.muscle), // 這是本回合"獲得"的
        reserved: reserved
    };

    // 累積文化成就分數（大腦投資的產出）
    // 注意：技術卡現在透過 TechTreeManager 以 AP 解鎖，不再自動發放
    player.totalCards += player.results.cards;
    player.totalAP += player.results.ap;
    player.currentAP += player.results.ap; // 加入現有庫存

    // 修正：這裡只計算當前剩餘能量 + 收益，作為本回合"剩餘資產" (可被掠奪)。
    // 下回合的 +10 基礎收入會在 startRound 統一發放。
    player.energy = reserved + energyGain;

    if (player.currentAP > 0) {
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

    // 檢查玩家是否滿足升級前置條件
    canUnlock(player, techId) {
        const tech = TECH_CARDS[techId];
        if (!tech) return false;

        // 已經解鎖
        if (player.unlockedTechs.includes(techId)) return false;

        // AP 不足
        if (player.currentAP < tech.cost) return false;

        // 檢查前置技術
        if (tech.requires) {
            if (tech.requiresAny) {
                // 任一前置即可
                const hasAny = tech.requires.some(req => player.unlockedTechs.includes(req));
                if (!hasAny) return false;
            } else {
                // 全部前置都要
                const hasAll = tech.requires.every(req => player.unlockedTechs.includes(req));
                if (!hasAll) return false;
            }
        }

        return true;
    },

    // 執行技術升級
    unlock(player, techId) {
        if (!this.canUnlock(player, techId)) return false;

        const tech = TECH_CARDS[techId];

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
        return player.unlockedTechs.includes(techId);
    },

    // 檢查玩家是否解鎖了某行動
    hasAction(player, actionName) {
        for (const techId of player.unlockedTechs) {
            const tech = TECH_CARDS[techId];
            if (tech && tech.unlocksAction) {
                if (Array.isArray(tech.unlocksAction)) {
                    if (tech.unlocksAction.includes(actionName)) return true;
                } else {
                    if (tech.unlocksAction === actionName) return true;
                }
            }
        }
        return false;
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

        // 計算進度
        const unlockedCount = path.techs.filter(techId =>
            player.unlockedTechs.includes(techId)
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
        const isUnlocked = player.unlockedTechs.includes(tech.id);
        const canUnlock = TechTreeManager.canUnlock(player, tech.id);
        const prereqMet = this.checkPrerequisites(player, tech);

        if (isUnlocked) {
            nodeEl.classList.add('unlocked');
        } else if (canUnlock) {
            nodeEl.classList.add('available');
        } else if (!prereqMet) {
            nodeEl.classList.add('locked');
        }

        nodeEl.innerHTML = `
            <div class="tech-node-icon">${tech.icon}</div>
            <div class="tech-node-name">${tech.name}</div>
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
        if (!tech.requires) return true;
        if (tech.requiresAny) {
            return tech.requires.some(req => player.unlockedTechs.includes(req));
        }
        return tech.requires.every(req => player.unlockedTechs.includes(req));
    },

    // 顯示技術卡彈窗
    showTechModal(player, tech) {
        this.currentTechId = tech.id;
        const modal = document.getElementById('tech-modal');
        const path = TECH_PATHS[tech.path];

        // 填入資料
        document.getElementById('modal-tech-icon').textContent = tech.icon;
        document.getElementById('modal-tech-name').textContent = tech.name;
        document.getElementById('modal-tech-path').textContent = path ? path.name : '';
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

        // 渲染解鎖行動
        if (tech.unlocksAction) {
            const actions = Array.isArray(tech.unlocksAction) ? tech.unlocksAction : [tech.unlocksAction];
            effectsEl.innerHTML += `
                <div class="tech-effect-item">
                    <span class="effect-icon">🔓</span>
                    <span>解鎖行動: <span class="effect-value">${actions.join(', ')}</span></span>
                </div>
            `;
        }

        // 渲染前置需求
        const reqEl = document.getElementById('modal-tech-requirements');
        if (tech.requires && tech.requires.length > 0) {
            const reqTexts = tech.requires.map(reqId => {
                const reqTech = TECH_CARDS[reqId];
                const hasTech = player.unlockedTechs.includes(reqId);
                const className = hasTech ? 'req-met' : 'req-missing';
                const icon = hasTech ? '✓' : '✗';
                return `<span class="${className}">${icon} ${reqTech ? reqTech.name : reqId}</span>`;
            });
            const reqType = tech.requiresAny ? '(任一)' : '(全部)';
            reqEl.innerHTML = `需要: ${reqTexts.join(' ')} ${reqType}`;
        } else {
            reqEl.innerHTML = '無前置需求';
        }

        // 更新按鈕狀態
        const unlockBtn = document.getElementById('modal-unlock-btn');
        const isUnlocked = player.unlockedTechs.includes(tech.id);
        const canUnlock = TechTreeManager.canUnlock(player, tech.id);

        if (isUnlocked) {
            unlockBtn.textContent = '已解鎖';
            unlockBtn.disabled = true;
        } else if (canUnlock) {
            unlockBtn.textContent = `解鎖 (${tech.cost} AP)`;
            unlockBtn.disabled = false;
        } else if (player.currentAP < tech.cost) {
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
            digestionReduction: `消化成本 -${Math.round(value * 100)}%`,
            brainBonus: `大腦投資回報 +${Math.round(value * 100)}%`,
            energyCapBonus: `能量上限 +${value}`,
            unlimitedStorage: '可無限儲存能量',
            passiveEnergy: `每回合 +${value} 能量`,
            muscleReduction: `肌肉投資成本 -${Math.round(value * 100)}%`,
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
            bonusAP: `每回合額外 +${value} AP`
        };
        return effectMap[key] || `${key}: ${value}`;
    },

    // 關閉彈窗
    closeModal() {
        document.getElementById('tech-modal').classList.add('hidden');
        this.currentTechId = null;
    },

    // 執行升級並更新 UI
    performUpgrade(player) {
        if (!this.currentTechId) return;

        const tech = TECH_CARDS[this.currentTechId];
        if (!tech) return;

        // 執行升級
        const success = TechTreeManager.unlock(player, this.currentTechId);
        if (success) {
            // 播放 AP 扣除動畫
            const apDisplay = document.getElementById('current-ap');
            apDisplay.classList.add('deducting');
            setTimeout(() => apDisplay.classList.remove('deducting'), 300);

            // 更新 AP 顯示
            apDisplay.textContent = player.currentAP;

            // 更新 tempState 的 AP (同步)
            if (typeof tempState !== 'undefined') {
                tempState.ap = player.currentAP;
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

            // 更新行動選項（如果解鎖了新行動）
            updateActionUI();
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
    ap: 0,
    energyChange: 0,
    defenseToAdd: 0,
    plunderTargets: [], // [{targetIndex, amount}]
    // 新增：計數器，用於UI顯示
    counts: {
        hunt: 0,
        farm: 0,
        defend: 0
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

    // 綁定按鈕
    document.getElementById('btn-hunt').onclick = () => performAction('hunt');
    document.getElementById('btn-defend').onclick = () => performAction('defend');

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
    tempState = {
        ap: player.currentAP, // 重置為實際擁有的 AP (含累積)
        energyChange: 0,
        defenseToAdd: 0,
        plunderTargets: [],
        counts: { hunt: 0, farm: 0, defend: 0 }
    };
    updateActionUI();
}

function updateActionUI() {
    document.getElementById('current-ap').textContent = tempState.ap;

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

    const btnHunt = document.getElementById('btn-hunt');
    const btnDefend = document.getElementById('btn-defend');
    const btnFarm = document.getElementById('btn-farm');
    const groupPlunder = document.getElementById('group-plunder');

    const hasAP = tempState.ap > 0;

    [btnHunt, btnDefend, groupPlunder].forEach(btn => {
        if (hasAP) btn.classList.remove('disabled');
        else btn.classList.add('disabled');
    });

    if (btnFarm) {
        const player = game.players[game.currentIndex];
        const isUnlocked = TechTreeManager.hasAction(player, 'farming');
        if (hasAP && isUnlocked) {
            btnFarm.classList.remove('disabled');
            btnFarm.disabled = false;
        } else {
            btnFarm.classList.add('disabled');
            if (!isUnlocked) {
                btnFarm.style.opacity = '0.5';
            }
        }
    }

    // 渲染掠奪目標
    const targetList = document.getElementById('plunder-targets');
    targetList.innerHTML = '';

    game.players.forEach((p, index) => {
        if (index !== game.currentIndex) {
            const btn = document.createElement('button');
            btn.className = 'btn-target';

            // 檢查次數
            const count = tempState.plunderTargets.filter(t => t.targetIndex === index).length;
            const plunderMark = count > 0 ? ` <span style="color:red">-${count * 2}</span>` : '';

            // 使用 initialEnergy 顯示，以保持戰爭迷霧
            const displayEnergy = (p.initialEnergy !== undefined) ? p.initialEnergy : p.energy;

            btn.innerHTML = `${p.name} <span class="energy-badge">⚡${displayEnergy}</span>${plunderMark}`;
            btn.onclick = () => performAction('plunder', index);

            // 增加 Badge 樣式給掠奪按鈕
            if (count > 0) {
                btn.style.border = '2px solid #ff5252';
                // 也可以加個 badge
                const badge = document.createElement('span');
                badge.textContent = count;
                badge.style.background = '#ff5252';
                badge.style.color = 'white';
                badge.style.borderRadius = '50%';
                badge.style.padding = '2px 6px';
                badge.style.marginLeft = '5px';
                badge.style.fontSize = '12px';
                btn.appendChild(badge);
            }

            if (!hasAP) {
                btn.disabled = true;
                btn.style.opacity = 0.5;
            }
            targetList.appendChild(btn);
        }
    });
}

function performAction(type, targetIndex) {
    if (tempState.ap < 1) return;

    if (type === 'hunt') {
        tempState.energyChange += 1;
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
        // tempState.energyChange += 2; // 修正：不要在這裡立即獲得能量，因為可能會被防禦。統一在回合結束結算。
        tempState.ap--;
    }

    updateActionUI();
}

document.getElementById('end-action-btn').addEventListener('click', () => {
    const player = game.players[game.currentIndex];

    // 1. 寫入行動結果
    player.currentAP = tempState.ap;
    player.energy += tempState.energyChange; // 獵/農的獲得，計入本人即時/下回合資金
    player.defensePoints += tempState.defenseToAdd;

    // 紀錄自己的收益 (農/獵，不含掠奪)
    player.roundLog.gained += tempState.energyChange;

    // 2. 處理攻擊請求
    // 修正：將所有掠奪請求推入全域佇列，留待回合結束統一解決
    tempState.plunderTargets.forEach(action => {
        game.pendingAttacks.push({
            attackerIndex: game.currentIndex,
            targetIndex: action.targetIndex,
            amount: 2
        });
    });

    finalizeTurn(player);
});

document.getElementById('info-confirm-btn').addEventListener('click', () => {
    const player = game.players[game.currentIndex];
    finalizeTurn(player);
});

function finalizeTurn(player) {
    player.totalCards += player.results.cards;
    player.totalAP += (player.bids.muscle * game.multipliers.muscle);

    showPersonalResult(player);
}

// === 個人結果畫面 ===
function showPersonalResult(player) {
    document.getElementById('personal-player-name').textContent = player.name;
    document.getElementById('personal-brain').textContent = player.bids.brain;
    document.getElementById('personal-guts').textContent = player.bids.guts;
    document.getElementById('personal-muscle').textContent = player.bids.muscle;
    document.getElementById('personal-cards').textContent = player.results.cards;
    document.getElementById('personal-energy').textContent = (player.results.energy >= 0 ? '+' : '') + player.results.energy;
    document.getElementById('personal-ap').textContent = player.results.ap;
    document.getElementById('personal-reserved').textContent = player.results.reserved;

    // 下回合可用 = 當前剩餘 + 10 + 待處理調整 (被掠奪)
    // 這裡顯示的尚未包含本回合之後可能發生的掠奪成功收益 (因為還沒結算)
    // 這是一個「暫定」預覽。
    let nextTotal = player.energy + TOTAL_ENERGY + player.pendingEnergy;
    if (nextTotal < 0) nextTotal = 0;

    document.getElementById('personal-next-total').textContent = nextTotal;

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

    // 修正：在此處統一解決所有攻擊 (Delayed Resolution)
    // 這樣可以確保所有玩家都設定好 defensePoints
    game.pendingAttacks.forEach(att => {
        const attacker = game.players[att.attackerIndex];
        const target = game.players[att.targetIndex];

        if (target.defensePoints > 0) {
            // 防禦成功
            target.defensePoints--;
            // 攻擊者無獲益，目標無損失
            // 紀錄顯示
            // attacker.roundLog.gained += 0; 
        } else {
            // 攻擊成功
            // 攻擊者獲得 +2 (下回合生效 -> pendingEnergy)
            attacker.pendingEnergy += 2;
            attacker.roundLog.gained += 2; // 更新日誌以顯示

            // 目標損失 -2 (下回合生效 -> pendingEnergy)
            target.pendingEnergy -= 2;
            target.roundLog.lost += 2; // 更新日誌以顯示
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
    game.players.forEach(p => {
        const row = document.createElement('tr');
        // 修正：總可用能量 (預測下回合起始)
        let nextTotal = p.energy + TOTAL_ENERGY + p.pendingEnergy;
        if (nextTotal < 0) nextTotal = 0;

        // 生成行動階段的描述字串
        let actionStr = '';
        if (p.results.energy > 0) actionStr += `+${p.results.energy}(消化) `;
        if (p.roundLog.gained > 0) actionStr += `<span style="color:#4CAF50">+${p.roundLog.gained}(行動)</span> `;
        if (p.roundLog.lost > 0) actionStr += `<span style="color:#F44336">-${p.roundLog.lost}(被奪)</span> `;
        if (actionStr === '') actionStr = '+0';

        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.bids.brain}${winners.brain === p.name ? ' ★' : ''}</td>
            <td>${p.bids.guts}${winners.guts === p.name ? ' ★' : ''}</td>
            <td>${p.bids.muscle}${winners.muscle === p.name ? ' ★' : ''}</td>
            <td>${p.results.cards} <span style="font-size:0.8em; color:#888">(${p.totalCards})</span></td>
            <td>${actionStr}</td>
            <td>${p.results.reserved}</td>
            <td>${nextTotal}</td>
        `;
        tbody.appendChild(row);
    });

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

function showGameOver() {
    const ranked = [...game.players].sort((a, b) => {
        if (b.totalCards !== a.totalCards) return b.totalCards - a.totalCards;
        if (b.energy !== a.energy) return b.energy - a.energy;
        return b.totalAP - a.totalAP;
    });

    const winner = ranked[0];

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-score').textContent = winner.totalCards;

    const tbody = document.getElementById('final-rank-body');
    tbody.innerHTML = '';
    ranked.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${p.name}${index === 0 ? ' 🏆' : ''}</td>
            <td>${p.totalCards}</td>
            <td>${p.energy}</td>
            <td>${p.totalAP}</td>
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
