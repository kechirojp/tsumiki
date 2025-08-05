import * as path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { Box, Newline, render, Text } from "ink";
import React, { useEffect, useState } from "react";
import { getTarget, getTargetDir } from "../utils/target.js"; // Import the new utility

type InstallStatus =
  | "starting"
  | "checking"
  | "copying"
  | "completed"
  | "error";

interface InstallComponentProps {
  target?: string; // Receive target as a prop
}

const InstallComponent: React.FC<InstallComponentProps> = ({ target: cliTarget }) => { // Accept target prop
  const [status, setStatus] = useState<InstallStatus>("starting");
  const [copiedFiles, setCopiedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolvedTarget, setResolvedTarget] = useState<string>(""); // State to hold the resolved target

  useEffect(() => {
    const performInstall = async (): Promise<void> => {
      try {
        // Resolve the target (cliTarget -> config -> default)
        const target = await getTarget(cliTarget);
        setResolvedTarget(target); // Store the resolved target for display
        const targetDir = getTargetDir(target); // Get the target directory path

        setStatus("checking");

        // tsumikiのcommandsディレクトリを取得
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        // ビルド後はdist/commandsを参照（cli.jsがdist/にあるため）
        const tsumikiDir = path.join(__dirname, "commands");

        // ターゲットディレクトリが存在しない場合は作成
        await fs.ensureDir(targetDir);

        setStatus("copying");

        // commandsディレクトリ内のすべての.mdファイルと.shファイルを取得
        const files = await fs.readdir(tsumikiDir);
        const targetFiles = files.filter(
          (file) => file.endsWith(".md") || file.endsWith(".sh"),
        );

        const copiedFilesList: string[] = [];

        for (const file of targetFiles) {
          const sourcePath = path.join(tsumikiDir, file);
          const targetPath = path.join(targetDir, file);

          await fs.copy(sourcePath, targetPath);
          copiedFilesList.push(file);
        }

        setCopiedFiles(copiedFilesList);
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

    performInstall();
  }, [cliTarget]); // Add cliTarget as a dependency

  if (status === "starting") {
    return (
      <Box>
        <Text color="cyan">🚀 Tsumiki インストールを開始します...</Text>
      </Box>
    );
  }

  if (status === "checking") {
    return (
      <Box>
        <Text color="yellow">📋 環境をチェック中...</Text>
      </Box>
    );
  }

  if (status === "copying") {
    return (
      <Box>
        <Text color="blue">📝 コマンドテンプレートをコピー中...</Text>
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
    return (
      <Box flexDirection="column">
        <Text color="green">✅ インストールが完了しました!</Text>
        <Newline />
        <Text>ターゲット: {resolvedTarget}</Text>
        <Newline />
        <Text>コピーされたファイル ({copiedFiles.length}個):</Text>
        {copiedFiles.map((file) => (
          <Text key={file} color="gray">
            {"  • " + file}
          </Text>
        ))}
        <Newline />
        <Text color="cyan">
          {resolvedTarget === 'claude' ? 'Claude Code' : resolvedTarget === 'qwen' ? 'Qwen Code' : resolvedTarget}
        </Text>
        <Text color="cyan">で以下のようにコマンドを使用できます:</Text>
        <Text color="white">{"/tdd-requirements"}</Text>
        <Text color="white">{"/kairo-design"}</Text>
        <Text color="white">{"..."}</Text>
      </Box>
    );
  }

  return null;
};

// Modify the installCommand function to accept the target and pass it to the component
export const installCommand = (target?: string): void => {
  render(React.createElement(InstallComponent, { target }));
};
