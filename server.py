#!/usr/bin/env python3
"""
文化演化賽局 — LAN 多裝置伺服器（方案七）

用法：
  cd cost-of-culture-game
  python server.py [--port 8080]

需求：pip install fastapi uvicorn websockets
  或：pip install -r requirements.txt
"""

import asyncio
import json
import socket
import sys

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="文化演化賽局 LAN 伺服器")

# 房間狀態
# rooms[room_id] = {
#     "host":    WebSocket | None,
#     "players": list[WebSocket | None],   # 索引 = playerIndex
#     "game":    dict | None,
#     "phase":   str
# }
rooms: dict = {}


def get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


async def safe_send(ws: WebSocket, data: dict):
    """安全送出，忽略已斷線的連接"""
    try:
        await ws.send_json(data)
    except Exception:
        pass


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str):
    await ws.accept()

    # 初始化房間
    if room_id not in rooms:
        rooms[room_id] = {"host": None, "players": [], "playerNames": {}, "game": None, "phase": "lobby"}
    room = rooms[room_id]

    player_index = -1
    role = "unknown"

    try:
        # 等待身份識別（10 秒超時）
        init = await asyncio.wait_for(ws.receive_json(), timeout=10.0)
        role = init.get("role", "player")
        player_name = init.get("name", "").strip()

        if role == "host":
            room["host"] = ws
            await safe_send(ws, {
                "type": "welcome",
                "role": "host",
                "playerCount": len([p for p in room["players"] if p is not None])
            })
            print(f"[{room_id}] 主持人已連線")

        else:
            player_index = len(room["players"])
            room["players"].append(ws)
            room["playerNames"][player_index] = player_name
            display = f"「{player_name}」" if player_name else f"玩家 {player_index}"
            await safe_send(ws, {
                "type": "welcome",
                "role": "player",
                "playerIndex": player_index,
                "name": player_name
            })
            print(f"[{room_id}] {display} 已連線（共 {len(room['players'])} 人）")

            # 通知主持人（含玩家名稱）
            if room["host"]:
                await safe_send(room["host"], {
                    "type": "playerJoined",
                    "playerIndex": player_index,
                    "playerCount": len([p for p in room["players"] if p is not None]),
                    "name": player_name
                })

            # 若遊戲進行中，同步目前狀態
            if room["game"]:
                await safe_send(ws, {
                    "type": "stateUpdate",
                    "game": room["game"],
                    "phase": room["phase"]
                })

        # 主訊息迴圈
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "stateUpdate" and role == "host":
                # 主持人廣播狀態 → 存檔並轉發給所有玩家
                room["game"] = data.get("game")
                room["phase"] = data.get("phase", "")
                for p in room["players"]:
                    if p:
                        await safe_send(p, data)

            elif msg_type == "playerAction" and role == "player":
                # 玩家行動 → 轉發給主持人
                if room["host"]:
                    await safe_send(room["host"], {
                        "type": "playerAction",
                        "playerIndex": player_index,
                        "action": data.get("action", {})
                    })

    except (WebSocketDisconnect, asyncio.TimeoutError):
        pass
    except Exception as e:
        print(f"[{room_id}] 例外：{e}")
    finally:
        if role == "host":
            room["host"] = None
            print(f"[{room_id}] 主持人已斷線")
            for p in room["players"]:
                if p:
                    await safe_send(p, {
                        "type": "hostDisconnected",
                        "message": "主持人已斷線，請等待重連"
                    })
        elif 0 <= player_index < len(room["players"]):
            room["players"][player_index] = None
            print(f"[{room_id}] 玩家 {player_index} 已斷線")
            if room["host"]:
                await safe_send(room["host"], {
                    "type": "playerLeft",
                    "playerIndex": player_index
                })


# 靜態遊戲檔案（從目前目錄 cost-of-culture-game/ 提供）
app.mount("/", StaticFiles(directory=".", html=True), name="static")


if __name__ == "__main__":
    port = 8080
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        if idx + 1 < len(sys.argv):
            port = int(sys.argv[idx + 1])

    local_ip = get_local_ip()
    print("=" * 52)
    print("  🎮  文化演化賽局 LAN 伺服器")
    print("=" * 52)
    print(f"  本機 IP  ：{local_ip}")
    print(f"  學生連線 ：http://{local_ip}:{port}")
    print(f"  主持人   ：http://localhost:{port}")
    print("=" * 52)
    print("  所有裝置需在同一 WiFi 網路")
    print("  按 Ctrl+C 停止伺服器")
    print("=" * 52)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")
