# 辅导个案练习 / Counselling Practice

公开页面：`/counselling-practice`，无需登入。桌面双栏，手机使用记录／反馈页签。

表单与反馈仅保存在 React 内存，不写入业务数据库、localStorage 或 sessionStorage。离开路由或刷新后清空；浏览器语言偏好仍由现有语言系统保存。手动导出 UTF-8 文本可保留记录、反馈和反馈对应的原始提交内容。

## AI 配置 / Configuration

部署环境需要：

- `AI_FEATURE_ENABLED=true`
- `STUDENT_AI_FEATURE_ENABLED=true`（默认关闭，只控制学生接口）
- `OPENAI_API_KEY`、`OPENAI_MODEL`
- `AUTH_APP_ORIGINS`：允许的前端来源，精确匹配，逗号分隔，无结尾斜线。
- 可选 `AI_REQUEST_TIMEOUT_MS`，沿用现有 AI 超时设置。

`POST /api/ai/student-feedback` 使用 JSON，包含 `language`（`cn/en`）、`confirmed: true` 及 `fields.json` 定义的字段。必填 `summary`，其余字段可省略。不接受数据库 ID 或其他未知字段。成功响应为 `{ success: true, data: { generatedAt, language, result } }`。输出字段为 `caseUnderstanding`、`dataGaps`、`nextSession`、`openQuestions`、`supervision`、`humanReview`（各项含 `title/detail/sourceRefs`）及字符串数组 `limitations`。

接口不读取或写入数据库，不记录正文，响应为 `no-store`。外部 AI 请求沿用 `store: false`；这不代表服务商零留存承诺。来源检查不能代替限流。公开上线前必须在托管平台设置此接口的流量／预算限制，并验证超额请求会被拒绝。不要将浏览器按钮的禁用当作服务端限流。

本地 `npm start` 的 API 请求遵循项目现有代理。测试本地新增 API 时使用 `npx vercel dev` 并在对应环境配置允许的前端来源；不要依赖尚未部署新接口的远端代理。

## 行为 / Behaviour

AI 只在主动点击后运行。切换语言不翻译学生输入、不重新载入示例、不自动生成。反馈按完整输入和语言缓存；修改输入后旧反馈标为过期。取消、编辑、切换语言和清空会使旧请求失效。取消浏览器请求不保证已开始的服务端 AI 调用停止或免计费。

虚构示例覆盖与清空均需确认。清空会移除所有语言的内存反馈。记录应为虚构或已移除识别资料；工具只辅助学习与督导讨论，不用于诊断或评分。

## 验证 / Validation

运行 `npm run test:practice`、`npm run test:i18n`、`npm run test:ai`、`npm run build`。自动测试模拟 AI，不调用付费服务。发布前另验证实际 AI 输出语言及桌面／手机中英文布局。
