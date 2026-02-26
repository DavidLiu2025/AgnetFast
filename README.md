# AgentFast CDN — 运营管理平台

## 项目概览

| 项目 | 说明 |
|------|------|
| **名称** | AgentFast CDN Platform |
| **定位** | 轻量级 CDN 运营管理平台（用户前台 + 运营后台） |
| **技术栈** | Hono + TypeScript + Cloudflare Pages + TailwindCSS (CDN) |
| **GitHub** | https://github.com/DavidLiu2025/AgnetFast |
| **测试覆盖** | 211 测试全绿 (12 文件) |
| **构建大小** | 275 KB (_worker.js) |

---

## 已完成功能

### 用户前台（/）

| 路由 | 功能 | 状态 |
|------|------|------|
| `/` | 登录页 | ✅ |
| `/dashboard` | 用户总览（流量/域名/带宽） | ✅ |
| `/domains` | 域名管理（列表/添加/删除） | ✅ |
| `/ssl` | SSL 证书管理 | ✅ |
| `/access-control` | IP/Referer/UA 访问控制 | ✅ |
| `/alerts` | 告警规则（带宽/错误率/可用率） | ✅ |
| `/logs` | 访问日志（过滤/分页） | ✅ |
| `/origin-config` | 回源配置（协议/超时/优先级） | ✅ |
| `/performance` | 性能优化（Gzip/HTTP2/缓存策略） | ✅ |
| `/api-docs` | API 文档 + APIKey 管理 | ✅ |
| `/tickets` | 工单系统（提交/查看状态） | ✅ |

### 运营后台（/admin）

| 路由 | 功能 | 状态 |
|------|------|------|
| `/admin/dashboard` | 运营总览（6 KPI + 带宽图表） | ✅ |
| `/admin/customers` | 客户管理（封禁/恢复/详情） | ✅ |
| `/admin/nodes` | 节点管理（上线/下线/健康监控） | ✅ |
| `/admin/dns` | DNS 调度策略（CRUD + 权重） | ✅ |
| `/admin/domains/review` | 域名审核（通过/拒绝+理由） | ✅ |
| `/admin/packages` | 套餐管理 | ✅ |
| `/admin/tickets` | 工单系统（后台视角） | ✅ |
| `/admin/finance` | 财务管理（日/月/年收入） | ✅ |
| `/admin/security` | 安全管理 | ✅ |
| `/admin/audit-logs` | 操作审计（过滤/分页/CSV导出） | ✅ |
| `/admin/settings` | 系统配置（SMTP/平台/安全策略） | ✅ |

---

## API 端点速查

### 用户前台 API

```
POST /api/access-control/ip-rules       # 添加IP规则
DELETE /api/access-control/ip-rules/:id # 删除IP规则
POST /api/access-control/referer-rules  # 添加Referer规则
POST /api/alerts                        # 创建告警
DELETE /api/alerts/:id                  # 删除告警
GET /api/logs                           # 查询访问日志
POST /api/origin-config                 # 保存回源配置
GET /api/origin-config                  # 获取回源配置列表
POST /api/performance/config            # 保存性能配置
GET /api/performance/config             # 获取性能配置列表
POST /api/apikeys                       # 生成 API Key（af_前缀）
POST /api/tickets                       # 提交工单（T-前缀ID）
```

### 运营后台 API

```
GET  /admin/api/stats                          # 全局统计
GET  /admin/api/customers                      # 客户列表
POST /admin/api/customers/:id/suspend          # 封禁客户
POST /admin/api/customers/:id/activate         # 恢复客户
GET  /admin/api/nodes                          # 节点列表
POST /admin/api/nodes/:id/online               # 节点上线
POST /admin/api/nodes/:id/offline              # 节点下线
GET  /admin/api/nodes/:id/health               # 节点健康检查
GET  /admin/api/dns-rules                      # DNS规则列表
POST /admin/api/dns-rules                      # 添加DNS规则
PUT  /admin/api/dns-rules/:id                  # 更新DNS规则
PATCH /admin/api/dns-rules/:id/toggle          # 切换DNS规则状态
GET  /admin/api/domains/review                 # 待审核域名列表
GET  /admin/api/domains/review/stats           # 审核统计
POST /admin/api/domains/review/:id/approve     # 审核通过
POST /admin/api/domains/review/:id/reject      # 审核拒绝（需reason）
GET  /admin/api/packages                       # 套餐列表
POST /admin/api/packages                       # 添加套餐
PUT  /admin/api/packages/:id                   # 更新套餐
GET  /admin/api/finance/summary                # 财务汇总
GET  /admin/api/security/events                # 安全事件列表
POST /admin/api/security/block                 # IP封禁
GET  /admin/api/audit-logs                     # 审计日志（支持过滤/分页）
GET  /admin/api/audit-logs/export              # 导出CSV
GET  /admin/api/settings                       # 系统配置
PUT  /admin/api/settings/platform              # 更新平台配置
PUT  /admin/api/settings/smtp                  # 更新SMTP配置
POST /admin/api/settings/smtp/test             # 测试SMTP连接
PUT  /admin/api/settings/security              # 更新安全策略
```

---

## 数据架构

| 层面 | 方案 | 说明 |
|------|------|------|
| **当前** | 内存 Mock 数据 | 演示用，重启后重置 |
| **推荐迁移** | Cloudflare D1 (SQLite) | 生产用，全球分发 |
| **配置存储** | Cloudflare KV | 系统配置/会话等 |
| **文件存储** | Cloudflare R2 | 证书、日志导出等 |

### 主要数据模型

- **Customer**: id, name, company, plan, domains, traffic, spend, joinedAt
- **Node**: id, name, region, status, bandwidth, capacity, cpu, mem, uptime
- **DnsRule**: id, name, match, nodeGroup, weight, ttl, status
- **Domain**: id, domain, customer, type, icp, status, createdAt
- **Ticket**: id, subject, priority, status, createdAt, assignee
- **AuditLog**: id, operator, action, resource, ip, createdAt, detail

---

## 快速开始（本地开发）

```bash
git clone https://github.com/DavidLiu2025/AgnetFast
cd AgnetFast
npm install
npm run build
npm run dev:sandbox   # 或 pm2 start ecosystem.config.cjs
```

访问：
- 用户前台：http://localhost:3000/
- 运营后台：http://localhost:3000/admin/dashboard

---

## 测试

```bash
npm test              # 运行全量测试（211个）
npm test -- --watch   # 监听模式
```

---

## 部署状态

| 项目 | 状态 |
|------|------|
| **平台** | Cloudflare Pages（待配置 API Key） |
| **GitHub** | ✅ https://github.com/DavidLiu2025/AgnetFast |
| **测试** | ✅ 211/211 通过 |
| **最后构建** | 2026-02-26，275 KB |

---

## 待做事项（下一步）

1. **Cloudflare Pages 部署** — 在 Deploy 标签页配置 API Key 后执行
2. **D1 数据库接入** — 将 Mock 数据替换为真实 Cloudflare D1
3. **登录鉴权** — JWT + 登录中间件（目前无鉴权）
4. **域名管理前台深化** — 添加域名 CNAME 配置引导
5. **实时流量图表** — WebSocket 或 SSE 推送（需 Durable Objects）
