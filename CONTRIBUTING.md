# コントリビューションガイド

Tsumikiプロジェクトへのコントリビューションをありがとうございます！このガイドでは、プロジェクトに貢献する方法について説明します。

## 開発環境のセットアップ

### 必要な環境

- Node.js 18.0.0以上
- pnpm 10.13.1以上

### セットアップ手順

1. リポジトリをフォークしてクローンします：

```bash
git clone https://github.com/YOUR_USERNAME/tsumiki.git
cd tsumiki
```

2. 依存関係をインストールします：

```bash
pnpm install
```

3. pre-commitフックをセットアップします：

```bash
pnpm prepare
```

## 開発ワークフロー

### ブランチ戦略

- `main`ブランチ：安定版のコード
- 機能開発：`feature/機能名`
- バグ修正：`bugfix/バグ名`
- ホットフィックス：`hotfix/修正内容`

### 開発手順

1. 新しいブランチを作成します：

```bash
git checkout -b feature/your-feature-name
```

2. コードを変更します

3. コード品質チェックを実行します：

```bash
# 型チェック
pnpm typecheck

# コードチェック
pnpm check

# 自動修正
pnpm fix

# 機密情報チェック
pnpm secretlint
```

4. ビルドテストを実行します：

```bash
pnpm build:run
```

5. 変更をコミットします：

```bash
git add .
git commit -m "feat: 新機能の追加"
```

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/)形式を使用してください：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイル変更（機能に影響しない）
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` ビルドプロセスやツール変更

例：
```
feat: add new install command for .sh files
fix: resolve path handling issue in install command
docs: update README with new command examples
```

## コード品質基準

### 自動チェック

Pre-commitフックで以下が自動実行されます：

- **secretlint**: 機密情報（APIキー、パスワードなど）の混入チェック
- **typecheck**: TypeScriptの型チェック
- **fix**: Biomeによるコードの自動修正

### 手動チェック

変更前に以下のコマンドを実行してください：

```bash
# 全てのチェックを実行
pnpm typecheck && pnpm check && pnpm secretlint

# コードの自動修正
pnpm fix
```

## プロジェクト構造

```
tsumiki/
├── src/
│   ├── cli.ts              # CLIエントリーポイント
│   └── commands/
│       └── install.tsx     # インストールコマンドのUI実装
├── commands/               # コマンドテンプレート（.md, .sh）
├── dist/                  # ビルド出力
├── package.json
├── CLAUDE.md              # プロジェクト指示書
└── README.md
```

## プルリクエスト

### プルリクエストの作成

1. 変更をプッシュします：

```bash
git push origin feature/your-feature-name
```

2. GitHubでプルリクエストを作成します

3. プルリクエストテンプレートに従って説明を記載します

### プルリクエストの要件

- [ ] 変更内容が明確に説明されている
- [ ] 関連するIssueがリンクされている（該当する場合）
- [ ] コード品質チェックが通っている
- [ ] ビルドが成功している
- [ ] 機密情報が含まれていない

## Issue報告

バグ報告や機能要望は[Issues](https://github.com/classmethod/tsumiki/issues)で受け付けています。

### バグ報告

以下の情報を含めてください：

- 再現手順
- 期待される動作
- 実際の動作
- 環境情報（OS、Node.jsバージョンなど）
- エラーメッセージ（該当する場合）

### 機能要望

以下の情報を含めてください：

- 提案する機能の説明
- ユースケース
- 期待される利益
- 実装案（あれば）

## セキュリティ

セキュリティに関する問題を発見した場合は、公開のIssueではなく、プライベートに報告してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。コントリビューションする際は、このライセンスに同意したものとみなされます。

## 質問・サポート

- [Issues](https://github.com/classmethod/tsumiki/issues) - バグ報告、機能要望
- [Discussions](https://github.com/classmethod/tsumiki/discussions) - 質問、議論

コントリビューションをお待ちしています！