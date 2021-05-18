 /**
 * preload.js
 * ContextBridgeを利用してレンダラプロセスでIPC送信を使えるようにする
 */
const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        // Fromレンダラ Toメインでルーム名を送信する
        sendRoom: (url, roomName) => {
            ipcRenderer.send("room-name", url, roomName);
        },
        // Fromレンダラ Toメインでプロキシ認証のログイン情報を送信する
        sendProxyAuth: (username, password) => {
            ipcRenderer.send("proxy-auth", username, password);
        },
        // Fromレンダラ Toメインで接続先情報を送信する
        sendAppName: (herokuAppName) => {
            ipcRenderer.send("heroku-app-name", herokuAppName);
        }
    }
);
