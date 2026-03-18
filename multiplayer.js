
/**
 * multiplayer.js — 文化演化賽局 LAN 多裝置模組（方案七）
 *
 * ⚠️  開發狀態：Beta
 * 目前為最簡化部署，遊戲邏輯驗證尚不完整，建議僅作課堂示範使用。
 *
 * 架構：
 *   主持人（Host）  — 執行全部遊戲邏輯，廣播狀態
 *   玩家（Player）  — 接收狀態並渲染，輪到自己時送出行動
 *   本機（Local）   — 預設模式，與原版完全相同
 */

// === 連線狀態 ===
const mp = {
    mode: 'local',      // 'local' | 'host' | 'player'
    ws: null,
    myPlayerIndex: -1,  // player 模式才有意義
    roomId: null,
    connected: false,
    myName: '',         // 玩家自訂名稱（player 端）
    playerNames: {}     // 玩家自訂名稱暫存（host 端）：{ playerIndex: name }
};

function mpIsLocal()  { return mp.mode === 'local'; }
function mpIsHost()   { return mp.mode === 'host'; }
function mpIsPlayer() { return mp.mode === 'player'; }
function mpIsMyTurn() {
    return mpIsPlayer() && mp.myPlayerIndex === game.currentIndex;
}

// ─────────────────────────────────────────
// 連線
// ─────────────────────────────────────────
function mpConnect(ip, port, roomId, role, playerName = '') {
    const url = `ws://${ip}:${port}/ws/${roomId}`;
    mp.roomId = roomId;
    mp.myName = playerName;

    const ws = new WebSocket(url);
    mp.ws = ws;

    ws.onopen = () => {
        mp.connected = true;
        const msg = { role, name: mp.myName };
        console.log('[MP] SEND handshake', msg);
        ws.send(JSON.stringify(msg));
    };
    ws.onmessage = e => mpHandleMessage(JSON.parse(e.data));
    ws.onclose   = () => {
        mp.connected = false;
        if (mpIsPlayer()) mpShowNotice('⚠️ 與伺服器連線中斷，請重新整理頁面', 'warn', 0);
    };
    ws.onerror   = () => {
        mpShowNotice('❌ 連線失敗，請確認 IP / Port 正確且裝置在同一 WiFi', 'warn', 0);
        document.getElementById('mp-connect-btn-host').disabled = false;
        document.getElementById('mp-connect-btn-player').disabled = false;
    };
}

// ─────────────────────────────────────────
// 廣播 / 送出行動
// ─────────────────────────────────────────
function broadcastState(phase) {
    if (!mpIsHost() || !mp.ws || !mp.connected) return;
    mp.ws.send(JSON.stringify({ type: 'stateUpdate', phase, game }));
}

function mpSendAction(action) {
    if (!mpIsPlayer() || !mp.ws || !mp.connected) {
        console.warn('[MP] mpSendAction blocked', { isPlayer: mpIsPlayer(), hasWs: !!mp.ws, connected: mp.connected, action });
        return;
    }
    console.log('[MP] SEND playerAction', action);
    mp.ws.send(JSON.stringify({ type: 'playerAction', action }));
}

// ─────────────────────────────────────────
// 訊息路由
// ─────────────────────────────────────────
function mpHandleMessage(data) {
    console.log('[MP] RECV', data);
    switch (data.type) {
        case 'welcome':          mpOnWelcome(data); break;
        case 'playerJoined':     mpOnPlayerJoined(data); break;
        case 'playerLeft':       mpOnPlayerLeft(data); break;
        case 'stateUpdate':      if (mpIsPlayer()) mpApplyRemoteState(data.game, data.phase); break;
        case 'playerAction':     if (mpIsHost())   mpProcessIncomingAction(data.playerIndex, data.action); break;
        case 'hostDisconnected':
            mpShowNotice('⚠️ 主持人已斷線，請等待重連...', 'warn', 0);
            document.getElementById('waiting-message').textContent = '主持人已斷線，請等待重連...';
            showScreen('waiting');
            break;
    }
}

function mpOnWelcome(data) {
    if (data.role === 'host') {
        mp.mode = 'host';
        document.getElementById('mp-host-badge').style.display = 'inline-block';
        mpShowNotice(`已連線為主持人（房間：${mp.roomId}）`, 'info', 4000);
        document.getElementById('mp-overlay').style.display = 'none';
        // 顯示房間代號橫幅（主持人全程可見）
        document.getElementById('mp-room-banner-id').textContent = mp.roomId;
        document.getElementById('mp-room-banner').style.display = 'block';
        showScreen('setup');
        // 主持人一連線就切換到連線版 UI
        mpRefreshRoster();
    } else {
        mp.mode = 'player';
        mp.myPlayerIndex = data.playerIndex;
        const displayName = mp.myName || `玩家 ${mp.myPlayerIndex + 1}`;
        const badge = document.getElementById('mp-player-badge');
        badge.textContent = `🎮 ${displayName}`;
        badge.style.display = 'inline-block';
        mpShowNotice(`已加入為「${displayName}」（玩家 ${mp.myPlayerIndex + 1}，房間：${mp.roomId}）`, 'info', 4000);
        document.getElementById('mp-overlay').style.display = 'none';
        document.getElementById('waiting-message').textContent = '等待主持人開始遊戲...';
        showScreen('waiting');
        // 立即透過 playerAction 通道告知主持人自訂名稱（不依賴 server 版本）
        if (mp.myName) {
            setTimeout(() => mpSendAction({ type: 'setName', name: mp.myName }), 50);
        }
    }
}

function mpOnPlayerJoined(data) {
    if (!mpIsHost()) return;
    const displayName = data.name || `玩家 ${data.playerIndex + 1}`;
    mpShowNotice(`「${displayName}」已加入（玩家 ${data.playerIndex + 1}），共 ${data.playerCount} 人連線`, 'info', 3000);
    const el = document.getElementById('mp-lobby-count');
    if (el) el.textContent = data.playerCount;
    if (data.name) {
        mp.playerNames[data.playerIndex] = data.name;
        if (game.players && game.players[data.playerIndex]) {
            game.players[data.playerIndex].name = data.name;
        }
    }
    mpRefreshRoster();
}

// 更新設定畫面的「已連線玩家」名牌列表
function mpRefreshRoster() {
    const list = document.getElementById('mp-roster-list');
    if (!list) return;
    list.innerHTML = '';
    const entries = Object.entries(mp.playerNames);
    if (entries.length === 0) {
        list.innerHTML = '<span style="color:#666;font-size:0.82rem;">（尚無玩家連線）</span>';
    } else {
        entries.forEach(([idx, name]) => {
            const chip = document.createElement('span');
            chip.style.cssText = 'background:#2e7d32;color:#e8f5e9;padding:3px 10px;border-radius:12px;font-size:0.85rem;';
            chip.textContent = `玩家${parseInt(idx) + 1}：${name}`;
            list.appendChild(chip);
        });
    }
}

function mpOnPlayerLeft(data) {
    if (!mpIsHost()) return;
    mpShowNotice(`⚠️ 玩家 ${data.playerIndex + 1} 已離線`, 'warn', 6000);
}

// ─────────────────────────────────────────
// 玩家端：套用遠端狀態
// ─────────────────────────────────────────
function mpApplyRemoteState(newGame, phase) {
    Object.assign(game, newGame);
    const cur = game.players[game.currentIndex];
    const mine = game.players[mp.myPlayerIndex];
    const isMyTurnNow = mp.myPlayerIndex === game.currentIndex;

    switch (phase) {
        case 'event':
            document.getElementById('event-round').textContent = game.round;
            document.getElementById('event-icon').textContent  = game.currentEvent.icon;
            document.getElementById('event-name').textContent  = game.currentEvent.name;
            document.getElementById('event-desc').textContent  = game.currentEvent.desc;
            document.getElementById('game-phase').textContent  = `第 ${game.round} 回合`;
            document.getElementById('event-continue-btn').style.display = 'none';
            showScreen('event');
            break;

        case 'handover':
        case 'invest':
            if (isMyTurnNow) {
                // 確保玩家投資畫面顯示自訂名稱（覆蓋遊戲狀態中的預設名稱）
                if (mp.myName) {
                    game.players[mp.myPlayerIndex].name = mp.myName;
                    // 輪到自己時再發一次 setName，確保主持人畫面同步
                    mpSendAction({ type: 'setName', name: mp.myName });
                }
                showInvest();
                // confirm-btn 的投資送出邏輯已在 app.js addEventListener 中統一處理
            } else {
                document.getElementById('waiting-message').textContent =
                    `等待 ${cur?.name ?? '...'} 進行投資中...`;
                showScreen('waiting');
            }
            break;

        case 'action':
            if (isMyTurnNow) {
                if (mp.myName) {
                    game.players[mp.myPlayerIndex].name = mp.myName;
                    mpSendAction({ type: 'setName', name: mp.myName });
                }
                initActionPhase(mine);
                // end-action-btn 已在 initActionPhase 中被玩家模式攔截
            } else {
                document.getElementById('waiting-message').textContent =
                    `等待 ${cur?.name ?? '...'} 進行行動決策中...`;
                showScreen('waiting');
            }
            break;

        case 'personalResult':
            if (isMyTurnNow) {
                if (mp.myName) game.players[mp.myPlayerIndex].name = mp.myName;
                showPersonalResult(mine);
                // 覆寫 next-player-btn：送出 nextPlayer 訊號給主持人
                document.getElementById('next-player-btn').onclick = () => {
                    mpSendAction({ type: 'nextPlayer' });
                };
            } else {
                document.getElementById('waiting-message').textContent =
                    `等待 ${cur?.name ?? '...'} 確認個人結果...`;
                showScreen('waiting');
            }
            break;

        case 'result':
            mpRenderResultScreen();
            break;

        case 'gameOver':
            mpRenderGameOver();
            break;

        default:
            document.getElementById('waiting-message').textContent = '等待主持人操作...';
            showScreen('waiting');
    }
}

// ─────────────────────────────────────────
// 玩家端：純顯示用渲染函數
// ─────────────────────────────────────────
function mpRenderResultScreen() {
    document.getElementById('result-round').textContent = game.round;
    document.getElementById('game-phase').textContent   = `第 ${game.round} 回合結算`;

    const tbody = document.getElementById('result-body');
    tbody.innerHTML = '';
    game.players.forEach(p => {
        const passiveBonus = TechTreeManager.getPassiveEnergy(p);
        const nextTotal    = p.energy + passiveBonus + game.bonusEnergy + p.pendingEnergy;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.bids.brain}</td>
            <td>${p.bids.guts}</td>
            <td>${p.bids.muscle}</td>
            <td><strong style="color:#e91e63">${p.ccs}</strong>
                <span style="font-size:0.8em;color:#888">(${p.unlockedTechs.length}項)</span></td>
            <td>—</td>
            <td>${p.results.reserved}</td>
            <td>${Math.max(0, nextTotal)}</td>
        `;
        tbody.appendChild(row);
    });
    // 玩家不能點「下一回合」，由主持人控制節奏
    document.getElementById('next-round-btn').style.display = 'none';
    showScreen('result');
    applyResultColMask();
}

function mpRenderGameOver() {
    const ranked = [...game.players].sort((a, b) =>
        b.ccs !== a.ccs ? b.ccs - a.ccs : b.energy - a.energy
    );
    const winner = ranked[0];
    document.querySelector('.subtitle').textContent    = game._endReason || '文化演化最終王者';
    document.getElementById('winner-name').textContent  = winner.name;
    document.getElementById('winner-score').textContent = winner.ccs;

    const tbody = document.getElementById('final-rank-body');
    tbody.innerHTML = '';
    ranked.forEach((p, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${p.name}${i === 0 ? ' 🏆' : ''}</td>
            <td>${p.ccs}</td><td>${p.energy}</td><td>${p.unlockedTechs.length}</td>
        `;
        tbody.appendChild(row);
    });
    showScreen('gameOver');
}

// ─────────────────────────────────────────
// 主持人端：處理玩家送來的行動
// ─────────────────────────────────────────
function mpProcessIncomingAction(playerIndex, action) {
    // 名稱同步：不受當前回合限制，任何時間點均可更新
    if (action.type === 'setName') {
        console.log('[MP] setName received', { playerIndex, name: action.name, playerNames_before: {...mp.playerNames} });
        if (action.name) {
            mp.playerNames[playerIndex] = action.name;
            mpRefreshRoster();
            if (game.players && game.players[playerIndex]) {
                game.players[playerIndex].name = action.name;
                if (playerIndex === game.currentIndex) {
                    const lbl = document.getElementById('current-player-label');
                    if (lbl) lbl.textContent = action.name;
                    const aName = document.getElementById('action-player-name');
                    if (aName) aName.textContent = action.name;
                }
            }
        }
        return;
    }

    if (playerIndex !== game.currentIndex) return; // 安全檢查

    if (action.type === 'invest') {
        // 套用滑桿值後執行現有 confirmInvest() 邏輯
        sliders.brain.value  = action.brain;
        sliders.guts.value   = action.guts;
        sliders.muscle.value = action.muscle;
        document.getElementById('value-brain').textContent  = action.brain;
        document.getElementById('value-guts').textContent   = action.guts;
        document.getElementById('value-muscle').textContent = action.muscle;
        confirmInvest();

    } else if (action.type === 'endAction') {
        // 套用玩家行動結果到 game 狀態（等同 end-action-btn 的提交邏輯）
        const player = game.players[playerIndex];
        player.energy        += action.energyChange;
        player.defensePoints += action.defenseToAdd;
        player.roundLog.gained += Math.max(0, action.energyChange);
        player.actionPoints   = action.remainingAP;
        player.currentAP      = action.techAP;

        action.unlockedTechs.forEach(techId => {
            if (!player.unlockedTechs.includes(techId)) {
                player.unlockedTechs.push(techId);
                const tech = TECH_CARDS[techId];
                if (tech && player.pathProgress[tech.path] !== undefined) {
                    player.pathProgress[tech.path] =
                        Math.max(player.pathProgress[tech.path], tech.tier);
                }
            }
        });
        player.ccs = TechTreeManager.calculateCCS(player);

        action.plunderTargets?.forEach(a =>
            game.pendingAttacks.push({ attackerIndex: playerIndex, targetIndex: a.targetIndex, amount: 2 }));
        action.allyTargets?.forEach(a =>
            game.pendingAlliances.push({ fromIndex: playerIndex, targetIndex: a.targetIndex }));
        action.punishTargets?.forEach(a =>
            game.pendingPunishments.push({ attackerIndex: playerIndex, targetIndex: a.targetIndex, amount: 1 }));

        showPersonalResult(player);
        broadcastState('personalResult');

    } else if (action.type === 'nextPlayer') {
        // 玩家確認個人結果，主持人推進到下一位
        game.currentIndex++;
        if (game.currentIndex >= game.players.length) {
            showResult();
        } else {
            showHandover();
            broadcastState('handover');
        }
    }
}

// ─────────────────────────────────────────
// UI 工具
// ─────────────────────────────────────────
function mpShowNotice(msg, type = 'info', duration = 4000) {
    const el = document.getElementById('mp-notice');
    if (!el) return;
    el.textContent  = msg;
    el.className    = `mp-notice mp-notice-${type}`;
    el.style.display = 'block';
    if (duration > 0) setTimeout(() => { el.style.display = 'none'; }, duration);
}

// ─────────────────────────────────────────
// Overlay 初始化（在 initSetup() 之後呼叫）
// ─────────────────────────────────────────
function mpInitOverlay() {
    // 自動填入瀏覽器網址的 IP（學生從教師機網址開啟時已帶有正確 IP）
    const ipInput = document.getElementById('mp-server-ip');
    const browserHost = window.location.hostname;
    if (browserHost && browserHost !== '') {
        ipInput.value = browserHost;
    }

    document.getElementById('mp-open-btn').addEventListener('click', () => {
        document.getElementById('mp-overlay').style.display = 'flex';
    });
    document.getElementById('mp-overlay-close').addEventListener('click', () => {
        document.getElementById('mp-overlay').style.display = 'none';
    });

    document.getElementById('mp-connect-btn-host').addEventListener('click', () => {
        const ip   = document.getElementById('mp-server-ip').value.trim() || 'localhost';
        const port = document.getElementById('mp-server-port').value.trim() || '8080';
        const room = document.getElementById('mp-room-id').value.trim() || 'room1';
        document.getElementById('mp-connect-btn-host').disabled   = true;
        document.getElementById('mp-connect-btn-player').disabled = true;
        mpConnect(ip, port, room, 'host');
    });

    document.getElementById('mp-connect-btn-player').addEventListener('click', () => {
        const ip   = document.getElementById('mp-server-ip').value.trim();
        const port = document.getElementById('mp-server-port').value.trim() || '8080';
        const room = document.getElementById('mp-room-id').value.trim() || 'room1';
        const name = document.getElementById('mp-player-name').value.trim();
        if (!ip) { alert('請輸入伺服器 IP'); return; }
        document.getElementById('mp-connect-btn-host').disabled   = true;
        document.getElementById('mp-connect-btn-player').disabled = true;
        mpConnect(ip, port, room, 'player', name);
    });

}
