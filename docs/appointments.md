# 预约后端 / Appointment backend

预约由登录后的管理员与志工共同管理，数据保存在 PostgreSQL。没有公众预约入口、永久删除接口、自动生成辅导记录或短信／邮件提醒。

Authenticated admins and volunteers manage all appointments in PostgreSQL. Public booking, permanent deletion, automatic counselling records, and notifications are outside this release.

## 部署 / Deployment

1. 使用现有数据库；必须已有 `public.counselling_sessions`（包括 `deleted_at`）及登录表。`004_soft_delete_counselling_sessions.sql` 和 `005_create_authentication.sql` 是前置依赖。旧项目的辅导记录基础表先于仓库中的迁移存在，此迁移不负责重建基础表。
2. 在目标数据库的 SQL 控制台执行 [006_create_appointments.sql](../database/006_create_appointments.sql)，确认事务成功。它创建预约、历史及相关函数，不导入示例数据。迁移可重复执行。
3. 保持服务器 `DATABASE_URL` 和 `AUTH_APP_ORIGINS` 配置，后者包含实际前端来源。不要把数据库连接交给浏览器。
4. 先完成数据库迁移，再发布应用。验证双方角色、取消／恢复和刷新后持久化。回滚应用时保留预约表和历史，避免丢失已录入的数据；旧版本示例页面不会显示真实预约。

Use the existing sessions/auth database and apply migration 006 before deploying the application. Prerequisites are the existing sessions base table, soft-delete migration 004, and authentication migration 005. The migration is repeatable and seeds no data. Keep database credentials server-side; retain appointment tables and history when rolling the application back.

本地前端 `npm start` 沿用项目现有生产代理；真实开发应使用隔离的 Vercel 预览部署和测试数据库，避免在生产数据上试验。

The local frontend inherits the project's production proxy. Use an isolated Vercel preview deployment and test database for end-to-end development.

## 接口 / API

所有响应为 JSON，`Cache-Control: no-store`。需要现有登录 Cookie。写入要求可信 `Origin` 和 `Content-Type: application/json`。ID 为十进制字符串，版本号为正整数；操作者、操作时间和个案编号由服务器决定。

All responses are JSON with `no-store`; authentication is required. Writes require a trusted origin and JSON content type. IDs are decimal strings, versions are positive integers. Actor, timestamps, and case-number snapshots are server-owned.

| 方法 / Method | 路径 / Path | 行为 / Behavior |
| --- | --- | --- |
| GET | `/api/appointments` | 筛选、分页 / Filter and paginate |
| GET | `/api/appointments?id=123` | 详情及历史 / Detail and history |
| POST | `/api/appointments` | 创建已预约记录 / Create scheduled appointment |
| PUT | `/api/appointments?id=123` | 完整更新资料及版本 / Replace editable fields with version |
| PATCH | `/api/appointments?id=123` | 更新状态及版本 / Change status with version |
| GET | `/api/appointment-cases` | 搜索有效辅导记录摘要 / Search active session summaries |

列表参数：`from`、`to`（包含边界）、`counsellor`、`mode`、`status`、`search`（姓名缩写／个案编号，不区分大小写的字面子串）、`excludeCancelled=true|false`、`page`（从 0 开始）、`pageSize`（1–100，默认 10）。响应：`{success:true,data:[],total,page,pageSize}`。按日期、开始时间、ID 排序，空分页仍返回总数。个案搜索支持 `search`、`page`、`pageSize`，默认每页 20，按日期及 ID 倒序；不按个案编号合并记录。

List queries support inclusive dates, counsellor, mode, status, literal case-insensitive search, cancellation exclusion, zero-based page and page size (1–100, default 10). Results include total count even for empty pages and sort by date/start/ID. Case search supports search/page/pageSize (default 20), sorted by date/ID descending, without grouping case numbers.

创建与编辑字段：`caseId`（选填，空字符串／null 表示新来访者）、`clientInitials`（必填，最多 100 字符）、`phone`（必填，最多 50）、`date`、`start`、`end`、`counsellor`、`mode`、`location`（必填，最多 500）；编辑另带 `version`。姓名缩写、电话和地点会裁剪首尾空格，不改写用户内容。`caseNumber` 不接受客户端覆盖。

Create/update fields are caseId (optional), clientInitials (required, max 100), phone (required, max 50), date, start, end, counsellor, mode, location (required, max 500). Updates also require version. Text is trimmed without translation; client caseNumber is ignored.

日期格式 `YYYY-MM-DD`，有效范围 0001–9999 年；时间为 `HH:mm`，结束晚于开始且不跨日。补录过去日期允许。辅导员及方式沿用辅导表单固定值。所有业务时间使用 `Asia/Kuala_Lumpur`；操作时间是 `timestamptz`。

Dates use YYYY-MM-DD (years 0001–9999); times use HH:mm and must end later on the same day. Past appointments are allowed. Counsellor/mode values match the existing form. Business time uses Asia/Kuala_Lumpur; audit timestamps are timestamptz.

状态请求示例 / Status request:

```json
{"status":"cancelled","version":3,"reason":"Client requested"}
```

`reason` 选填，最多 1000 字符，仅取消时保存。`scheduled` 可转为 `completed`、`no_show`、`cancelled`；后三者只可恢复为 `scheduled`，恢复后才能编辑。完成／未出席必须达到数据库判定的结束时间。取消释放时段，其他状态仍占用时段；相邻时段允许。恢复也重新检查冲突。

Reason is optional (max 1000) and saved only on cancellation. Scheduled records may complete, no-show, or cancel; terminal states must restore to scheduled before editing. Completion/no-show requires the server-side end time to pass. Only cancelled records release their slot; adjacent slots are allowed. Restoration rechecks conflicts.

关联首次建立或更换时验证辅导记录仍有效；后端保存其个案编号快照。姓名缩写及电话允许员工修正。原记录修改或软删除后，原预约仍保留快照与关联，不阻止其他资料编辑；不能新关联已删除记录。

New/changed links must reference an active session. The case number is snapshotted; initials/phone may be corrected by staff. Later source changes/deletion leave the existing appointment snapshot intact and do not block unrelated edits.

错误格式为 `{success:false,error:{code,fields?}}`。字段错误 `APPOINTMENT_VALIDATION_FAILED` 为 400，关联不可用为 400，预约不存在为 404；版本冲突、时段冲突、非法状态和未到结束时间为 409；登录／来源错误为 401／403，未配置为 503，未知异常为 500。前端按稳定错误码显示双语提示，不展示数据库诊断。

Errors contain stable codes and optional per-field codes: validation/invalid related case 400, missing appointment 404, version/time/status/end-time conflicts 409, authentication/origin 401/403, unconfigured auth 503, unexpected errors 500. The UI translates codes and never displays database diagnostics.

写入只通过 `write_appointment`，先取得独立事务锁，再重新验证登录、版本与冲突，最后与操作历史原子提交。不要绕过函数直接更新预约表。历史包含操作者姓名快照、前后资料、时间及取消原因；无删除功能。

All writes use write_appointment: acquire the transaction lock, recheck authentication/version/conflicts, then commit appointment and history atomically. Do not bypass the function with direct table writes. History retains actor-name snapshots, before/after values, timestamps, and cancellation reasons.

## 检查 / Verification

```powershell
npm.cmd run test:appointments
npm.cmd run test:auth
npm.cmd run test:i18n
npm.cmd run build
```

数据库实测需 Node 22+ 及专用 `APPOINTMENT_TEST_DATABASE_URL`，不配置时明确跳过，不回退生产连接。测试创建随机 `appointment_test_*` schema，使用最小辅导记录基础表及真实迁移，结束后清理该 schema；检查状态、快照、回滚、并发排期及版本竞争。登录数据库测试另用 `AUTH_TEST_DATABASE_URL`。

Database integration requires Node 22+ and a dedicated APPOINTMENT_TEST_DATABASE_URL, otherwise it explicitly skips without falling back to production. It creates a random test schema with a minimal pre-existing sessions fixture, runs the actual migrations, exercises rollback/concurrency, and cleans up only that schema. Authentication integration uses its separate AUTH_TEST_DATABASE_URL.

发布前还需桌面与手机浏览器验证月／日／列表、真实个案搜索、取消恢复、双向语言切换、表单与筛选保留、分页和长文字溢出。JSDOM 测试不能替代真实浏览器布局或真实数据库验证。

Before release, verify month/day/list views, case search, cancellation/restoration, both languages, preserved forms/filters, pagination, and long-text overflow on desktop/mobile. JSDOM does not replace real browser layout or database checks.
