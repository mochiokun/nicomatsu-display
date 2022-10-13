# nicomatsu-display
nicomatsu-displayは、nicomatsuで送信されたコメントやスタンプを画面上の資料などに重ねて表示するためのアプリです。
  * [nicomatsu](https://github.com/mochiokun/nicomatsu-server):Web会議での双方向コミュニケーションを目的としたコメント・アンケートツールです。

# Features
発表やWebミーティングの際に画面共有元で利用することで、資料の上にコメントやスタンプを重ねて共有が可能となる。
アンケート結果も表示されるので、合わせて画面共有することでリアルタイムな集計結果を共有可能である。

# Requirement
node.jsとnpm、electronのインストールが必要。
アプリを再ビルドしてインストーラを作成する場合はelectron-builderが必要となる。

### Dependencies
* node.js
* npm
* electron v11.2.3
* electron-builder　v22.9.1

### OS
Windows10でのみ動作確認ができている
Windows10： 動作確認済み
mac: 動作未確認
Linux mint： 動作不可

# Usage with Installer
* [windows10用インストーラ](https://github.com/mochiokun/nicomatsu-display/archive/refs/tags/installer_win10_v3.0.0.zip)
Windows10用には上記のリンクよりインストーラをダウンロードしてインストールされたい。
※前提として[nicomatsu-server](https://github.com/mochiokun/nicomatsu-server)がHeroku上にデプロイ済みであること。
1. 接続先のHerokuアプリ名を入力。
2. プロキシ環境下の場合は認証用のウィンドウが開くので、プロキシサーバのID/PWで認証する。
    * プロキシサーバは本ツールに依るものではないため、ID/PWが不明、認証エラーなどは各自が利用されているネットワーク管理者に確認すること。
3. ルーム名（同時開催時の部屋分け用）の入力ウィンドウが開くので入力してログインする。
4. 3画面（コントローラ・アンケート・コメント表示画面）が起動する
    * コメント表示画面は背景やメニューバーなどを透過させているので、一見は2画面起動しているように見える。
    * nicomatsu-serverでBasic認証をOnにしている場合は、認証画面が表示される。
5. コントローラで操作した内容が弾幕コメントやスタンプとなって画面表示される、アンケートに反映される。
6. 外部から投稿する場合は、コントローラ画面下部のQRコードの読み取り、またはURLを共有すること。
    * コントローラ画面のURL: `https://[YourHerokuAppName],herokuapp.com/controller/[ルーム名]`　

## Caution
* マルチディスプレイを使用している場合、メインディスプレイのサイズでウィンドウが開かれる。コメント表示画面はサイズ変更不可なので、メインディスプレイの設定に注意されたい。
* 資料を全画面表示した場合でも、タスクバーが前面に張り付き下部を見えなくすることがある。Webミーティングの共有で「画面すべて」を共有することで解消する想定である。
* 「画面すべての共有」「nicomatsuと発表資料のみの共有」のいずれを行っても、nicomatsuを共有した場合は背景に写っている画面が共有される。そのため画面共有したくない資料やアプリからの通知ポップアップなどが共有されることがあるため、「開く資料を最低限にする」「アプリやOSの設定で一時的に通知をOFFにする」などで対処されたい。
* リモートデスクトップを全画面で行った場合、リモート側の画面にはコメントが表示されないことがある。（最前面の表示がリモートデスクトップに奪われるため）事前に資料を移動させるか、リモートデスクトップを最大化しないなどの対応を試していただきたい。
* コメント表示用の透明画面には閉じるボタンがないため、タスクバーより閉じるようお願いする。

# Usage with Source
上記インストーラが利用できない場合は、ソースコードをダウンロードして利用されたい。
1. ソースコードのフォルダ内で `npm ci` を実行。
    * プロキシ環境下の場合は、npmでプロキシ通信できる状態にしておくこと。（下記サイトを紹介する）
      * [Qiita:[Node.js] npm の proxy と registry 設定 @LightSpeedC](https://qiita.com/LightSpeedC/items/b273735e909bd381bcf1)
      * [Qiita:Proxy環境でElectronインストールしようとしたら隠れた罠があったんです @LuckyRetriever](https://qiita.com/LuckyRetriever/items/2f377b1ce34f7d12903c)

2. 同フォルダで `npm start`を実行。
3. 入力ウィンドウが開くので以降はUsage with Installer と同様の操作となる。

## アプリをインストーラとしてパッケージして配布したい場合
ソースコードの格納されているフォルダで下記コマンドを実行することで、Windows/mac向けのインストーラが作成される。
※macを含むWindows10以外のOSについては動作を確認できていない。（トラブル時はElectron builderのキーワードでググって解決策を探していただきたい）
```npm
# Windows用のインストーラー(.exe)が作成される
npx electron-builder --win --x64

# Mac用のインストーラー(.dmg)が作成される ※動作未確認
npx electron-builder --mac --x64
```
* 注意：Windowsでユーザ名に全角文字を含む場合、electron-builderがエラーとなる。
  * ユーザ名/AppDataがASCIIのパスになるよう移動する（他アプリでも利用されるフォルダのため危険）
  * ASCIIのユーザ名でアカウントを作成しなおす（推奨）
　* [参考サイト:Electron-builderでパスに日本語を含んでいる場合はビルド出来ない](https://www.suzu6.net/posts/259-electron-build-utf8/)

## 接続先URLを固定またはHeroku以外としたい場合
1. `src/main.js` の接続先サーバのURL定義部分を修正し、`hrokuAppNameChangeableFlg`を`false`に設定する。
``` javascript
// サーバ接続先のURL
let serverUrl = 'https://YourServerURL:2525';　//nicomatsuサーバのポートは2525

// 接続先URL（HerokuApp名）を入力して変更したい場合はtrue
// 本設定をtrueにした場合、上記のserverUrlは無視される
const hrokuAppNameChangeableFlg = false; //falseに変更する
```
3. Usage with Sourceを参考に利用する。（接続先の入力画面が表示されない）

# Author
Takuya Komatsubara @mochiokun

# License
nicomatsu-display is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).

# Request from Author
Windows10とLinuxmint環境しか保有していないので、macなど他OSで動作確認できた場合は実施方法などを共有いただきたい。
