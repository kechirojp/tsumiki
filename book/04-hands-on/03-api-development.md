# 4.3 API開発の実践

## 学習目標

この章では、RESTful APIの開発を通じて、AITDDの実際のWebアプリケーション開発への適用方法を学びます：

- 外部依存を含む実装でのAITDD活用
- 非同期処理とエラーハンドリングの実装
- HTTPステータスコードとレスポンス設計
- APIドキュメントの自動生成
- 実際のプロダクション環境に近い開発体験

## プロジェクト概要：タスク管理API

前章で開発したタスク管理システムをベースに、Express.jsを使用したRESTful APIを構築します。

### API仕様概要

```http
GET    /api/tasks       # 全タスク取得
GET    /api/tasks/:id   # 特定タスク取得
POST   /api/tasks       # 新規タスク作成
PUT    /api/tasks/:id   # タスク更新
DELETE /api/tasks/:id   # タスク削除
```

### 技術スタック

- **Webフレームワーク**: Express.js
- **言語**: TypeScript
- **テスト**: Jest + Supertest
- **バリデーション**: express-validator
- **ドキュメント**: OpenAPI (Swagger)

## 新たな技術的複雑さ

API開発では前章のCRUDに加えて以下の要素が増加します：

**HTTP関連**：
- リクエスト/レスポンス処理
- ステータスコード管理
- ヘッダー処理
- ルーティング設計

**非同期処理**：
- Promise/async-await
- エラーハンドリング
- タイムアウト処理

**バリデーション**：
- リクエストデータ検証
- レスポンス形式統一
- エラーレスポンス標準化

## 実践ハンズオン

### ステップ1：TODO作成とAPI設計

AITDDでの API開発においても、**3機能程度の統合限界**は同様に適用されます。そのため、エンドポイントを適切に分割します。

```markdown
# TODO: タスク管理API実装

## フェーズ1：基盤構築
- [ ] Express.jsプロジェクトセットアップ
- [ ] TypeScript設定
- [ ] 基本的なミドルウェア設定
- [ ] エラーハンドリングミドルウェア

## フェーズ2：基本API（3エンドポイント）
- [ ] GET /api/tasks - 全タスク取得
- [ ] GET /api/tasks/:id - 単一タスク取得
- [ ] POST /api/tasks - タスク作成

## フェーズ3：拡張API（残りエンドポイント）
- [ ] PUT /api/tasks/:id - タスク更新
- [ ] DELETE /api/tasks/:id - タスク削除
- [ ] GET /api/tasks?search=xxx - 条件検索

## フェーズ4：品質向上
- [ ] OpenAPI仕様書生成
- [ ] 入力バリデーション強化
- [ ] セキュリティヘッダー追加
- [ ] パフォーマンス最適化
```

### ステップ2：フェーズ1 - 基盤構築

#### 仕様作成

**AIへのプロンプト**：
```
Express.jsとTypeScriptを使用したAPIプロジェクトの基盤設定の仕様を作成してください。

要件：
- TypeScript環境でのExpress.js設定
- 基本的なミドルウェア（CORS、JSON パース等）
- 構造化されたエラーハンドリング
- 開発・本番環境の設定分離
- テスト環境のセットアップ

以下のTODOを参考にしてください：
[フェーズ1のTODOを貼り付け]
```

**生成された仕様例**：
````markdown
# タスク管理API基盤仕様

## プロジェクト構造
```
src/
├── app.ts              # Express アプリケーション設定
├── server.ts           # サーバー起動エントリーポイント
├── routes/             # ルート定義
├── controllers/        # ビジネスロジック
├── middleware/         # カスタムミドルウェア
├── types/              # TypeScript型定義
└── tests/              # テストファイル
```

## Express設定
- CORS対応
- JSON/URLエンコードパース
- リクエストログ
- セキュリティヘッダー
- エラーハンドリングミドルウェア

## エラー処理標準化
```typescript
interface APIError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}
```

## レスポンス形式統一
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```
```

#### テストケース作成とRed-Green-Refactor-Validation

**API基盤のテスト**：
```typescript
describe('API基盤テスト', () => {
  test('サーバー起動確認', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('CORS設定確認', async () => {
    const response = await request(app)
      .options('/api/tasks')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
    
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  test('JSON解析確認', async () => {
    const response = await request(app)
      .post('/api/test')
      .send({ test: 'data' })
      .set('Content-Type', 'application/json');
    
    expect(response.status).not.toBe(400); // JSON解析エラーではない
  });

  test('エラーハンドリング確認', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });
});
````

### ステップ3：フェーズ2 - 基本API実装

#### GET /api/tasks の実装

**仕様**：
```markdown
## 全タスク取得API

### エンドポイント
GET /api/tasks

### レスポンス（成功時）
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "タスクタイトル",
      "description": "タスク説明",
      "completed": false,
      "createdAt": "2025-06-21T10:00:00Z",
      "updatedAt": "2025-06-21T10:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2025-06-21T10:00:00Z",
    "requestId": "req-123"
  }
}
```

### ステータスコード
- 200: 正常取得（空配列含む）
- 500: サーバーエラー


**AIプロンプト例**：
```
以下の仕様に基づいて GET /api/tasks エンドポイントの実装を行ってください：

[仕様を貼り付け]

要求：
1. Express.jsルーターを使用
2. 前章で作成したTaskManagerクラスを活用
3. エラーハンドリングを適切に実装
4. TypeScriptの型安全性を確保
5. Supertestを使用した統合テスト作成

既存のコード：
[TaskManagerクラスのコードを貼り付け]
[API基盤のコードを貼り付け]
```

**期待される実装**：
```typescript
// routes/tasks.ts
import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

router.get('/', taskController.getAllTasks);

export default router;

// controllers/TaskController.ts
import { Request, Response, NextFunction } from 'express';
import { TaskManager } from '../services/TaskManager';
import { APIResponse } from '../types/api';

export class TaskController {
  private taskManager = new TaskManager();

  getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = this.taskManager.getAllTasks();
      
      const response: APIResponse<typeof tasks> = {
        success: true,
        data: tasks,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
```

#### GET /api/tasks/:id の実装

**仕様追加**：
```markdown
## 単一タスク取得API

### エンドポイント
GET /api/tasks/:id

### パラメータ
- id: タスクID（UUID形式）

### ステータスコード
- 200: 正常取得
- 400: 不正なID形式
- 404: タスクが見つからない
- 500: サーバーエラー
```

#### POST /api/tasks の実装

**仕様追加**：
````markdown
## タスク作成API

### エンドポイント
POST /api/tasks

### リクエストボディ
```json
{
  "title": "タスクタイトル",
  "description": "タスク説明"
}
```

### バリデーション
- title: 必須、1-100文字
- description: 任意、0-500文字

### ステータスコード
- 201: 作成成功
- 400: バリデーションエラー
- 500: サーバーエラー
````

### ステップ4：フェーズ3 - 拡張API実装

#### 入力バリデーション強化

**express-validatorの活用**：

```typescript
// middleware/validation.ts
import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const createTaskValidation = [
  body('title')
    .notEmpty()
    .withMessage('タイトルは必須です')
    .isLength({ min: 1, max: 100 })
    .withMessage('タイトルは1-100文字である必要があります'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('説明は500文字以下である必要があります'),
];

export const taskIdValidation = [
  param('id')
    .isUUID()
    .withMessage('有効なUUID形式のIDを指定してください'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'バリデーションエラー',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errors.array()
      }
    });
  }
  next();
};
```

#### PUT /api/tasks/:id 実装

**部分更新対応**：
```typescript
export const updateTaskValidation = [
  ...taskIdValidation,
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('タイトルは1-100文字である必要があります'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('説明は500文字以下である必要があります'),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('completedはboolean値である必要があります'),
];
```

#### DELETE /api/tasks/:id 実装

**ソフトデリートの考慮**：
```typescript
deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = this.taskManager.deleteTask(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'タスクが見つかりません',
          code: 'TASK_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};
```

### ステップ5：フェーズ4 - 品質向上

#### OpenAPI仕様書の生成

**AIプロンプト例**：
```
以下のAPIエンドポイントからOpenAPI 3.0仕様書を生成してください：

[実装したエンドポイントの一覧]
[レスポンス形式の定義]
[エラーレスポンスの定義]

要求：
1. Swagger UIで表示可能な形式
2. 全エンドポイントの詳細ドキュメント
3. リクエスト/レスポンスの例を含める
4. エラーコードの説明を含める
```

**生成されたOpenAPI仕様例**：
```yaml
openapi: 3.0.0
info:
  title: タスク管理API
  version: 1.0.0
  description: シンプルなタスク管理システムのRESTful API

paths:
  /api/tasks:
    get:
      summary: 全タスク取得
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskListResponse'
    
    post:
      summary: タスク作成
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: 作成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'
        '400':
          description: バリデーションエラー
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          maxLength: 500
        completed:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

## 複雑な問題の対処法

### 手動実装への切り替え判断

API開発において、以下の場合は手動実装を検討します：

**実装方法がイメージできない場合**：
- 「カスタムミドルウェアの複雑な認証ロジック」
- 「WebSocketとの統合処理」
- 「複雑なデータベース最適化」

**パフォーマンス対応が必要な場合**：
- 「大量リクエストの処理最適化」
- 「メモリ使用量の最適化」
- 「レスポンス時間の短縮」

### 手動実装時のAI活用

完全手動ではなく、以下でAIを活用：
```typescript
// 実装イメージができる部分はAIに依頼
const generateResponseHelper = (data: any, meta: any) => {
  // この部分はAIで生成可能
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
};

// 複雑なロジックは手動実装
const complexAuthMiddleware = (req, res, next) => {
  // 複雑な認証ロジックは手動で実装
  // ただし、部分的にAI補完を活用
};
```

## API開発特有のテスト戦略

### 統合テストパターン

**エンドツーエンドテスト**：
```typescript
describe('API統合テスト', () => {
  test('タスク管理フロー', async () => {
    // 1. タスク作成
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'テストタスク',
        description: 'テスト用のタスクです'
      });
    
    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.data.id;

    // 2. タスク取得確認
    const getResponse = await request(app)
      .get(`/api/tasks/${taskId}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.title).toBe('テストタスク');

    // 3. タスク更新
    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({
        completed: true
      });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.completed).toBe(true);

    // 4. タスク削除
    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`);
    
    expect(deleteResponse.status).toBe(204);

    // 5. 削除確認
    const getAfterDeleteResponse = await request(app)
      .get(`/api/tasks/${taskId}`);
    
    expect(getAfterDeleteResponse.status).toBe(404);
  });
});
```

### パフォーマンステスト

**負荷テスト**：
```typescript
describe('パフォーマンステスト', () => {
  test('同時リクエスト処理', async () => {
    const requests = Array.from({ length: 100 }, (_, i) =>
      request(app)
        .post('/api/tasks')
        .send({
          title: `並行タスク${i}`,
          description: '並行処理テスト'
        })
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    expect(endTime - startTime).toBeLessThan(5000); // 5秒以内
  });
});
```

## エラーハンドリングのベストプラクティス

### 包括的エラー処理

```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ログ出力
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // エラータイプごとの処理
  if (error.name === 'TaskNotFoundError') {
    return res.status(404).json({
      success: false,
      error: {
        message: 'タスクが見つかりません',
        code: 'TASK_NOT_FOUND',
        statusCode: 404
      }
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'バリデーションエラー',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: error.details
      }
    });
  }

  // 未知のエラー
  res.status(500).json({
    success: false,
    error: {
      message: 'サーバー内部エラーが発生しました',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500
    }
  });
};
```

## 実践での学習効果

### API開発でのAITDD効果

**開発速度の実感**：
- 従来のAPI開発：数日〜1週間
- AITDD使用：数時間
- **大幅な効率化**を実現

**品質の安定性**：
- 包括的なテストによる品質保証
- エラーハンドリングの標準化
- APIドキュメントの自動生成

**実践的スキルの習得**：
- Web開発での効果的なAI活用
- 複雑な統合処理への対応
- プロダクション品質の実装

### 従来開発との違い

**設計フェーズ**：
- 従来：詳細設計に時間をかける
- AITDD：AIと協力して段階的に設計

**実装フェーズ**：
- 従来：手動での詳細実装
- AITDD：AI生成コードの品質管理

**テストフェーズ**：
- 従来：実装後のテスト作成
- AITDD：テストファーストアプローチ

## 次章への準備

このAPI開発体験により、以下が身に付きます：

1. **Web開発でのAI活用技術**
2. **複雑な統合処理の管理方法**
3. **プロダクション品質の実装技法**
4. **エラーハンドリングとデバッグ技術**

次章では、これらの実装過程で発生するエラーやトラブルに対する具体的な対処法を学習します。

## まとめ

API開発を通じて以下を習得しました：

**技術的成長**：
- RESTful API設計の実践
- 非同期処理とエラーハンドリング
- TypeScriptでの型安全な実装
- 包括的なテスト戦略

**AITDD活用技術**：
- 複雑な実装でのAI協調
- 段階的な機能追加の管理
- 品質管理の自動化
- ドキュメント生成の活用

**実践的開発力**：
- プロダクション品質の実装
- パフォーマンス考慮の設計
- セキュリティ対応の実装
- 運用を考慮した設計

これらの経験により、実際のプロダクト開発でもAITDDを効果的に活用できる基盤が整います。
