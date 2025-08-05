import * as path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { Box, Newline, render, Text } from "ink";
import React, { useEffect, useState } from "react";

type GitignoreStatus =
  | "starting"
  | "checking"
  | "updating"
  | "completed"
  | "skipped"
  | "error";

const GitignoreComponent: React.FC = () => {
  const [status, setStatus] = useState<GitignoreStatus>("starting");
  const [addedRules, setAddedRules] = useState<string[]>([]);
  const [skippedRules, setSkippedRules] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performGitignoreUpdate = async (): Promise<void> => {
      try {
        setStatus("checking");

        const currentDir = process.cwd();
        const gitignorePath = path.join(currentDir, ".gitignore");

        // tsumikiのcommandsディレクトリを取得
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        // ビルド後はdist/commandsを参照（cli.jsがdist/にあるため）
        const tsumikiDir = path.join(__dirname, "commands");

        // commandsディレクトリ内のすべての.mdファイルと.shファイルを取得
        const files = await fs.readdir(tsumikiDir);
        const targetFiles = files.filter(
          (file) => file.endsWith(".md") || file.endsWith(".sh"),
        );

        // 具体的なファイルパスをルールとして作成
        const rulesToAdd = targetFiles.map(
          (file) => `.qwen/commands/${file}`,
        );

        let gitignoreContent = "";
        let gitignoreExists = false;

        try {
          gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
          gitignoreExists = true;
        } catch {
          gitignoreExists = false;
        }

        const existingLines = gitignoreContent
          .split("\n")
          .map((line) => line.trim());
        const rulesToActuallyAdd: string[] = [];
        const rulesAlreadyExist: string[] = [];

        for (const rule of rulesToAdd) {
          if (existingLines.includes(rule)) {
            rulesAlreadyExist.push(rule);
          } else {
            rulesToActuallyAdd.push(rule);
          }
        }

        if (rulesToActuallyAdd.length === 0) {
          setSkippedRules(rulesAlreadyExist);
          setStatus("skipped");
          setTimeout(() => {
            process.exit(0);
          }, 2000);
          return;
        }

        setStatus("updating");

        let newContent = gitignoreContent;
        if (
          gitignoreExists &&
          gitignoreContent.length > 0 &&
          !gitignoreContent.endsWith("\n")
        ) {
          newContent += "\n";
        }

        if (gitignoreExists && gitignoreContent.length > 0) {
          newContent += "\n# Tsumiki command templates\n";
        } else {
          newContent = "# Tsumiki command templates\n";
        }

        for (const rule of rulesToActuallyAdd) {
          newContent += `${rule}\n`;
        }

        await fs.writeFile(gitignorePath, newContent);

        setAddedRules(rulesToActuallyAdd);
        setSkippedRules(rulesAlreadyExist);
        setStatus("completed");

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

    performGitignoreUpdate();
  }, []);

  if (status === "starting") {
    return (
      <Box>
        <Text color="cyan">🚀 .gitignore の更新を開始します...</Text>
      </Box>
    );
  }

  if (status === "checking") {
    return (
      <Box>
        <Text color="yellow">📋 .gitignore ファイルをチェック中...</Text>
      </Box>
    );
  }

  if (status === "updating") {
    return (
      <Box>
        <Text color="blue">✏️ .gitignore を更新中...</Text>
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

  if (status === "skipped") {
    return (
      <Box flexDirection="column">
        <Text color="yellow">⏭️ すべてのルールが既に存在します</Text>
        <Newline />
        <Text>既存のルール:</Text>
        {skippedRules.map((rule) => (
          <Text key={rule} color="gray">
            • {rule}
          </Text>
        ))}
        <Newline />
        <Text color="cyan">.gitignore の更新は不要でした</Text>
      </Box>
    );
  }

  if (status === "completed") {
    return (
      <Box flexDirection="column">
        <Text color="green">✅ .gitignore の更新が完了しました!</Text>
        <Newline />
        {addedRules.length > 0 && (
          <>
            <Text>追加されたルール ({addedRules.length}個):</Text>
            {addedRules.map((rule) => (
              <Text key={rule} color="green">
                • {rule}
              </Text>
            ))}
          </>
        )}
        {skippedRules.length > 0 && (
          <>
            <Text>既存のルール ({skippedRules.length}個):</Text>
            {skippedRules.map((rule) => (
              <Text key={rule} color="gray">
                • {rule}
              </Text>
            ))}
          </>
        )}
        <Newline />
        <Text color="cyan">
          Tsumiki のコマンドファイルが Git から無視されるようになりました
        </Text>
      </Box>
    );
  }

  return null;
};

export const gitignoreCommand = (): void => {
  render(React.createElement(GitignoreComponent));
};
