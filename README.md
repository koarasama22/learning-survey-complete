# 学習時間アンケート（Vercel + Firebase 版）

学校で複数日にわたって実施する「学習時間アンケート」システムです。  
従来の Google Apps Script + Spreadsheet から、**Next.js + Firebase + Vercel** に完全移行した完成版です。

## 主な機能

### 生徒側（`/`）
- クラス選択（2-1 〜 2-5）
- 出席番号入力（初回のみ、以降は localStorage に記憶）
- 学習時間（0〜600分）入力
- 全角数字の自動半角変換
- 直近5分以内の同一分数再送信時に確認モーダル
- 送信後「これまでの合計時間」を表示
- 出席番号変更はパスワード（デフォルト: `12345`）で保護
- `window.prompt / alert / confirm` は一切使わず、すべて画面内モーダル

### 先生側（`/admin`）
- パスコード保護（デフォルト: `sensei2026`）
- クラスタブ切り替え
- 出席番号ごとの「送信回数・合計分・平均分」一覧表
- **グラフ可視化**（合計時間ランキング棒グラフ + 送信回数分布円グラフ）
- **学期リセット**（クラス単位 / 全クラス一括）

## 技術スタック

| 層 | 技術 |
|----|------|
| フロントエンド | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| グラフ | Recharts |
| データベース | Firebase Cloud Firestore |
| ホスティング | Vercel |
| 認証 | 簡易パスコード（ヘッダー検証） |

## セットアップ手順

### 1. 依存関係インストール
```bash
npm install
```

### 2. Firebase プロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestore を有効化（本番モードで開始し、後でルールを適用）
3. プロジェクト設定 → サービスアカウント → 新しい秘密鍵を生成（JSONダウンロード）
4. Webアプリを追加して設定値を取得

### 3. 環境変数設定
`.env.example` をコピーして `.env.local` を作成し、値を埋めます。

```bash
cp .env.example .env.local
```

### 4. Firestore セキュリティルール
`firestore.rules` の内容を Firebase Console → Firestore → ルール に貼り付けて公開してください。  
**クライアントからの直接読み書きを禁止**し、すべて Admin SDK（API Routes）経由にしています。

### 5. ローカル起動
```bash
npm run dev
```
- 生徒画面: http://localhost:3000
- 先生画面: http://localhost:3000/admin

### 6. Vercel デプロイ
1. GitHub にリポジトリを push
2. Vercel で Import
3. Environment Variables に `.env.local` の内容をすべて登録
4. Deploy

## データ構造

```
classes/{classId}/students/{attendanceNumber}
{
  attendanceNumber: "12",
  times: [45, 60, 30],      // 送信するたびに追記（日付は持たない）
  totalMinutes: 135,
  submitCount: 3,
  lastSubmittedAt: "2026-...",
  updatedAt: "2026-..."
}
```

## デフォルトパスワード

| 用途 | 値 |
|------|-----|
| 先生用パスコード | `sensei2026` |
| 出席番号変更 | `12345` |

※ 本番運用前に必ず変更してください。

## 注意事項

- パスワードは簡易的なものです。本格的な運用では Firebase Authentication の導入を推奨します。
- Firestore の書き込みはすべてサーバーサイド（Admin SDK）で行うため、セキュリティルールは厳格に「すべて拒否」にしています。
- 学期リセットは取り消しできません。必要に応じて事前にエクスポートしてください。

## ライセンス

学校内利用を想定した個人・教育用途向けです。
