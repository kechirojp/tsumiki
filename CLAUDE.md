# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

TsumikiはAI駆動開発フレームワークのコマンドテンプレートを提供するCLIツールです。このプロジェクトはTypeScript + ReactをInkで構成されたCLIアプリケーションで、Claude Code用のコマンドテンプレートをユーザーの`.claude/commands/`ディレクトリにインストールします。

## 開発コマンド

```bash
# 開発環境
pnpm install                # 依存関係のインストール

# ビルド
pnpm build                  # プロジェクトをビルドし、commandsディレクトリをdist/にコピー
pnpm build:run              # ビルド後、CLI実行（テスト用）

# コード品質
pnpm check                  # Biomeでコードチェック
pnpm fix                    # Biomeで自動修正
pnpm typecheck              # TypeScriptの型チェック（tsgoを使用）
pnpm secretlint             # シークレット情報の検査

# pre-commitフック
pnpm prepare                # simple-git-hooksのセットアップ
```

## プロジェクト構造

- **`src/cli.ts`**: CLIエントリーポイント、commanderを使用してコマンド定義
- **`src/commands/install.tsx`**: React + Inkを使用したインストールコマンドのUI実装
- **`commands/`**: TsumikiのAI開発フレームワーク用Claude Codeコマンドテンプレート（`.md`と`.sh`ファイル）
- **`dist/`**: ビルド出力、`dist/commands/`にテンプレートがコピーされる

## 技術スタック

- **CLI Framework**: Commander.js
- **UI Framework**: React + Ink（CLIでのReactレンダリング）
- **Build Tool**: tsup（TypeScript + ESBuildベース）
- **Code Quality**: Biome（リンタ・フォーマッタ）
- **TypeScript**: tsgo（高速型チェック）
- **Package Manager**: pnpm

## ビルドプロセス

ビルド時（`pnpm build`）は以下の処理が実行されます：
1. `dist`ディレクトリをクリーンアップ
2. `dist/commands`ディレクトリを作成
3. `commands/`内の`.md`と`.sh`ファイルを`dist/commands/`にコピー
4. tsupでTypeScriptコードをESMとCJSの両形式でビルド

## インストール動作

`tsumiki install`コマンドは以下を実行します：
1. 現在のディレクトリに`.claude/commands/`ディレクトリを作成
2. ビルド済みの`dist/commands/`から全ての`.md`と`.sh`ファイルをコピー
3. React + Inkでプログレス表示とファイル一覧を表示

## 品質管理

Pre-commitフックで以下が自動実行されます：
- `pnpm secretlint`: 機密情報のチェック
- `pnpm typecheck`: 型チェック
- `pnpm fix`: コードの自動修正

コード修正時は必ず`pnpm check`と`pnpm typecheck`を実行してからコミットしてください。