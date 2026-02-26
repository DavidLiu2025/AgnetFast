/**
 * M8 运营后台框架 - 主路由入口
 * 统一挂载所有后台子路由
 */
import { Hono } from 'hono'
import { AdminLayout } from '../../lib/layout'
import {
  MOCK_CUSTOMERS, MOCK_NODES, MOCK_DNS_RULES, MOCK_FINANCE,
  MOCK_TICKETS, MOCK_PENDING_DOMAINS, statusBadge, gen24hBandwidth, genHourLabels, TOAST_SCRIPT
} from '../../lib/mock'

const adminRouter = new Hono()

// ─── Root: redirect to dashboard ─────────────────────────────────────────────
adminRouter.get('/', (c) => c.redirect('/admin/dashboard'))

// ─── API: Stats ───────────────────────────────────────────────────────────────
adminRouter.get('/api/stats', (c) => {
  const onlineNodes = MOCK_NODES.filter(n => n.status === 'online').length
  const totalBandwidth = MOCK_NODES.reduce((s, n) => s + n.bandwidth, 0)
  return c.json({
    totalCustomers: MOCK_CUSTOMERS.length,
    totalNodes: MOCK_NODES.length,
    onlineNodes,
    totalBandwidth,
    totalRevenue: MOCK_FINANCE.month.revenue,
    pendingTickets: MOCK_TICKETS.filter(t => t.status === 'open').length,
    pendingDomains: MOCK_PENDING_DOMAINS.filter(d => d.status === 'pending').length,
  })
})

// ─── Dashboard ────────────────────────────────────────────────────────────────
adminRouter.get('/dashboard', (c) => {
  const stats = {
    customers: MOCK_CUSTOMERS.length,
    nodes: MOCK_NODES.length,
    onlineNodes: MOCK_NODES.filter(n => n.status === 'online').length,
    bandwidth: MOCK_NODES.reduce((s, n) => s + n.bandwidth, 0),
    revenue: MOCK_FINANCE.month.revenue,
    pendingTickets: MOCK_TICKETS.filter(t => t.status === 'open').length,
    pendingDomains: MOCK_PENDING_DOMAINS.filter(d => d.status === 'pending').length,
  }
  return c.html(AdminLayout({ title: '运营总览', activeNav: 'admin-dashboard', children: dashboardHtml(stats) }))
})

// ─── Customers ────────────────────────────────────────────────────────────────
adminRouter.get('/customers', (c) => {
  return c.html(AdminLayout({ title: '客户管理', activeNav: 'admin-customers', children: customersHtml() }))
})

adminRouter.get('/api/customers', (c) => {
  return c.json({ customers: MOCK_CUSTOMERS, total: MOCK_CUSTOMERS.length })
})

adminRouter.post('/api/customers/:id/suspend', (c) => {
  const id = c.req.param('id')
  const customer = MOCK_CUSTOMERS.find(cu => cu.id === id)
  if (!customer) return c.json({ error: 'not found' }, 404)
  return c.json({ success: true, id, status: 'suspended' })
})

adminRouter.post('/api/customers/:id/activate', (c) => {
  const id = c.req.param('id')
  const customer = MOCK_CUSTOMERS.find(cu => cu.id === id)
  if (!customer) return c.json({ error: 'not found' }, 404)
  return c.json({ success: true, id, status: 'active' })
})

// ─── Nodes ────────────────────────────────────────────────────────────────────
adminRouter.get('/nodes', (c) => {
  return c.html(AdminLayout({ title: '节点管理', activeNav: 'admin-nodes', children: nodesHtml() }))
})

adminRouter.get('/api/nodes', (c) => {
  return c.json({ nodes: MOCK_NODES, total: MOCK_NODES.length })
})

adminRouter.post('/api/nodes/:id/online', (c) => {
  return c.json({ success: true, id: c.req.param('id'), status: 'online' })
})

adminRouter.post('/api/nodes/:id/offline', (c) => {
  return c.json({ success: true, id: c.req.param('id'), status: 'offline' })
})

// ─── DNS Scheduling ───────────────────────────────────────────────────────────
adminRouter.get('/dns', (c) => {
  return c.html(AdminLayout({ title: 'DNS 调度管理', activeNav: 'admin-dns', children: dnsHtml() }))
})

adminRouter.get('/api/dns-rules', (c) => {
  return c.json({ rules: MOCK_DNS_RULES, total: MOCK_DNS_RULES.length })
})

adminRouter.post('/api/dns-rules', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.name) return c.json({ error: 'name is required' }, 400)
  return c.json({
    id: `d-${Date.now()}`,
    name: body.name,
    match: body.match || '',
    nodeGroup: body.nodeGroup || '',
    weight: body.weight ?? 100,
    ttl: body.ttl ?? 60,
    status: 'active',
  }, 201)
})

adminRouter.put('/api/dns-rules/:id', async (c) => {
  const id = c.req.param('id')
  const rule = MOCK_DNS_RULES.find(r => r.id === id)
  if (!rule) return c.json({ error: 'not found' }, 404)
  const body = await c.req.json().catch(() => ({})) as any
  return c.json({ success: true, id, ...body })
})

adminRouter.patch('/api/dns-rules/:id/toggle', (c) => {
  const id = c.req.param('id')
  const rule = MOCK_DNS_RULES.find(r => r.id === id)
  if (!rule) return c.json({ error: 'not found' }, 404)
  const newStatus = rule.status === 'active' ? 'inactive' : 'active'
  return c.json({ success: true, id, status: newStatus })
})

adminRouter.get('/api/dns/health', (c) => {
  return c.json({
    nodes: MOCK_NODES.map(n => ({
      name: n.name,
      status: n.status,
      latency: n.status === 'offline' ? null : Math.round(5 + Math.random() * 30),
      lastCheck: new Date().toISOString(),
    }))
  })
})

// ─── Scheduling Strategy ──────────────────────────────────────────────────────
adminRouter.get('/scheduling', (c) => {
  return c.html(AdminLayout({ title: '调度策略', activeNav: 'admin-scheduling', children: schedulingHtml() }))
})

// ─── Domain Review ────────────────────────────────────────────────────────────
adminRouter.get('/domains/review', (c) => {
  return c.html(AdminLayout({ title: '域名审核', activeNav: 'admin-domain-review', children: domainReviewHtml() }))
})

// GET 审核列表
adminRouter.get('/api/domains/review', (c) => {
  return c.json({ domains: MOCK_PENDING_DOMAINS, total: MOCK_PENDING_DOMAINS.length })
})

// GET 审核统计
adminRouter.get('/api/domains/review/stats', (c) => {
  return c.json({
    pending:   MOCK_PENDING_DOMAINS.filter(d => d.status === 'pending').length,
    reviewing: MOCK_PENDING_DOMAINS.filter(d => d.status === 'reviewing').length,
    approved:  0,
    rejected:  1,
    total:     MOCK_PENDING_DOMAINS.length,
  })
})

adminRouter.post('/api/domains/review/:id/approve', (c) => {
  return c.json({ success: true, id: c.req.param('id'), status: 'approved' })
})

adminRouter.post('/api/domains/review/:id/reject', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.reason) return c.json({ error: 'reason is required' }, 400)
  return c.json({ success: true, id: c.req.param('id'), status: 'rejected', reason: body.reason })
})

// ─── Finance ──────────────────────────────────────────────────────────────────
adminRouter.get('/finance', (c) => {
  return c.html(AdminLayout({ title: '财务管理', activeNav: 'admin-finance', children: financeHtml() }))
})

// ─── Security ─────────────────────────────────────────────────────────────────
adminRouter.get('/security', (c) => {
  return c.html(AdminLayout({ title: '安全管理', activeNav: 'admin-security', children: securityHtml() }))
})

// ─── Packages / Plans ─────────────────────────────────────────────────────────
adminRouter.get('/packages', (c) => {
  return c.html(AdminLayout({ title: '套餐管理', activeNav: 'admin-plans', children: packagesHtml() }))
})
// alias
adminRouter.get('/plans', (c) => c.redirect('/admin/packages'))

// ─── Finance API ──────────────────────────────────────────────────────────────
adminRouter.get('/api/finance/overview', (c) => {
  return c.json(MOCK_FINANCE)
})

adminRouter.get('/api/finance/invoices', (c) => {
  const invoices = MOCK_CUSTOMERS.map((cu, i) => ({
    id: `INV-2026${String(i + 1).padStart(4, '0')}`,
    customer: cu.name,
    company: cu.company,
    plan: cu.plan,
    amount: cu.spend,
    status: i < 4 ? 'paid' : 'pending',
    period: '2026-02',
  }))
  return c.json({ invoices, total: invoices.length })
})

adminRouter.get('/api/finance/trend', (c) => {
  const months = ['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02']
  const revenues = [182000, 214000, 238000, 251000, 273000, 284600]
  return c.json({ months: months.map((m, i) => ({ month: m, revenue: revenues[i] })) })
})

// ─── Security API ─────────────────────────────────────────────────────────────
adminRouter.get('/api/security/overview', (c) => {
  return c.json({
    blockedToday: 1284,
    activeDDoS: 2,
    blacklistCount: 386,
    wafHits: 437,
    coverageRate: 99.94,
  })
})

adminRouter.get('/api/security/events', (c) => {
  const events = [
    { time: '14:23:11', ip: '103.21.244.18', type: 'DDoS UDP Flood', target: 'cdn.shopxyz.cn',      action: '已缓解', peak: '12.4 Gbps' },
    { time: '13:45:02', ip: '45.138.0.44',   type: 'CC攻击',          target: 'api.fastgame.io',    action: '已拦截', peak: '8,400 req/s' },
    { time: '11:20:33', ip: '192.3.88.91',   type: 'SQL注入',          target: '多个域名',           action: '已拦截', peak: '-' },
    { time: '09:12:55', ip: '198.51.100.23', type: 'XSS探测',          target: 'img.newsportal.com', action: '已拦截', peak: '-' },
  ]
  return c.json({ events, total: events.length })
})

adminRouter.post('/api/security/blacklist', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.ip) return c.json({ error: 'ip is required' }, 400)
  return c.json({ success: true, ip: body.ip, reason: body.reason, addedAt: new Date().toISOString() }, 201)
})

// ─── Packages API ─────────────────────────────────────────────────────────────
const MOCK_PACKAGES = [
  { id: 'p001', name: '免费版',       price: 0,    traffic: '10GB/月',   domains: 1,  status: 'active', users: 28 },
  { id: 'p002', name: '专业版 Pro',   price: 299,  traffic: '1TB/月',    domains: 10, status: 'active', users: 142 },
  { id: 'p003', name: '企业版',       price: 1299, traffic: '无限流量',  domains: 99, status: 'active', users: 35 },
  { id: 'p004', name: '按量计费',     price: 0,    traffic: '¥0.12/GB', domains: 5,  status: 'active', users: 67 },
]

adminRouter.get('/api/packages', (c) => {
  return c.json({ packages: MOCK_PACKAGES, total: MOCK_PACKAGES.length })
})

adminRouter.post('/api/packages', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.name) return c.json({ error: 'name is required' }, 400)
  return c.json({
    id: `p-${Date.now()}`,
    name: body.name,
    price: body.price ?? 0,
    traffic: body.traffic ?? '-',
    domains: body.domains ?? 1,
    status: 'active',
    users: 0,
  }, 201)
})

adminRouter.put('/api/packages/:id', async (c) => {
  const id = c.req.param('id')
  const pkg = MOCK_PACKAGES.find(p => p.id === id)
  if (!pkg) return c.json({ error: 'not found' }, 404)
  const body = await c.req.json().catch(() => ({})) as any
  return c.json({ success: true, id, ...body })
})

// ─── Tickets ──────────────────────────────────────────────────────────────────
adminRouter.get('/tickets', (c) => {
  return c.html(AdminLayout({ title: '工单系统', activeNav: 'admin-tickets', children: ticketsHtml() }))
})

// ─── Audit Logs ───────────────────────────────────────────────────────────────
adminRouter.get('/audit-logs', (c) => {
  return c.html(AdminLayout({ title: '操作审计', activeNav: 'admin-audit-logs', children: auditLogsHtml() }))
})

// M18: 审计日志 API
const MOCK_AUDIT_LOGS = [
  { id: 'al001', operator: 'admin', action: 'login',    resource: 'system',    ip: '1.2.3.4',   createdAt: '2026-02-25T08:00:00Z', detail: '管理员登录' },
  { id: 'al002', operator: 'admin', action: 'suspend',  resource: 'customer',  ip: '1.2.3.4',   createdAt: '2026-02-25T09:10:00Z', detail: '封禁客户c003' },
  { id: 'al003', operator: 'ops1',  action: 'login',    resource: 'system',    ip: '5.6.7.8',   createdAt: '2026-02-25T09:30:00Z', detail: '运营登录' },
  { id: 'al004', operator: 'admin', action: 'approve',  resource: 'domain',    ip: '1.2.3.4',   createdAt: '2026-02-25T10:00:00Z', detail: '审核域名' },
  { id: 'al005', operator: 'ops1',  action: 'update',   resource: 'node',      ip: '5.6.7.8',   createdAt: '2026-02-25T11:00:00Z', detail: '更新节点配置' },
  { id: 'al006', operator: 'admin', action: 'login',    resource: 'system',    ip: '1.2.3.4',   createdAt: '2026-02-26T08:00:00Z', detail: '管理员登录' },
  { id: 'al007', operator: 'ops2',  action: 'reject',   resource: 'domain',    ip: '9.10.11.12', createdAt: '2026-02-26T09:00:00Z', detail: '拒绝域名申请' },
  { id: 'al008', operator: 'admin', action: 'update',   resource: 'settings',  ip: '1.2.3.4',   createdAt: '2026-02-26T10:00:00Z', detail: '更新系统配置' },
  { id: 'al009', operator: 'ops1',  action: 'login',    resource: 'system',    ip: '5.6.7.8',   createdAt: '2026-02-26T10:30:00Z', detail: '运营登录' },
  { id: 'al010', operator: 'admin', action: 'delete',   resource: 'package',   ip: '1.2.3.4',   createdAt: '2026-02-26T11:00:00Z', detail: '删除套餐' },
]

adminRouter.get('/api/audit-logs', (c) => {
  const { action, operator, page = '1', limit = '20' } = c.req.query()
  let logs = [...MOCK_AUDIT_LOGS]
  if (action)   logs = logs.filter(l => l.action   === action)
  if (operator) logs = logs.filter(l => l.operator === operator)
  const p = parseInt(page), lim = parseInt(limit)
  const start = (p - 1) * lim
  const paged = logs.slice(start, start + lim)
  return c.json({ logs: paged, total: logs.length, page: p, limit: lim })
})

adminRouter.get('/api/audit-logs/export', (c) => {
  const header = 'id,operator,action,resource,ip,createdAt,detail\n'
  const rows = MOCK_AUDIT_LOGS.map(l =>
    `${l.id},${l.operator},${l.action},${l.resource},${l.ip},${l.createdAt},"${l.detail}"`
  ).join('\n')
  return new Response(header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="audit-logs.csv"',
    },
  })
})

// ─── Settings / System ────────────────────────────────────────────────────────
adminRouter.get('/settings', (c) => {
  return c.html(AdminLayout({ title: '系统配置', activeNav: 'admin-system', children: settingsHtml() }))
})
adminRouter.get('/system', (c) => c.redirect('/admin/settings'))

// M19: 系统配置 API (in-memory state for demo)
const sysSettings = {
  platform: { siteName: 'AgentFast CDN', maxDomains: 10, defaultPlan: 'basic', maintenanceMode: false },
  smtp:     { host: 'smtp.agentfast.com', port: 465, user: 'no-reply@agentfast.com', secure: true },
  security: { maxLoginAttempts: 3, sessionTimeout: 1800, ipWhitelist: [], twoFactorRequired: false },
}

adminRouter.get('/api/settings', (c) => {
  return c.json({ settings: sysSettings })
})

adminRouter.put('/api/settings/platform', async (c) => {
  const body = await c.req.json()
  Object.assign(sysSettings.platform, body)
  return c.json({ success: true, settings: sysSettings.platform })
})

adminRouter.put('/api/settings/smtp', async (c) => {
  const body = await c.req.json()
  if (!body.host) return c.json({ error: 'host is required' }, 400)
  Object.assign(sysSettings.smtp, body)
  return c.json({ success: true, settings: sysSettings.smtp })
})

adminRouter.post('/api/settings/smtp/test', async (c) => {
  const body = await c.req.json()
  const to = body?.to || 'admin@example.com'
  // 模拟发送测试邮件（demo无需真实发送）
  return c.json({ success: true, message: `测试邮件已发送至 ${to}`, timestamp: new Date().toISOString() })
})

adminRouter.put('/api/settings/security', async (c) => {
  const body = await c.req.json()
  Object.assign(sysSettings.security, body)
  return c.json({ success: true, settings: sysSettings.security })
})

export default adminRouter

// ─── Page HTML Functions ──────────────────────────────────────────────────────

function dashboardHtml(stats: any): string {
  const bw = gen24hBandwidth(500, 300)
  const labels = genHourLabels()
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">运营总览</h1>
    <p class="page-desc">实时监控全网运营状态</p>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span class="badge badge-success"><span class="dot"></span>系统正常</span>
    <span style="color:var(--text-muted);font-size:12px">最后更新: 刚刚</span>
  </div>
</div>

<!-- KPI 卡片 -->
<div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(99,102,241,0.15)"><i class="fas fa-users" style="color:#6366f1"></i></div>
    <div class="stat-info">
      <div class="stat-value">${stats.customers}</div>
      <div class="stat-label">总客户数</div>
      <div class="stat-change positive">↑ 3 本月新增</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(16,185,129,0.15)"><i class="fas fa-server" style="color:#10b981"></i></div>
    <div class="stat-info">
      <div class="stat-value">${stats.onlineNodes}<span style="color:var(--text-muted);font-size:16px">/${stats.nodes}</span></div>
      <div class="stat-label">在线节点</div>
      <div class="stat-change positive">✓ 全球 ${stats.nodes} 节点</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(245,158,11,0.15)"><i class="fas fa-bolt" style="color:#f59e0b"></i></div>
    <div class="stat-info">
      <div class="stat-value">${stats.bandwidth} <span style="font-size:14px;color:var(--text-muted)">Gbps</span></div>
      <div class="stat-label">当前总带宽</div>
      <div class="stat-change positive">↑ 12.4% vs 昨日</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(239,68,68,0.15)"><i class="fas fa-chart-pie" style="color:#ef4444"></i></div>
    <div class="stat-info">
      <div class="stat-value">¥${(stats.revenue/10000).toFixed(1)}<span style="font-size:14px;color:var(--text-muted)">万</span></div>
      <div class="stat-label">本月营收</div>
      <div class="stat-change positive">目标 ${Math.round(stats.revenue / 300000 * 100)}% 完成</div>
    </div>
  </div>
</div>

<!-- 带宽趋势图 -->
<div class="card" style="margin-top:20px">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-chart-area"></i> 全网带宽趋势（今日）</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm active" onclick="switchChart('bw',this)">带宽</button>
      <button class="btn btn-outline btn-sm" onclick="switchChart('req',this)">请求量</button>
    </div>
  </div>
  <div class="card-body">
    <canvas id="adminBwChart" height="80"></canvas>
  </div>
</div>

<!-- 底部两栏 -->
<div class="grid-2" style="margin-top:20px">
  <!-- 待处理事项 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-exclamation-circle" style="color:#f59e0b"></i> 待处理事项</div>
    </div>
    <div class="card-body" style="padding:0">
      <div class="list-item" style="padding:14px 16px;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-headset" style="color:#6366f1;margin-right:8px"></i>待回复工单</span>
          <span class="badge badge-danger">${stats.pendingTickets}</span>
        </div>
      </div>
      <div class="list-item" style="padding:14px 16px;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-globe" style="color:#10b981;margin-right:8px"></i>待审核域名</span>
          <span class="badge badge-warning">${stats.pendingDomains}</span>
        </div>
      </div>
      <div class="list-item" style="padding:14px 16px;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-file-invoice" style="color:#f59e0b;margin-right:8px"></i>待开发票</span>
          <span class="badge badge-info">3</span>
        </div>
      </div>
      <div class="list-item" style="padding:14px 16px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span><i class="fas fa-user-clock" style="color:#ef4444;margin-right:8px"></i>账号到期提醒</span>
          <span class="badge badge-warning">2</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 节点状态 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-server"></i> 节点状态概览</div>
      <a href="/admin/nodes" class="btn btn-outline btn-sm" style="text-decoration:none">查看全部</a>
    </div>
    <div class="card-body" style="padding:0">
      ${MOCK_NODES.slice(0, 5).map(n => `
      <div class="list-item" style="padding:10px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:10px">
          ${statusBadge(n.status)}
          <span style="font-size:13px">${n.name}</span>
        </div>
        <span style="font-size:12px;color:var(--text-muted)">${n.bandwidth} Gbps</span>
      </div>`).join('')}
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
const bwData = ${JSON.stringify(bw)};
const labels = ${JSON.stringify(labels)};
const ctx = document.getElementById('adminBwChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: '带宽 Gbps',
      data: bwData,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  }
});
function switchChart(type, btn) {
  document.querySelectorAll('.card-header .btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
</script>`
}

function customersHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">客户管理</h1>
    <p class="page-desc">管理所有注册客户账号</p>
  </div>
  <div style="display:flex;gap:10px">
    <input type="text" class="form-control" placeholder="搜索客户名/邮箱..." style="width:240px" oninput="filterCustomers(this.value)">
    <button class="btn btn-primary"><i class="fas fa-user-plus"></i> 新增客户</button>
  </div>
</div>

<!-- 统计卡片 -->
<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_CUSTOMERS.length}</div><div class="stat-label">总客户数</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_CUSTOMERS.filter(c => c.status === 'active').length}</div><div class="stat-label">活跃客户</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_CUSTOMERS.filter(c => c.plan === 'enterprise').length}</div><div class="stat-label">企业版</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_CUSTOMERS.filter(c => c.status === 'suspended').length}</div><div class="stat-label">已封禁</div></div>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-users"></i> 客户列表</div>
    <div style="display:flex;gap:8px">
      <select class="form-control" style="width:120px" onchange="filterByPlan(this.value)">
        <option value="">全部套餐</option>
        <option value="enterprise">企业版</option>
        <option value="pro">专业版</option>
        <option value="free">免费版</option>
      </select>
      <select class="form-control" style="width:120px" onchange="filterByStatus(this.value)">
        <option value="">全部状态</option>
        <option value="active">正常</option>
        <option value="suspended">已封禁</option>
      </select>
    </div>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table" id="customersTable">
      <thead>
        <tr>
          <th>客户信息</th>
          <th>套餐</th>
          <th>域名数</th>
          <th>本月流量</th>
          <th>累计消费</th>
          <th>状态</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${MOCK_CUSTOMERS.map(c => `
        <tr data-plan="${c.plan}" data-status="${c.status}" data-search="${c.name} ${c.company} ${c.email}">
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div class="user-avatar" style="width:34px;height:34px;font-size:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6)">${c.name[0]}</div>
              <div>
                <div style="font-weight:500">${c.name}</div>
                <div style="font-size:12px;color:var(--text-muted)">${c.company}</div>
                <div style="font-size:11px;color:var(--text-muted)">${c.email}</div>
              </div>
            </div>
          </td>
          <td>${statusBadge(c.plan)}</td>
          <td>${c.domains}</td>
          <td>${c.traffic}</td>
          <td>${c.spend}</td>
          <td>${statusBadge(c.status)}</td>
          <td style="color:var(--text-muted);font-size:12px">${c.joined}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm" onclick="viewCustomer('${c.id}')"><i class="fas fa-eye"></i></button>
              ${c.status === 'active'
                ? `<button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)" onclick="suspendCustomer('${c.id}','${c.name}')"><i class="fas fa-ban"></i></button>`
                : `<button class="btn btn-outline btn-sm" onclick="activateCustomer('${c.id}','${c.name}')"><i class="fas fa-check"></i></button>`
              }
              <button class="btn btn-outline btn-sm" onclick="changePlan('${c.id}')"><i class="fas fa-arrow-up-right-from-square"></i></button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function filterCustomers(keyword) {
  const rows = document.querySelectorAll('#customersTable tbody tr');
  rows.forEach(row => {
    const text = row.dataset.search || '';
    row.style.display = text.includes(keyword) ? '' : 'none';
  });
}
function filterByPlan(plan) {
  const rows = document.querySelectorAll('#customersTable tbody tr');
  rows.forEach(row => {
    row.style.display = (!plan || row.dataset.plan === plan) ? '' : 'none';
  });
}
function filterByStatus(status) {
  const rows = document.querySelectorAll('#customersTable tbody tr');
  rows.forEach(row => {
    row.style.display = (!status || row.dataset.status === status) ? '' : 'none';
  });
}
async function suspendCustomer(id, name) {
  if (!confirm('确认封禁客户 ' + name + '？')) return;
  const res = await fetch('/admin/api/customers/' + id + '/suspend', { method: 'POST' });
  const data = await res.json();
  if (data.success) { showToast('已封禁客户 ' + name, 'success'); setTimeout(() => location.reload(), 1500); }
}
async function activateCustomer(id, name) {
  const res = await fetch('/admin/api/customers/' + id + '/activate', { method: 'POST' });
  const data = await res.json();
  if (data.success) { showToast('已恢复客户 ' + name, 'success'); setTimeout(() => location.reload(), 1500); }
}
function viewCustomer(id) { showToast('客户详情功能开发中...', 'info'); }
function changePlan(id) { showToast('套餐变更功能开发中...', 'info'); }
</script>`
}

function nodesHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">节点管理</h1>
    <p class="page-desc">管理全球CDN加速节点</p>
  </div>
  <button class="btn btn-primary"><i class="fas fa-plus"></i> 添加节点</button>
</div>

<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_NODES.length}</div><div class="stat-label">总节点数</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_NODES.filter(n=>n.status==='online').length}</div><div class="stat-label">在线</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_NODES.filter(n=>n.status==='warning').length}</div><div class="stat-label">告警</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-info"><div class="stat-value">${MOCK_NODES.filter(n=>n.status==='offline').length}</div><div class="stat-label">离线</div></div>
  </div>
</div>

<div class="card">
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead><tr><th>节点名称</th><th>IP地址</th><th>地区/运营商</th><th>状态</th><th>带宽(Gbps)</th><th>容量(Gbps)</th><th>CPU</th><th>内存</th><th>可用率</th><th>操作</th></tr></thead>
      <tbody>
        ${MOCK_NODES.map(n => `
        <tr>
          <td><span style="font-weight:500">${n.name}</span></td>
          <td><code style="font-size:12px;color:var(--text-muted)">${n.ip}</code></td>
          <td><span style="font-size:12px">${n.region} · ${n.isp}</span></td>
          <td>${statusBadge(n.status)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:rgba(255,255,255,0.1);border-radius:3px;height:6px;width:60px">
                <div style="background:${n.bandwidth/n.capacity > 0.8 ? '#ef4444' : '#10b981'};width:${Math.min(n.bandwidth/n.capacity*100,100)}%;height:100%;border-radius:3px"></div>
              </div>
              ${n.bandwidth}
            </div>
          </td>
          <td>${n.capacity}</td>
          <td>
            <span style="color:${n.cpu > 70 ? '#ef4444' : n.cpu > 50 ? '#f59e0b' : '#10b981'}">${n.cpu}%</span>
          </td>
          <td>
            <span style="color:${n.mem > 80 ? '#ef4444' : n.mem > 60 ? '#f59e0b' : '#10b981'}">${n.mem}%</span>
          </td>
          <td style="font-size:12px">${n.uptime}</td>
          <td>
            <div style="display:flex;gap:6px">
              ${n.status !== 'offline'
                ? `<button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)" onclick="nodeOffline('${n.id}')"><i class="fas fa-power-off"></i></button>`
                : `<button class="btn btn-outline btn-sm" onclick="nodeOnline('${n.id}')"><i class="fas fa-play"></i></button>`
              }
              <button class="btn btn-outline btn-sm"><i class="fas fa-chart-line"></i></button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

${TOAST_SCRIPT}
<script>
async function nodeOffline(id) {
  if (!confirm('确认将节点下线？下线后将不再接受流量调度。')) return;
  const res = await fetch('/admin/api/nodes/' + id + '/offline', { method: 'POST' });
  const data = await res.json();
  if (data.success) { showToast('节点已下线', 'success'); setTimeout(() => location.reload(), 1500); }
}
async function nodeOnline(id) {
  const res = await fetch('/admin/api/nodes/' + id + '/online', { method: 'POST' });
  const data = await res.json();
  if (data.success) { showToast('节点已上线', 'success'); setTimeout(() => location.reload(), 1500); }
}
</script>`
}

function dnsHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">DNS 调度管理</h1>
    <p class="page-desc">配置GSLB智能解析规则，实现就近接入</p>
  </div>
  <button class="btn btn-primary" onclick="openModal('addRuleModal')"><i class="fas fa-plus"></i> 新增规则</button>
</div>

<div class="grid-2" style="margin-bottom:20px">
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-network-wired"></i> 解析策略概览</div></div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between"><span>GSLB 调度模式</span><span class="badge badge-success"><span class="dot"></span>智能就近</span></div>
        <div style="display:flex;justify-content:space-between"><span>健康检查间隔</span><span style="color:var(--text-muted)">30s</span></div>
        <div style="display:flex;justify-content:space-between"><span>故障切换阈值</span><span style="color:var(--text-muted)">连续3次失败</span></div>
        <div style="display:flex;justify-content:space-between"><span>默认 TTL</span><span style="color:var(--text-muted)">60s</span></div>
        <div style="display:flex;justify-content:space-between"><span>Anycast 支持</span><span class="badge badge-success"><span class="dot"></span>已启用</span></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-heartbeat"></i> 健康检查状态</div></div>
    <div class="card-body">
      ${MOCK_NODES.slice(0,5).map(n => `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:13px">${n.name}</span>
        <div style="display:flex;gap:8px;align-items:center">
          ${statusBadge(n.status)}
          <span style="font-size:11px;color:var(--text-muted)">${Math.round(10 + Math.random()*20)}ms</span>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-list"></i> GSLB 解析规则列表</div>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead><tr><th>规则名称</th><th>匹配条件</th><th>目标节点组</th><th>权重</th><th>TTL(s)</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        ${MOCK_DNS_RULES.map(r => `
        <tr>
          <td><span style="font-weight:500">${r.name}</span></td>
          <td><code style="font-size:12px;color:var(--secondary)">${r.match}</code></td>
          <td>${r.nodeGroup}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:rgba(255,255,255,0.1);border-radius:3px;height:6px;width:80px">
                <div style="background:var(--secondary);width:${r.weight}%;height:100%;border-radius:3px"></div>
              </div>
              ${r.weight}
            </div>
          </td>
          <td>${r.ttl}</td>
          <td>${statusBadge(r.status)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></button>
              <button class="btn btn-outline btn-sm" onclick="toggleRule('${r.id}','${r.status}')">
                <i class="fas ${r.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
              </button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- DNS解析日志 -->
<div class="card" style="margin-top:20px">
  <div class="card-header"><div class="card-title"><i class="fas fa-file-lines"></i> 最近解析日志</div></div>
  <div class="card-body" style="padding:0">
    ${Array.from({length:6}, (_, i) => {
      const regions = ['CN-Telecom', 'CN-Unicom', 'HK', 'APAC', 'NA/EU', 'CN-Mobile']
      const nodes = ['华东-上海-01', '华东-上海-02', '香港-HK-01', '新加坡-SG-01', '美西-LA-01', '华南-广州-01']
      const ips = ['114.114.x.x', '123.125.x.x', '1.1.x.x', '103.x.x.x', '8.8.x.x', '120.x.x.x']
      return `<div style="padding:10px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:12px">
        <span style="color:var(--text-muted)">${new Date(Date.now() - i*30000).toLocaleTimeString()}</span>
        <code style="color:var(--secondary)">${ips[i]}</code>
        <span>${regions[i]}</span>
        <span style="color:var(--text-muted)">→</span>
        <span style="color:var(--success)">${nodes[i]}</span>
        <span style="color:var(--text-muted)">${Math.round(1+Math.random()*9)}ms</span>
      </div>`
    }).join('')}
  </div>
</div>

${TOAST_SCRIPT}
<script>
function toggleRule(id, status) {
  showToast(status === 'active' ? '规则已暂停' : '规则已启用', 'success');
}
</script>`
}

function schedulingHtml(): string {
  const groups = [
    { id: 'g001', name: '华东电信组', nodes: 2, mode: '轮询', weight: 100, failover: '华东联通组', status: 'active', rateLimit: '1Gbps/节点' },
    { id: 'g002', name: '华东联通组', nodes: 2, mode: '最小连接', weight: 100, failover: '华东电信组', status: 'active', rateLimit: '1Gbps/节点' },
    { id: 'g003', name: '华南移动组', nodes: 1, mode: '轮询', weight: 100, failover: '华东电信组', status: 'active', rateLimit: '500Mbps/节点' },
    { id: 'g004', name: '香港节点组', nodes: 1, mode: '单节点', weight: 80, failover: '新加坡节点组', status: 'active', rateLimit: '500Mbps/节点' },
    { id: 'g005', name: '新加坡节点组', nodes: 1, mode: '单节点', weight: 80, failover: '香港节点组', status: 'active', rateLimit: '500Mbps/节点' },
    { id: 'g006', name: '美西节点组', nodes: 1, mode: '单节点', weight: 60, failover: '新加坡节点组', status: 'inactive', rateLimit: '500Mbps/节点' },
  ]

  return `
<div class="page-header">
  <div>
    <h1 class="page-title">调度策略</h1>
    <p class="page-desc">配置节点组、故障转移与限速策略</p>
  </div>
  <button class="btn btn-primary"><i class="fas fa-plus"></i> 新建节点组</button>
</div>

<!-- 全局策略 -->
<div class="card" style="margin-bottom:20px">
  <div class="card-header"><div class="card-title"><i class="fas fa-sliders"></i> 全局调度参数</div></div>
  <div class="card-body">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      <div>
        <label class="form-label">健康检查协议</label>
        <select class="form-control"><option>HTTP GET /health</option><option>TCP</option><option>ICMP</option></select>
      </div>
      <div>
        <label class="form-label">健康检查间隔</label>
        <select class="form-control"><option>30s</option><option>15s</option><option>60s</option></select>
      </div>
      <div>
        <label class="form-label">故障判定阈值</label>
        <select class="form-control"><option>连续3次失败</option><option>连续2次失败</option><option>连续5次失败</option></select>
      </div>
      <div>
        <label class="form-label">熔断恢复时间</label>
        <select class="form-control"><option>60s</option><option>30s</option><option>120s</option></select>
      </div>
      <div>
        <label class="form-label">单IP限速（全局）</label>
        <input type="text" class="form-control" value="100Mbps">
      </div>
      <div>
        <label class="form-label">回源策略</label>
        <select class="form-control"><option>最近节点回源</option><option>固定回源IP</option><option>轮询回源</option></select>
      </div>
    </div>
    <div style="margin-top:16px;display:flex;justify-content:flex-end">
      <button class="btn btn-primary" onclick="saveGlobal()"><i class="fas fa-save"></i> 保存全局配置</button>
    </div>
  </div>
</div>

<!-- 节点组 -->
<div class="card">
  <div class="card-header"><div class="card-title"><i class="fas fa-layer-group"></i> 节点组配置</div></div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead><tr><th>节点组名称</th><th>节点数</th><th>调度模式</th><th>权重</th><th>故障转移</th><th>限速</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        ${groups.map(g => `
        <tr>
          <td><span style="font-weight:500">${g.name}</span></td>
          <td>${g.nodes}</td>
          <td><span class="badge badge-info">${g.mode}</span></td>
          <td>${g.weight}%</td>
          <td style="font-size:12px;color:var(--text-muted)">${g.failover}</td>
          <td style="font-size:12px">${g.rateLimit}</td>
          <td>${statusBadge(g.status)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></button>
              <button class="btn btn-outline btn-sm"><i class="fas fa-chart-bar"></i></button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function saveGlobal() { showToast('全局调度配置已保存', 'success'); }
</script>`
}

function domainReviewHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">域名审核</h1>
    <p class="page-desc">审核客户提交的加速域名，验证ICP备案合规性</p>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span class="badge badge-warning"><span class="dot"></span>${MOCK_PENDING_DOMAINS.filter(d=>d.status==='pending').length} 待审核</span>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-magnifying-glass"></i> 审核队列</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm active">全部</button>
      <button class="btn btn-outline btn-sm">待审核</button>
      <button class="btn btn-outline btn-sm">审核中</button>
      <button class="btn btn-outline btn-sm">已通过</button>
      <button class="btn btn-outline btn-sm">已拒绝</button>
    </div>
  </div>
  <div class="card-body" style="padding:0">
    ${MOCK_PENDING_DOMAINS.map(d => `
    <div class="review-item" style="padding:16px;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span style="font-weight:600;font-size:15px">${d.domain}</span>
            ${statusBadge(d.status)}
            <span class="badge badge-info">${d.type}</span>
          </div>
          <div style="display:flex;gap:20px;font-size:12px;color:var(--text-muted)">
            <span><i class="fas fa-user" style="margin-right:4px"></i>${d.customer}</span>
            <span><i class="fas fa-file-certificate" style="margin-right:4px"></i>${d.icp}</span>
            <span><i class="fas fa-clock" style="margin-right:4px"></i>${d.submitted}</span>
          </div>
        </div>
        ${d.status !== 'approved' && d.status !== 'rejected' ? `
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="btn btn-sm" style="background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2)" 
            onclick="approveDomain('${d.id}','${d.domain}')">
            <i class="fas fa-check"></i> 通过
          </button>
          <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)"
            onclick="rejectDomain('${d.id}','${d.domain}')">
            <i class="fas fa-times"></i> 拒绝
          </button>
        </div>` : ''}
      </div>
      ${d.icp === '未备案' ? `
      <div style="margin-top:8px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:6px;padding:8px 12px;font-size:12px;color:#ef4444">
        <i class="fas fa-exclamation-triangle"></i> 警告：该域名未提供ICP备案号，建议拒绝或要求补充材料
      </div>` : ''}
    </div>`).join('')}
  </div>
</div>

${TOAST_SCRIPT}
<script>
async function approveDomain(id, domain) {
  const res = await fetch('/admin/api/domains/review/' + id + '/approve', { method: 'POST' });
  const data = await res.json();
  if (data.success) { showToast('域名 ' + domain + ' 已通过审核', 'success'); setTimeout(() => location.reload(), 1500); }
}
function rejectDomain(id, domain) {
  const reason = prompt('请输入拒绝原因：', '域名未完成ICP备案，请完成备案后重新提交');
  if (!reason) return;
  fetch('/admin/api/domains/review/' + id + '/reject', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({reason}) })
    .then(r => r.json()).then(d => { if (d.success) { showToast('已拒绝域名 ' + domain, 'error'); setTimeout(() => location.reload(), 1500); } });
}
</script>`
}

function financeHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">财务管理</h1>
    <p class="page-desc">收入分析、账单管理与财务报表</p>
  </div>
  <div style="display:flex;gap:10px">
    <select class="form-control"><option>2026年2月</option><option>2026年1月</option><option>2025年12月</option></select>
    <button class="btn btn-outline"><i class="fas fa-download"></i> 导出报表</button>
  </div>
</div>

<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(16,185,129,0.15)"><i class="fas fa-yuan-sign" style="color:#10b981"></i></div>
    <div class="stat-info">
      <div class="stat-value">¥${(MOCK_FINANCE.today.revenue/100).toFixed(0)}</div>
      <div class="stat-label">今日收入</div>
      <div class="stat-change positive">↑ 8.2% vs 昨日</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(99,102,241,0.15)"><i class="fas fa-chart-line" style="color:#6366f1"></i></div>
    <div class="stat-info">
      <div class="stat-value">¥${(MOCK_FINANCE.month.revenue/10000).toFixed(1)}万</div>
      <div class="stat-label">本月收入</div>
      <div class="stat-change positive">目标完成 ${Math.round(MOCK_FINANCE.month.revenue/MOCK_FINANCE.month.target*100)}%</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(245,158,11,0.15)"><i class="fas fa-file-invoice" style="color:#f59e0b"></i></div>
    <div class="stat-info">
      <div class="stat-value">¥${(MOCK_FINANCE.pending.amount/10000).toFixed(1)}万</div>
      <div class="stat-label">待收款</div>
      <div class="stat-change">${MOCK_FINANCE.pending.count} 笔待处理</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(239,68,68,0.15)"><i class="fas fa-calendar-check" style="color:#ef4444"></i></div>
    <div class="stat-info">
      <div class="stat-value">¥${(MOCK_FINANCE.year.revenue/10000).toFixed(0)}万</div>
      <div class="stat-label">年度累计收入</div>
      <div class="stat-change positive">同比增长 32%</div>
    </div>
  </div>
</div>

<div class="grid-2">
  <!-- 收入构成 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-chart-pie"></i> 本月收入构成</div></div>
    <div class="card-body">
      <canvas id="revenueChart" height="200"></canvas>
    </div>
  </div>
  <!-- 近6月趋势 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-chart-bar"></i> 近6月营收趋势</div></div>
    <div class="card-body">
      <canvas id="monthChart" height="200"></canvas>
    </div>
  </div>
</div>

<!-- 账单列表 -->
<div class="card" style="margin-top:20px">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-list"></i> 最近账单记录</div>
    <button class="btn btn-outline btn-sm">查看全部</button>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead><tr><th>账单号</th><th>客户</th><th>套餐</th><th>金额</th><th>状态</th><th>账期</th><th>操作</th></tr></thead>
      <tbody>
        ${MOCK_CUSTOMERS.map((c, i) => `
        <tr>
          <td><code style="font-size:12px">INV-2026${String(i+1).padStart(4,'0')}</code></td>
          <td>${c.name} · ${c.company}</td>
          <td>${statusBadge(c.plan)}</td>
          <td style="font-weight:600;color:var(--success)">${c.spend}</td>
          <td>${statusBadge(i < 4 ? 'active' : 'pending')}</td>
          <td style="font-size:12px;color:var(--text-muted)">2026-02</td>
          <td><button class="btn btn-outline btn-sm"><i class="fas fa-download"></i></button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

${TOAST_SCRIPT}
<script>
new Chart(document.getElementById('revenueChart').getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: ['流量计费', '套餐费用', '增值服务', '安全服务'],
    datasets: [{ data: [45, 30, 15, 10], backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444'], borderWidth: 0 }]
  },
  options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 } } } } }
});
new Chart(document.getElementById('monthChart').getContext('2d'), {
  type: 'bar',
  data: {
    labels: ['9月','10月','11月','12月','1月','2月'],
    datasets: [{ label: '营收(万元)', data: [18.2, 21.4, 23.8, 25.1, 27.3, 28.5], backgroundColor: 'rgba(99,102,241,0.6)', borderRadius: 6 }]
  },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
});
</script>`
}

function securityHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">安全管理</h1>
    <p class="page-desc">DDoS防护、WAF规则与全局安全策略</p>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span class="badge badge-success"><span class="dot"></span>防护正常</span>
    <button class="btn btn-primary"><i class="fas fa-shield-halved"></i> 配置WAF规则</button>
  </div>
</div>

<!-- 安全概览 -->
<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(239,68,68,0.15)"><i class="fas fa-shield-halved" style="color:#ef4444"></i></div>
    <div class="stat-info"><div class="stat-value">1,284</div><div class="stat-label">今日拦截请求</div><div class="stat-change" style="color:#ef4444">↑ 34% vs 昨日</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(245,158,11,0.15)"><i class="fas fa-bolt" style="color:#f59e0b"></i></div>
    <div class="stat-info"><div class="stat-value">2</div><div class="stat-label">活跃DDoS事件</div><div class="stat-change">已自动缓解</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(99,102,241,0.15)"><i class="fas fa-ban" style="color:#6366f1"></i></div>
    <div class="stat-info"><div class="stat-value">386</div><div class="stat-label">全局IP黑名单</div><div class="stat-change positive">↑ 12 今日新增</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(16,185,129,0.15)"><i class="fas fa-check-shield" style="color:#10b981"></i></div>
    <div class="stat-info"><div class="stat-value">99.94%</div><div class="stat-label">安全防护覆盖率</div><div class="stat-change positive">高于行业均值</div></div>
  </div>
</div>

<div class="grid-2" style="margin-bottom:20px">
  <!-- DDoS 监控 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-chart-area"></i> DDoS 流量分析（今日）</div></div>
    <div class="card-body"><canvas id="ddosChart" height="150"></canvas></div>
  </div>
  <!-- WAF 规则 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-shield-halved"></i> WAF 规则集状态</div></div>
    <div class="card-body">
      ${[
        { name: 'SQL注入防护', status: 'active', hits: 234 },
        { name: 'XSS攻击防护', status: 'active', hits: 89 },
        { name: 'CC攻击限速', status: 'active', hits: 512 },
        { name: '文件上传防护', status: 'active', hits: 12 },
        { name: '恶意扫描检测', status: 'active', hits: 437 },
      ].map(r => `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px">
          ${statusBadge(r.status)}
          <span style="font-size:13px">${r.name}</span>
        </div>
        <span style="font-size:12px;color:var(--text-muted)">今日命中 ${r.hits}</span>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- 攻击事件日志 -->
<div class="card">
  <div class="card-header"><div class="card-title"><i class="fas fa-file-shield"></i> 近期攻击事件</div></div>
  <div class="card-body" style="padding:0">
    ${[
      { time: '14:23:11', ip: '103.21.244.18', type: 'DDoS UDP Flood', target: 'cdn.shopxyz.cn', action: '已缓解', peak: '12.4 Gbps' },
      { time: '13:45:02', ip: '45.138.0.44', type: 'CC攻击', target: 'api.fastgame.io', action: '已拦截', peak: '8,400 req/s' },
      { time: '11:20:33', ip: '192.3.88.91', type: 'SQL注入', target: '多个域名', action: '已拦截', peak: '-' },
      { time: '09:12:55', ip: '198.51.100.23', type: 'XSS探测', target: 'img.newsportal.com', action: '已拦截', peak: '-' },
    ].map(e => `
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:12px">
      <span style="color:var(--text-muted);width:70px">${e.time}</span>
      <code style="color:#ef4444;width:120px">${e.ip}</code>
      <span style="width:120px">${e.type}</span>
      <span style="color:var(--text-muted);width:140px">${e.target}</span>
      <span style="color:var(--text-muted);width:100px">${e.peak}</span>
      <span class="badge badge-success">${e.action}</span>
    </div>`).join('')}
  </div>
</div>

${TOAST_SCRIPT}
<script>
new Chart(document.getElementById('ddosChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(genHourLabels())},
    datasets: [
      { label: '正常流量', data: ${JSON.stringify(gen24hBandwidth(300,100))}, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 0 },
      { label: '攻击流量', data: ${JSON.stringify(gen24hBandwidth(20,80))}, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 0 }
    ]
  },
  options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 } }, y: { ticks: { color: '#94a3b8' } } } }
});
</script>`
}

function packagesHtml(): string {
  const plans = [
    { id: 'p001', name: '免费版', price: 0, traffic: '10GB/月', domains: 1, ssl: '共享', features: ['基础加速', 'HTTP/2'], status: 'active', users: 28 },
    { id: 'p002', name: '专业版 Pro', price: 299, traffic: '1TB/月', domains: 10, ssl: '独立SSL', features: ['全球加速', '访问控制', '告警配置', 'API访问'], status: 'active', users: 142 },
    { id: 'p003', name: '企业版', price: 1299, traffic: '无限流量', domains: 99, ssl: '免费SSL+上传', features: ['专属节点', 'DDoS防护', '7×24支持', 'SLA保障', '私有化部署'], status: 'active', users: 35 },
    { id: 'p004', name: '按量计费', price: 0, traffic: '¥0.12/GB', domains: 5, ssl: '独立SSL', features: ['弹性扩容', '按需付费'], status: 'active', users: 67 },
  ]
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">套餐管理</h1>
    <p class="page-desc">管理产品定价与套餐配置</p>
  </div>
  <button class="btn btn-primary"><i class="fas fa-plus"></i> 新建套餐</button>
</div>

<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px">
  ${plans.map(p => `
  <div class="card" style="border:1px solid ${p.name.includes('企业') ? '#6366f1' : 'var(--border)'}">
    <div class="card-header" style="${p.name.includes('企业') ? 'background:rgba(99,102,241,0.05)' : ''}">
      <div>
        <div class="card-title">${p.name}</div>
        <div style="font-size:22px;font-weight:700;color:var(--primary);margin-top:4px">
          ${p.price === 0 ? (p.traffic.includes('¥') ? p.traffic : '免费') : `¥${p.price}<span style="font-size:13px;color:var(--text-muted)">/月</span>`}
        </div>
      </div>
      <div style="text-align:right">
        ${statusBadge(p.status)}
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${p.users} 用户在用</div>
      </div>
    </div>
    <div class="card-body">
      <div style="display:flex;gap:12px;margin-bottom:12px;font-size:12px">
        <div style="display:flex;align-items:center;gap:4px;color:var(--text-muted)">
          <i class="fas fa-bolt"></i> ${p.traffic}
        </div>
        <div style="display:flex;align-items:center;gap:4px;color:var(--text-muted)">
          <i class="fas fa-globe"></i> ${p.domains} 个域名
        </div>
        <div style="display:flex;align-items:center;gap:4px;color:var(--text-muted)">
          <i class="fas fa-shield-halved"></i> ${p.ssl}
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        ${p.features.map(f => `<span style="font-size:11px;background:rgba(99,102,241,0.1);color:#a5b4fc;padding:3px 8px;border-radius:4px">${f}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm"><i class="fas fa-edit"></i> 编辑</button>
        <button class="btn btn-outline btn-sm"><i class="fas fa-chart-bar"></i> 用量统计</button>
      </div>
    </div>
  </div>`).join('')}
</div>

<!-- 流量包 -->
<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-box"></i> 独立流量包</div>
    <button class="btn btn-outline btn-sm"><i class="fas fa-plus"></i> 新增流量包</button>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead><tr><th>流量包名称</th><th>容量</th><th>定价</th><th>有效期</th><th>已售</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        ${[
          { name: '500GB流量包', cap: '500GB', price: '¥45', valid: '30天', sold: 234 },
          { name: '2TB流量包', cap: '2TB', price: '¥158', valid: '60天', sold: 87 },
          { name: '10TB流量包', cap: '10TB', price: '¥680', valid: '90天', sold: 23 },
        ].map(t => `
        <tr>
          <td>${t.name}</td>
          <td>${t.cap}</td>
          <td style="color:var(--success);font-weight:600">${t.price}</td>
          <td>${t.valid}</td>
          <td>${t.sold} 个</td>
          <td>${statusBadge('active')}</td>
          <td><button class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`
}

function ticketsHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">工单系统</h1>
    <p class="page-desc">处理客户技术支持请求</p>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span class="badge badge-danger">${MOCK_TICKETS.filter(t=>t.status==='open').length} 待处理</span>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm active">全部</button>
      <button class="btn btn-outline btn-sm">待处理</button>
      <button class="btn btn-outline btn-sm">处理中</button>
      <button class="btn btn-outline btn-sm">已解决</button>
    </div>
    <input type="text" class="form-control" placeholder="搜索工单..." style="width:200px">
  </div>
  <div class="card-body" style="padding:0">
    ${MOCK_TICKETS.map(t => `
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            ${statusBadge(t.priority)}
            <span style="font-weight:500">${t.subject}</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);display:flex;gap:16px">
            <span><i class="fas fa-user"></i> ${t.customer}</span>
            <span><i class="fas fa-user-tie"></i> ${t.assigned}</span>
            <span><i class="fas fa-clock"></i> ${t.created}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          ${statusBadge(t.status)}
          <button class="btn btn-outline btn-sm" onclick="openTicket('${t.id}')">
            <i class="fas fa-reply"></i> 回复
          </button>
        </div>
      </div>
    </div>`).join('')}
  </div>
</div>

${TOAST_SCRIPT}
<script>
function openTicket(id) { showToast('工单详情功能开发中...', 'info'); }
</script>`
}

function auditLogsHtml(): string {
  const logs = [
    { time: '2026-02-26 14:23:11', admin: 'Admin', action: '封禁客户', target: '王五(c003)', ip: '192.168.1.100', result: 'success' },
    { time: '2026-02-26 13:45:02', admin: 'Admin', action: '通过域名审核', target: 'img.shopfast.cn', ip: '192.168.1.100', result: 'success' },
    { time: '2026-02-26 11:20:33', admin: 'Admin', action: '下线节点', target: '美西-LA-01', ip: '192.168.1.100', result: 'success' },
    { time: '2026-02-26 09:12:55', admin: 'Admin', action: '修改套餐定价', target: '专业版 Pro', ip: '192.168.1.100', result: 'success' },
    { time: '2026-02-25 18:30:22', admin: 'Admin', action: '添加WAF规则', target: 'SQL注入防护', ip: '192.168.1.100', result: 'success' },
    { time: '2026-02-25 16:15:44', admin: 'Admin', action: '修改DNS规则', target: '中国大陆-电信', ip: '192.168.1.100', result: 'success' },
  ]

  return `
<div class="page-header">
  <div>
    <h1 class="page-title">操作审计</h1>
    <p class="page-desc">记录所有管理员操作行为，保障系统安全</p>
  </div>
  <div style="display:flex;gap:10px">
    <input type="date" class="form-control" value="2026-02-26">
    <button class="btn btn-outline"><i class="fas fa-download"></i> 导出日志</button>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-file-shield"></i> 操作日志</div>
    <div style="display:flex;gap:8px">
      <select class="form-control" style="width:120px">
        <option>全部管理员</option>
        <option>Admin</option>
      </select>
      <select class="form-control" style="width:140px">
        <option>全部操作类型</option>
        <option>客户管理</option>
        <option>节点管理</option>
        <option>域名审核</option>
      </select>
    </div>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead><tr><th>操作时间</th><th>管理员</th><th>操作类型</th><th>操作对象</th><th>IP地址</th><th>结果</th></tr></thead>
      <tbody>
        ${logs.map(l => `
        <tr>
          <td style="font-size:12px;color:var(--text-muted)">${l.time}</td>
          <td><span style="font-weight:500">${l.admin}</span></td>
          <td>${l.action}</td>
          <td style="font-size:12px">${l.target}</td>
          <td><code style="font-size:12px">${l.ip}</code></td>
          <td>${statusBadge(l.result)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`
}

function settingsHtml(): string {
  return `
<div class="page-header">
  <div>
    <h1 class="page-title">系统配置</h1>
    <p class="page-desc">全局参数、管理员账号与权限配置</p>
  </div>
</div>

<div class="grid-2">
  <!-- 全局缓存配置 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-database"></i> 全局缓存策略</div></div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">默认缓存时间</label>
        <select class="form-control"><option>1天 (86400s)</option><option>7天</option><option>30天</option><option>永不过期</option></select>
      </div>
      <div class="form-group">
        <label class="form-label">缓存命中率目标</label>
        <input type="number" class="form-control" value="95" min="0" max="100">
      </div>
      <div class="form-group">
        <label class="form-label">不缓存扩展名</label>
        <input type="text" class="form-control" value=".php,.asp,.jsp">
      </div>
      <button class="btn btn-primary" onclick="saveConfig('缓存策略')"><i class="fas fa-save"></i> 保存</button>
    </div>
  </div>

  <!-- 带宽限速 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-gauge-high"></i> 带宽限速配置</div></div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">单用户最大带宽（免费版）</label>
        <input type="text" class="form-control" value="10 Mbps">
      </div>
      <div class="form-group">
        <label class="form-label">单用户最大带宽（专业版）</label>
        <input type="text" class="form-control" value="1 Gbps">
      </div>
      <div class="form-group">
        <label class="form-label">单IP并发连接数限制</label>
        <input type="number" class="form-control" value="1000">
      </div>
      <button class="btn btn-primary" onclick="saveConfig('带宽限速')"><i class="fas fa-save"></i> 保存</button>
    </div>
  </div>

  <!-- 管理员账号 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-user-shield"></i> 管理员账号</div>
      <button class="btn btn-outline btn-sm"><i class="fas fa-plus"></i> 添加管理员</button>
    </div>
    <div class="card-body" style="padding:0">
      ${[
        { name: 'Admin', email: 'admin@agentfast.io', role: '超级管理员', lastLogin: '刚刚' },
        { name: '客服小王', email: 'wang@agentfast.io', role: '客服', lastLogin: '2小时前' },
        { name: '技术小李', email: 'li@agentfast.io', role: '技术支持', lastLogin: '昨天' },
      ].map(a => `
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-avatar" style="width:32px;height:32px;font-size:12px">${a.name[0]}</div>
          <div>
            <div style="font-weight:500;font-size:13px">${a.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${a.email} · ${a.role}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted)">
          <span>${a.lastLogin}登录</span>
          <button class="btn btn-outline btn-sm"><i class="fas fa-edit"></i></button>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- 通知配置 -->
  <div class="card">
    <div class="card-header"><div class="card-title"><i class="fas fa-bell"></i> 通知与告警配置</div></div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">运营告警邮件</label>
        <input type="email" class="form-control" value="ops@agentfast.io">
      </div>
      <div class="form-group">
        <label class="form-label">节点故障短信接收</label>
        <input type="text" class="form-control" value="+86 138****8888">
      </div>
      <div class="form-group" style="display:flex;align-items:center;justify-content:space-between">
        <label class="form-label" style="margin:0">工单新增时钉钉通知</label>
        <div style="position:relative;width:44px;height:24px;background:#10b981;border-radius:12px;cursor:pointer" onclick="this.style.background=this.style.background==='#10b981'?'rgba(255,255,255,0.1)':'#10b981'">
          <div style="position:absolute;top:3px;right:3px;width:18px;height:18px;background:white;border-radius:50%;transition:0.2s"></div>
        </div>
      </div>
      <button class="btn btn-primary" onclick="saveConfig('通知配置')"><i class="fas fa-save"></i> 保存</button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function saveConfig(name) { showToast(name + ' 配置已保存', 'success'); }
</script>`
}
