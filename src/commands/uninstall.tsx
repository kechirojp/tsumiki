import * as path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { Box, Newline, render, Text } from "ink";
import React, { useEffect, useState } from "react";
import { getTarget, getTargetDir } from "../utils/target.js"; // Import the new utility

type UninstallStatus =
  | "starting"
  | "checking"
  | "removing"
  | "completed"
  | "error"
  | "not_found";

interface UninstallComponentProps {
  target?: string; // Receive target as a prop
}

const UninstallComponent: React.FC<UninstallComponentProps> = ({ target: cliTarget }) => { // Accept target prop
  const [status, setStatus] = useState<UninstallStatus>("starting");
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolvedTarget, setResolvedTarget] = useState<string>(""); // State to hold the resolved target

  useEffect(() => {
    const performUninstall = async (): Promise<void> => {
      try {
        // Resolve the target (cliTarget -> config -> default)
        const target = await getTarget(cliTarget);
        setResolvedTarget(target); // Store the resolved target for display
        const targetDir = getTargetDir(target); // Get the target directory path

        setStatus("checking");

        // ターゲットディレクトリが存在するかチェック
        const dirExists = await fs.pathExists(targetDir);
        if (!dirExists) {
          setStatus("not_found");
          setTimeout(() => {
            process.exit(0);
          }, 2000);
          return;
        }

        // tsumikiのcommandsディレクトリを取得
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        // ビルド後はdist/commandsを参照（cli.jsがdist/にあるため）
        const tsumikiDir = path.join(__dirname, "commands");

        // tsumikiのファイル一覧を取得
        const tsumikiFiles = await fs.readdir(tsumikiDir);
        const tsumikiTargetFiles = tsumikiFiles.filter(
          (file) => file.endsWith(".md") || file.endsWith(".sh"),
        );

        setStatus("removing");

        // ターゲットディレクトリ内のファイルをチェックして、tsumiki由来のファイルのみ削除
        const installedFiles = await fs.readdir(targetDir);
        const removedFilesList: string[] = [];

        for (const file of installedFiles) {
          if (tsumikiTargetFiles.includes(file)) {
            const filePath = path.join(targetDir, file);
            await fs.remove(filePath);
            removedFilesList.push(file);
          }
        }

        // 削除後にターゲットディレクトリが空になったかチェック
        const remainingFiles = await fs.readdir(targetDir);
        if (remainingFiles.length === 0) {
          // 空のディレクトリを削除
          await fs.rmdir(targetDir);
          // 親ディレクトリ (.claude or .qwen) も空の場合は削除
          const parentDir = path.dirname(targetDir);
          const parentFiles = await fs.readdir(parentDir);
          if (parentFiles.length === 0) {
            await fs.rmdir(parentDir);
          }
        }

        setRemovedFiles(removedFilesList);
        setStatus("completed");

        // 2秒後に終了
        setTimeout(() => {
          process.exit(0);
        }, 2000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setStatus("error");

        setTimeout(() => {
          process.exit(1);
        }, 3000);
      }
    };

    performUninstall();
  }, [cliTarget]); // Add cliTarget as a dependency

  if (status === "starting") {
    return (
      <Box>
        <Text color="cyan">🗑️ Tsumiki アンインストールを開始します...</Text>
      </Box>
    );
  }

  if (status === "checking") {
    return (
      <Box>
        <Text color="yellow">📋 インストール状況をチェック中...</Text>
      </Box>
    );
  }

  if (status === "removing") {
    return (
      <Box>
        <Text color="blue">🗑️ コマンドテンプレートを削除中...</Text>
      </Box>
    );
  }

  if (status === "not_found") {
    return (
      <Box flexDirection="column">
        <Text color="yellow">
          ⚠️ {getTargetDir(resolvedTarget).replace(process.cwd(), '').slice(1)} ディレクトリが見つかりません
        </Text>
        <Text color="gray">Tsumikiはインストールされていないようです。</Text>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ エラーが発生しました:</Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  if (status === "completed") {
    if (removedFiles.length === 0) {
      return (
        <Box flexDirection="column">
          <Text color="yellow">⚠️ 削除対象のファイルが見つかりませんでした</Text>
          <Text color="gray">
            Tsumikiのコマンドはインストールされていないようです。
          </Text>
      </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text color="green">✅ アンインストールが完了しました!</Text>
        <Newline />
        <Text>ターゲット: {resolvedTarget}</Text>
        <Newline />
        <Text>削除されたファイル ({removedFiles.length}個):</Text>
        {removedFiles.map((file) => (
          <Text key={file} color="gray">
            {"  • " + file}
          </Text>
        ))}
        <Newline />
        <Text color="cyan">
          Tsumikiの{resolvedTarget === 'claude' ? 'Claude Code' : resolvedTarget === 'qwen' ? 'Qwen Code' : resolvedTarget}コマンドテンプレートが削除されました。
        </Text>
      </Box>
    );
  }

  return null;
};

// Modify the uninstallCommand function to accept the target and pass it to the component
export const uninstallCommand = (target?: string): void => {
  render(React.createElement(UninstallComponent, { target }));
};
