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

// === 遊戲狀態 ===
const game = {
    players: [],
    currentIndex: 0,
    round: 1,
    currentEvent: null,
    multipliers: { brain: 1, guts: 1, muscle: 1 },
    energyBonus: 0
};

// === DOM 元素 ===
const screens = {
    setup: document.getElementById('screen-setup'),
    event: document.getElementById('screen-event'),
    handover: document.getElementById('screen-handover'),
    invest: document.getElementById('screen-invest'),
    personalResult: document.getElementById('screen-personal-result'),
    result: document.getElementById('screen-result')
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
    game.players = [];
    for (let i = 0; i < count; i++) {
        const name = document.getElementById(`name-${i}`).value || `部落 ${i + 1}`;
        game.players.push({
            name,
            energy: TOTAL_ENERGY, // 追蹤每位玩家的能量
            bids: { brain: 0, guts: 0, muscle: 0 },
            results: { cards: 0, energy: 0, ap: 0 }
        });
    }
    game.currentIndex = 0;
    game.round = 1;
    startRound();
}

// === 回合開始：顯示事件 ===
function startRound() {
    // 抽取隨機事件
    game.currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    // 重設乘數
    game.multipliers = { brain: 1, guts: 1, muscle: 1 };
    game.energyBonus = 0;

    // 套用事件效果到乘數
    const eff = game.currentEvent.effect;
    if (eff.brain) game.multipliers.brain = eff.brain;
    if (eff.guts) game.multipliers.guts = eff.guts;
    if (eff.muscle) game.multipliers.muscle = eff.muscle;
    if (eff.energyBonus) game.energyBonus = eff.energyBonus;

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
    // 乘數在結算時套用，這裡僅計算基礎值
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

    // 結算時套用乘數
    const energyGain = calcRewardWithMultiplier('guts', player.bids.guts) + game.energyBonus;

    player.results = {
        cards: calcRewardWithMultiplier('brain', player.bids.brain),
        energy: energyGain,
        ap: calcRewardWithMultiplier('muscle', player.bids.muscle),
        reserved: reserved
    };

    // 計算下回合能量：保留 + 獲得 + 基礎收入(10)
    player.energy = reserved + energyGain + TOTAL_ENERGY;

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
    document.getElementById('personal-next-total').textContent = player.energy;

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

    const winners = {
        brain: findWinner('brain'),
        guts: findWinner('guts'),
        muscle: findWinner('muscle')
    };

    const tbody = document.getElementById('result-body');
    tbody.innerHTML = '';
    game.players.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.bids.brain}${winners.brain === p.name ? ' ★' : ''}</td>
            <td>${p.bids.guts}${winners.guts === p.name ? ' ★' : ''}</td>
            <td>${p.bids.muscle}${winners.muscle === p.name ? ' ★' : ''}</td>
            <td>${p.results.cards}</td>
            <td>${p.results.energy >= 0 ? '+' : ''}${p.results.energy}</td>
            <td>${p.results.reserved}</td>
            <td>${p.energy}</td>
            <td>${p.results.ap}</td>
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
    game.round++;
    game.currentIndex = 0;
    startRound();
});

// === 初始化 ===
initSetup();
