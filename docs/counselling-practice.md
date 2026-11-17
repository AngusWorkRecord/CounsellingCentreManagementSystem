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

`POST /api/ai/student-feedback` 使用 JSON，包含 `language`（`cn/en`）、`confirmed: true`、可选的整数 `feedbackVersion`（`1/2`）及 `fields.json` 定义的字段。必填 `summary`，其余记录字段可省略。不接受数据库 ID 或其他未知字段。

- 未传版本或传 `1`：保持旧响应 `{ success: true, data: { generatedAt, language, result } }`。结果包含 `caseUnderstanding`、`dataGaps`、`nextSession`、`openQuestions`、`supervision`、`humanReview`（各项含 `title/detail/sourceRefs`）及字符串数组 `limitations`。
- 新页面明确请求 `2`：响应 `data` 增加 `feedbackVersion: 2`。结果包含最多三个 `priorities`，以及固定的 `sessionRoute.opening/exploration/closing` 三阶段。每阶段有 `aim/question/rationale/followUps/sourceRefs`；追问分支含假设条件 `when` 和问题 `question`，每阶段最多两条。
- 新版 `reasoning.facts/hypotheses/missingInfo` 分别表达记录事实、待确认理解和资料缺口；另有 `supervision/humanReview/limitations`。人工关注事项始终置顶显示，其他详细内容默认折叠。完整字段、字数和数量限制由共用的 ES Module `feedbackContract.mjs` 定义；前后端均验证结构、限制及提交资料的来源引用。

新版按温和的整合视角，为有实习经验的学生及辅导员提供具体而可调整的提问路线，不套用固定取向或虚构案主回应。旧反馈保留原文并标示旧版，不在前端拼造新版内容；导出兼容两个版本，并包含所有尚未展开的内容。模型请求沿用原有严格 JSON 结构；数量及字数限制还会在本地验证，不依赖不同模型对约束关键字的支持。无效结果返回 `AI_INVALID_OUTPUT`，不进入缓存。

过渡期间，新页面请求版本 2 却收到 `200 OK` 的有效旧版结果（没有版本标记时按版本 1 处理），会保留并显示旧版内容，不报成无效 AI 结果、不自动重试，也不把旧内容转换成会谈路线。缓存按回应的实际版本保存；版本差异不等于记录被修改。语言错误、未知版本、损坏结构或无效来源引用仍被拒绝。本地 `npm start` 只运行前端且代理线上 API，需同步部署新版后端，或使用下述 `vercel dev`，才能生成版本 2。

接口不读取或写入数据库，不记录正文，响应为 `no-store`。外部 AI 请求沿用 `store: false`；这不代表服务商零留存承诺。来源检查不能代替限流。公开上线前必须在托管平台设置此接口的流量／预算限制，并验证超额请求会被拒绝。不要将浏览器按钮的禁用当作服务端限流。

本地 `npm start` 的 API 请求遵循项目现有代理。测试本地新增 API 时使用 `npx vercel dev` 并在对应环境配置允许的前端来源；不要依赖尚未部署新接口的远端代理。

## 行为 / Behaviour

AI 只在主动点击后运行。切换语言不翻译学生输入、不重新载入示例、不自动生成。反馈按完整输入、语言和反馈版本缓存；修改输入后旧反馈标为过期。取消、编辑、切换语言和清空会使旧请求失效。取消浏览器请求不保证已开始的服务端 AI 调用停止或免计费。

虚构示例覆盖与清空均需确认。清空会移除所有语言的内存反馈。记录应为虚构或已移除识别资料；工具只辅助学习与督导讨论，不用于诊断或评分。

## 验证 / Validation

运行 `npm run test:practice`、`npm run test:i18n`、`npm run test:ai`、`npm run build`。自动测试模拟 AI，不调用付费服务。发布前另验证实际 AI 输出语言及桌面／手机中英文布局。

生产构建还会执行 `scripts/check-practice-build.cjs`，检查反馈模块没有被错误输出成静态资源。浏览器共用模块使用 `.mjs`，不能改回 `.cjs`：CRA 会把后者当成资源 URL，导致版本常量变成 `undefined`，请求 JSON 中的 `feedbackVersion` 被省略。只通过 Jest 测试不足以排除此打包问题。
