"use strict";

// サーバ接続先のURL
let serverUrl = 'https://nicomatsu.herokuapp.com';

// 接続先URL（HerokuApp名）を入力して変更したい場合はtrue
// 本設定をtrueにした場合、上記のserverUrlは無視される
const hrokuAppNameChangeableFlg = true; //true or false　デフォルト：true

const electron = require('electron');
const elc_app = electron.app;
const elc_BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const path = require('path');
let connectWindow;      // 接続先HerokuApp名の入力用のWindow
let inputWindow;        // 接続先ルーム名の入力用のWindow
let loginWindow;        // 認証情報の入力用のWindow
let displayWindow;      // コメント表示用のWindow（透明化）
let controllerWindow;   // 投稿用ページ表示用のWindow
let surveyWindow;       // アンケートページ表示用のWindow

// ログイン認証の重複発火対策
let isLoginWindow = false;

//読み込み時イベント
elc_app.on('ready', function (event) {
  if(hrokuAppNameChangeableFlg){
    // HerokuApp名を入力可能にしている場合は、アプリ名入力画面を開く
    connectWindow = new electron.BrowserWindow({
        width: 500,
        height: 220,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: __dirname + '/preload.js'
        }
    });
    // 前面に表示
    connectWindow.setAlwaysOnTop(true);
    connectWindow.loadURL('file://' + __dirname + '/connect.html');
  }else{
    // URL固定の場合はルーム名入力画面を開く
    inputWindow = new electron.BrowserWindow({
        width: 500,
        height: 220,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: __dirname + '/preload.js'
        }
    });
    // 前面に表示
    inputWindow.setAlwaysOnTop(true);
    // ルーム名入力前にプロキシのログイン要求を発生させたいので、サーバアクセスしてstartNewページを取得
    inputWindow.loadURL(serverUrl+'/startNew');
  }
});

//接続先入力時のイベント
ipcMain.on("heroku-app-name", (event, herokuAppName)=>{
  serverUrl = 'https://' + herokuAppName + '.herokuapp.com/startNew';
  inputWindow = new electron.BrowserWindow({
      width: 500,
      height: 220,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: __dirname + '/preload.js'
      }
  });
  // 前面に表示
  inputWindow.setAlwaysOnTop(true);

  // ルーム名入力前にプロキシのログイン要求を発生させたいので、サーバアクセスしてstartNewページを取得
  inputWindow.loadURL(serverUrl);
  // 接続先入力ウィンドウを閉じる
  connectWindow.close();
});



// ログイン要求時に発火するイベント
elc_app.on("login", (event, webContents, request, authInfo, callback)=>{
    // 重複発火対策
    if(!isLoginWindow){
        isLoginWindow = true;
    }
    else{
        return;
    }
    // 認証情報が送信されるまで待機
    event.preventDefault();
    loginWindow = new electron.BrowserWindow({
        width: 500,
        height: 220,
        resizable: false,
        webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: __dirname + '/preload.js'
        }
    });

    // 前面に表示
    loginWindow.setAlwaysOnTop(true);

    // ログイン情報の入力ウィンドウをロード
    loginWindow.setMenu(null);
    // Proxy認証なのかコメント表示用のBasic認証がわかるようにログイン画面を出し分け
    if(authInfo.isProxy){
      loginWindow.loadURL('file://' + __dirname + '/login.html');
    }else{
      loginWindow.loadURL('file://' + __dirname + '/basicAuth.html');
    }

    // IPCチャネル"proxy-auth"で受信待機
    ipcMain.once("proxy-auth", (event, username, password)=>{

        // 受信した認証情報をプロキシサーバーへ転送
        callback(username, password);
        isLoginWindow = false;
        // ログインウィンドウを閉じる
        loginWindow.close();
    });
});

//レンダラプロセスでルーム名が送信されたら動作
//IPC通信で起動してるサーバのURL（末尾/）とルーム名を受け取る
ipcMain.on("room-name", (event, url, roomName)=>{
  console.log(roomName);
  console.log(url);

  //接続先のURLを設定
  const displayUrl =url + 'display/' + roomName;
  const controllerUrl = url + 'controller/' + roomName;
  const surveyUrl = url + 'survey/' + roomName;
  //ディスプレイウィンドウを全画面表示するためにメインディスプレイのサイズ取得
  const size = electron.screen.getPrimaryDisplay().size;

  //ディスプレイ用の透明なウィンドウを作成
  displayWindow = new electron.BrowserWindow({
    // フルスクリーンだと透明にならないので-2pxずつ減らす(electronnのissue27286の対応策)
    width: size.width - 2,
    height: size.height - 2,
    frame: false,
    show: true,
    transparent: true,
    resizable: false,
    webPreferences: {nodeIntegration: false}
  });
  displayWindow.setIgnoreMouseEvents(true);
  displayWindow.maximize();
  displayWindow.setAlwaysOnTop(true);

//  displayWindow.openDevTools();   //Debug用開発者ツール開く
     //ディスプレイURLのロード
  displayWindow.loadURL(displayUrl);


  //コントローラ用のウィンドウを作成
  controllerWindow = new electron.BrowserWindow({
    center: true,
    width: size.width*0.5,
    height: size.height,
    x: 0,
    y: 0,
    frame: true,
    show: true,
    transparent: false,
    resizable: true,
    webPreferences: {nodeIntegration: false}
  });

  //コントローラURLのロード
  controllerWindow.loadURL(controllerUrl);


  //アンケート用のウィンドウを作成
  surveyWindow = new electron.BrowserWindow({
    center: true,
    width: size.width*0.5,
    height: size.height,
    x: size.width*0.5,
    y: 0,
    frame: true,
    show: true,
    transparent: false,
    resizable: true,
    webPreferences: {nodeIntegration: false}
  });

  //アンケート用のURLのロード
  surveyWindow.loadURL(surveyUrl);
});
