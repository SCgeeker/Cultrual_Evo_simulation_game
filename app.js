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

// === 技術卡資料 (簡單實作) ===
const TECH_CARDS = [
    { id: 'agriculture', name: '農業發展', type: 'passive', desc: '解鎖行動 [農耕]' },
    { id: 'pottery', name: '陶器製作', type: 'passive', desc: '作為文化標誌' },
    { id: 'weaving', name: '紡織技術', type: 'passive', desc: '作為文化標誌' },
    { id: 'mining', name: '礦產開發', type: 'passive', desc: '作為文化標誌' }
];

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
            techs: [],           // 已獲得的技術卡名稱列表
            totalAP: 0,
            currentAP: 0,        // 當前持有的 AP (可累積)
            defensePoints: 0,    // 當回合防禦點數 (不累積)
            pendingEnergy: 0,    // 暫存下回合的能量調整
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

    // 發放技術卡
    if (player.results.cards > 0) {
        drawTechCards(player, player.results.cards);
    }

    // 累積總分與 AP
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

function drawTechCards(player, count) {
    for (let i = 0; i < count; i++) {
        if (!player.techs.includes('農業發展')) {
            player.techs.push('農業發展');
        } else {
            // 其他技術...
        }
    }
}

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
            <p class="desc-text">(需農業發展卡)</p>
        `;
        optionsDiv.insertBefore(btnFarm, document.getElementById('btn-defend'));
    }

    btnFarm.onclick = () => performAction('farm');

    // 檢查解鎖狀態
    if (player.techs.includes('農業發展')) {
        btnFarm.classList.remove('locked');
        btnFarm.title = "";
    } else {
        btnFarm.classList.add('locked');
        btnFarm.title = "需要獲得 [農業發展] 技術卡解鎖";
        btnFarm.onclick = null;
        btnFarm.style.opacity = '0.5';
        btnFarm.style.cursor = 'not-allowed';
    }

    document.getElementById('reset-action-btn').onclick = () => resetTempState(player);

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
        const isUnlocked = player.techs.includes('農業發展');
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
