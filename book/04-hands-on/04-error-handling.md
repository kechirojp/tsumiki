# 4.4 エラーハンドリングとデバッグ

## 学習目標

この章では、AITDD開発中に発生する各種エラーの対処法と効果的なデバッグ手法を習得します：

- AI生成コード特有のエラーパターンの理解
- プロンプト起因エラーの特定と修正方法
- 効率的なデバッグプロセスの確立
- 手動実装への切り替え判断とその実践
- エラー予防のためのベストプラクティス

## エラーの分類と対処戦略

AITDD開発では、従来の開発とは異なる種類のエラーが発生します。これらを適切に分類し、それぞれに応じた対処法を適用することが重要です。

### エラーの基本分類

**1. プロンプト起因エラー**
- 指示の曖昧さによるもの
- 要件の不明確さによるもの
- コンテキスト不足によるもの

**2. AI実装起因エラー**
- AI生成コードのバグ
- 既存コードとの整合性問題
- パフォーマンス問題

**3. 統合起因エラー**
- 複数機能統合時の問題
- インターフェース不整合
- 依存関係の問題

**4. 従来型エラー**
- 一般的なプログラミングエラー
- 環境設定の問題
- 外部依存の問題

## 実践的デバッグプロセス

### ステップ1：エラー情報の包括的収集

エラーが発生した場合、まず情報を系統的に収集します。

**収集する情報**：
```markdown
## エラー情報収集チェックリスト

### 基本情報
- [ ] エラーメッセージ（完全版）
- [ ] スタックトレース
- [ ] 発生タイミング
- [ ] 実行環境

### コンテキスト情報
- [ ] 実行されたコマンド
- [ ] 入力データ
- [ ] 期待していた動作
- [ ] 実際の動作

### AI関連情報
- [ ] 使用したプロンプト
- [ ] AI生成コードの該当部分
- [ ] 関連する既存コード

### 実行環境
- [ ] OS・ブラウザ情報
- [ ] Node.js/TypeScriptバージョン
- [ ] 依存パッケージの状態
```

**情報収集の実例**：
```
エラー発生時の記録例：

エラーメッセージ：
TypeError: Cannot read property 'map' of undefined
    at getAllTasks (TaskController.ts:15)
    at Router.handle (express/lib/router/layer.js:95)

発生タイミング：
GET /api/tasks エンドポイントのテスト実行時

入力データ：
GET http://localhost:3000/api/tasks

期待動作：
空配列を含むレスポンスが返される

実際の動作：
undefined に対して map を呼び出しエラー

使用プロンプト：
「TaskManagerクラスの getAllTasks メソッドを呼び出してレスポンスを返すAPIエンドポイントを実装してください」
```

### ステップ2：AIによる原因分析

収集した情報を全てAIに渡し、エラーの原因分析を依頼します。

**効果的な分析プロンプト**：
```
以下のエラーについて原因を分析してください：

## エラー情報
[収集したエラー情報を全て貼り付け]

## 関連コード
[エラーが発生したソースコード一式]

## 分析要求
1. エラーの直接的な原因
2. 根本的な原因（設計・実装の問題）
3. プロンプト起因の可能性
4. 修正方針の提案
5. 類似エラーの予防策

できるだけ具体的で実践的な分析をお願いします。
```

**AIによる分析例**：
```
## エラー分析結果

### 直接的な原因
TaskController.getAllTasks メソッドで、taskManager.getAllTasks() が undefined を返している

### 根本的な原因
1. TaskManagerクラスのインスタンス化に問題
2. getAllTasks メソッドの実装でタスク配列が初期化されていない

### プロンプト起因の可能性
「既存のTaskManagerクラスを使用」という指示が曖昧で、
実際のクラス定義を確認せずに実装した可能性

### 修正方針
1. TaskManagerクラスの初期化を確認
2. getAllTasks メソッドの戻り値を検証
3. null/undefined チェックを追加

### 予防策
1. 既存コードの詳細をプロンプトに含める
2. 戻り値の型安全性を強化
3. 単体テストでnull/undefined ケースを追加
```

### ステップ3：段階的調査と仮説検証

AIの分析に基づいて、段階的に問題を調査します。

**調査手順例**：
```typescript
// 1. TaskManagerクラスの状態確認
describe('TaskManagerデバッグ', () => {
  test('TaskManagerインスタンス化確認', () => {
    const manager = new TaskManager();
    console.log('TaskManager instance:', manager);
    expect(manager).toBeDefined();
  });

  test('getAllTasks戻り値確認', () => {
    const manager = new TaskManager();
    const result = manager.getAllTasks();
    console.log('getAllTasks result:', result);
    console.log('result type:', typeof result);
    expect(result).toBeDefined();
  });

  test('タスク配列の初期状態確認', () => {
    const manager = new TaskManager();
    const tasks = manager.getAllTasks();
    expect(Array.isArray(tasks)).toBe(true);
    console.log('Initial tasks array:', tasks);
  });
});
```

**デバッグ実行**：
```bash
npm test -- --verbose TaskManagerデバッグ
```

### ステップ4：AIと協力した修正実装

調査結果をAIにフィードバックし、修正実装を依頼します。

**修正依頼プロンプト**：
```
デバッグ調査の結果、以下が判明しました：

## 調査結果
[デバッグテストの出力結果]

## 判明した問題
1. TaskManagerクラスの配列初期化が不適切
2. getAllTasks メソッドの戻り値がundefined

## 修正要求
以下を満たす修正を実装してください：
1. 配列が適切に初期化される
2. 型安全性が確保される
3. null/undefined チェックが追加される
4. 既存のテストが通る
5. 新しいテストケースも追加

修正後のコードと、修正理由の説明もお願いします。
```

## プロンプト起因エラーの特定と修正

### プロンプト問題の判断基準

**頻度による判定**：
```
同様のエラーパターンの発生状況：
- 1回目：実装エラーとして処理
- 2回目：プロンプト問題の可能性を検討
- 3回目：プロンプト修正必須
```

**典型的なプロンプト問題の兆候**：
- 同じ要求で異なる実装が生成される
- 期待と大きく異なる出力
- 既存コードを意図せず修正
- 指示範囲を超えた実装

### プロンプト問題の修正プロセス

#### 1. プロンプト診断

**AIによる診断依頼**：
```
以下のプロンプトを分析し、問題点を指摘してください：

## 使用したプロンプト
[問題のあったプロンプト]

## 期待した結果
[期待していた出力]

## 実際の結果
[実際の出力]

## 診断要求
1. プロンプトの曖昧な部分
2. 不足している情報
3. 誤解を招く可能性がある表現
4. 改善提案
```

#### 2. プロンプト改善案の作成

**改善プロンプトの例**：
```
改善前（問題のあったプロンプト）：
「TaskManagerクラスを使ってAPIエンドポイントを作成してください」

改善後：
「以下の既存TaskManagerクラスを使用し、GET /api/tasks エンドポイントを実装してください。

既存コード：
[TaskManagerクラスの完全なコード]

要件：
1. 既存コードは一切変更しない
2. Express.jsのRouterを使用
3. レスポンス形式：{ success: boolean, data: Task[] }
4. エラーハンドリングを含める
5. TypeScriptの型安全性を確保

出力形式：
- routes/tasks.ts ファイル
- controllers/TaskController.ts ファイル
- 対応するテストファイル」
```

#### 3. 改善プロンプトの検証

**検証プロセス**：
```typescript
describe('プロンプト改善検証', () => {
  test('改善前プロンプトでの問題再現', async () => {
    // 問題のあったプロンプトで実装を依頼
    // 期待する問題が発生することを確認
  });

  test('改善後プロンプトでの解決確認', async () => {
    // 改善されたプロンプトで実装を依頼
    // 問題が解決されることを確認
  });

  test('改善プロンプトの副作用確認', async () => {
    // 改善により新たな問題が発生していないことを確認
  });
});
```

## 手動実装への切り替え判断

### 切り替えタイミングの判断

**実装開始前の判断**：
```markdown
## 手動実装検討チェックリスト

### 実装イメージの有無
- [ ] 具体的な実装手順が思い浮かぶ
- [ ] 使用する技術・ライブラリが明確
- [ ] 実装の落とし穴が予測できる

### 技術的複雑さ
- [ ] パフォーマンス最適化が必要
- [ ] 複雑なアルゴリズムが必要
- [ ] 深いドメイン知識が必要

### AIへの説明困難度
- [ ] 要件を明確に言語化できない
- [ ] プロンプトが異常に長くなる
- [ ] 前提知識の説明が困難
```

**実装中の切り替え判断**：
```
切り替え判断の基準：
1. 同じエラーが3回以上発生
2. プロンプト修正でも解決しない
3. デバッグ時間が実装時間を超過
4. AI生成コードの品質が一貫しない
```

### 効果的な手動実装アプローチ

#### 段階的AI併用戦略

**完全手動ではなく、部分的AI活用**：
```typescript
// 1. 複雑なロジック部分は手動実装
const complexAlgorithm = (data: any[]) => {
  // 手動で実装（AIに説明困難な部分）
  let result = [];
  for (let i = 0; i < data.length; i++) {
    // 複雑な計算ロジック
  }
  return result;
};

// 2. 定型的なコードはAIに依頼
const generateApiResponse = (data: any) => {
  // この部分はAIで生成可能
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      count: Array.isArray(data) ? data.length : 1
    }
  };
};

// 3. 組み合わせて最終実装
export const processData = async (inputData: any[]) => {
  try {
    const processedData = complexAlgorithm(inputData); // 手動部分
    return generateApiResponse(processedData); // AI生成部分
  } catch (error) {
    // エラーハンドリングもAI支援可能
  }
};
```

#### 手動実装でのAI支援活用

**1. IDE補完機能の活用**：
```typescript
// VS Code等のAI補完を積極的に使用
const taskManager = new TaskManager();
// ↑ここでAI補完が効く部分は活用
```

**2. 部分的なコード生成依頼**：
```
明確な実装イメージがある部分のAI依頼例：

「以下の型定義に基づいて、バリデーション関数を作成してください：

interface TaskInput {
  title: string;
  description?: string;
}

要件：
- titleは1-100文字必須
- descriptionは0-500文字任意
- 不正な場合は具体的なエラーメッセージ
- TypeScriptの型ガードとして機能
```

#### 品質プロセスの継続

**手動実装でもValidationステップは必須**：
```
手動実装のValidationチェック項目：
1. 仕様要件との整合性
2. 型安全性の確保
3. エラーハンドリングの適切性
4. テストカバレッジの確認
5. パフォーマンスの妥当性
6. コードの可読性・保守性
```

## エラー予防のベストプラクティス

### プロンプト設計の改善

**1. コンテキストの明確化**：
```
良いプロンプト例：

「以下の既存システムに新機能を追加してください：

既存コード：
[関連する全てのコードを貼り付け]

新機能要件：
[具体的で明確な要件]

制約条件：
- 既存コードは変更禁止
- TypeScript型安全性確保
- エラーハンドリング必須

期待する出力：
- 実装コード
- テストコード
- 使用例
- 注意点」
```

**2. 段階的な実装指示**：
```
複雑な機能の段階的実装：

「以下を段階的に実装してください：

ステップ1：インターフェース設計
ステップ2：基本実装
ステップ3：エラーハンドリング
ステップ4：テスト作成

各ステップで確認を取りながら進めてください。」
```

### テスト戦略の強化

**1. AI生成コード特有のテスト**：
```typescript
describe('AI生成コード検証テスト', () => {
  test('意図しない既存コード修正がないことを確認', () => {
    // 既存の重要な関数が変更されていないことをテスト
    const originalFunction = require('./legacy/original-module');
    expect(originalFunction.criticalMethod).toBeDefined();
    expect(typeof originalFunction.criticalMethod).toBe('function');
  });

  test('推測による実装範囲の確認', () => {
    // AIが推測で実装した部分が要件内であることを確認
    const implementation = new FeatureImplementation();
    expect(implementation.getImplementedFeatures())
      .toEqual(expect.arrayContaining(REQUIRED_FEATURES));
  });

  test('型安全性の確認', () => {
    // TypeScriptの型チェックが正しく機能することを確認
    // コンパイルエラーが発生しないことをテスト
  });
});
```

**2. 統合テストの強化**：
```typescript
describe('機能統合テスト', () => {
  test('3機能統合でのレグレッション確認', async () => {
    // 3つの機能が組み合わされても正常動作することをテスト
    const feature1 = await executeFeature1();
    const feature2 = await executeFeature2(feature1.result);
    const feature3 = await executeFeature3(feature2.result);
    
    expect(feature3.result).toMatchExpectedOutput();
  });
});
```

### 継続的改善プロセス

**1. エラーパターンの蓄積**：
```markdown
## エラーパターン管理

### 発生頻度の高いエラー
1. undefined/null アクセスエラー
   - 原因：AI生成コードでの初期化不足
   - 対策：明示的な初期化指示

2. 型不整合エラー
   - 原因：プロンプトでの型情報不足
   - 対策：型定義を明示的に提供

3. 既存コード改変エラー
   - 原因：「変更禁止」指示の不徹底
   - 対策：具体的な制約指示
```

**2. プロンプトテンプレートの改善**：
```
改善されたプロンプトテンプレート：

### 基本テンプレート
```
機能: [機能名]
実装対象: [具体的な実装内容]

既存コード:
[関連コード全て]

要件:
[明確で具体的な要件]

制約:
- 既存コードは変更禁止
- [その他の制約]

出力要求:
- [期待する出力形式]

品質要件:
- TypeScript型安全性
- エラーハンドリング
- テストコード含む
```

## 実践的デバッグテクニック

### ログベースデバッグ

**効果的なログ出力**：
```typescript
// デバッグ用ログヘルパー
class DebugLogger {
  static log(context: string, data: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${context}]`, {
        timestamp: new Date().toISOString(),
        data: JSON.stringify(data, null, 2)
      });
    }
  }

  static error(context: string, error: any) {
    console.error(`[ERROR:${context}]`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

// 使用例
export const taskController = {
  getAllTasks: async (req, res, next) => {
    try {
      DebugLogger.log('TaskController.getAllTasks', 'Starting execution');
      
      const tasks = taskManager.getAllTasks();
      DebugLogger.log('TaskController.getAllTasks', { tasksCount: tasks?.length });
      
      const response = generateResponse(tasks);
      DebugLogger.log('TaskController.getAllTasks', { response });
      
      res.json(response);
    } catch (error) {
      DebugLogger.error('TaskController.getAllTasks', error);
      next(error);
    }
  }
};
```

### テスト駆動デバッグ

**失敗テストからの逆算**：
```typescript
describe('バグ再現テスト', () => {
  test('特定条件でのnullエラー再現', () => {
    // バグが発生する最小条件を特定
    const manager = new TaskManager();
    const result = manager.getAllTasks();
    
    // この時点でエラーが発生するはず
    expect(() => result.map(x => x.id)).toThrow();
  });

  test('修正後の動作確認', () => {
    // 修正後に期待する動作をテスト
    const manager = new TaskManager();
    const result = manager.getAllTasks();
    
    expect(Array.isArray(result)).toBe(true);
    expect(() => result.map(x => x.id)).not.toThrow();
  });
});
```

## まとめ

この章では、AITDD開発における包括的なエラーハンドリングとデバッグ手法を学習しました：

**主要な学習成果**：
- エラーの適切な分類と対処法
- AI活用による効率的デバッグプロセス
- プロンプト起因エラーの特定と修正
- 手動実装への切り替え判断とAI併用戦略
- エラー予防のベストプラクティス

**実践的スキル**：
- 包括的な情報収集技法
- AIと協力したエラー分析
- 段階的な問題解決アプローチ
- 品質管理の継続的改善

**次章への準備**：
これらのスキルにより、より高度なAITDD手法と最適化技術を学習する準備が整いました。プロンプト設計とAI活用の最適化に進みます。

AITDDの実践ハンズオンシリーズを通じて、基礎から応用まで一通りの技術を習得しました。次部では、これらの技術をさらに洗練させ、実際のプロダクション環境で活用するための高度な技法を学習していきます。
