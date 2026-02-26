import { Hono } from 'hono'
import { html } from 'hono/html'
import { serveStatic } from 'hono/cloudflare-workers'
import adminRouter from './routes/admin/index'
import { accessControlRoute } from './routes/user/access-control'
import { alertsRoute } from './routes/user/alerts'
import { logsRoute } from './routes/user/logs'
import { originConfigRoute, ticketsUserRoute } from './routes/user/origin-tickets'
import { performanceRoute } from './routes/user/performance'
import { apiDocsRoute } from './routes/user/api-docs'

const app = new Hono()

// Mount admin backend
app.route('/admin', adminRouter)

// Mount user routes
app.route('/', accessControlRoute)
app.route('/', alertsRoute)
app.route('/', logsRoute)
app.route('/', originConfigRoute)
app.route('/', ticketsUserRoute)
app.route('/', performanceRoute)
app.route('/', apiDocsRoute)

// Serve static files from public/
app.use('/static/*', serveStatic({ root: './' }))

// ===================== SHARED COMPONENTS =====================

const Layout = (props: { title: string; activeNav: string; children: any }) => html`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title} - AgentFast CDN</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
<div class="app-layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⚡</div>
      <div>
        <div class="logo-text">AgentFast</div>
        <span class="logo-tag">CDN Platform</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">总览</div>
        <a href="/dashboard" class="nav-item ${props.activeNav === 'dashboard' ? 'active' : ''}">
          <i class="fas fa-chart-line"></i> 控制台
        </a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">加速服务</div>
        <a href="/domains" class="nav-item ${props.activeNav === 'domains' ? 'active' : ''}">
          <i class="fas fa-globe"></i> 域名管理
          <span class="nav-badge">12</span>
        </a>
        <a href="/traffic" class="nav-item ${props.activeNav === 'traffic' ? 'active' : ''}">
          <i class="fas fa-chart-area"></i> 流量统计
        </a>
        <a href="/cache" class="nav-item ${props.activeNav === 'cache' ? 'active' : ''}">
          <i class="fas fa-database"></i> 缓存管理
        </a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">安全与证书</div>
        <a href="/ssl" class="nav-item ${props.activeNav === 'ssl' ? 'active' : ''}">
          <i class="fas fa-shield-halved"></i> SSL 证书
          <span class="nav-badge" style="background:#f59e0b">2</span>
        </a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">账户</div>
        <a href="/billing" class="nav-item ${props.activeNav === 'billing' ? 'active' : ''}">
          <i class="fas fa-credit-card"></i> 用量计费
        </a>
        <a href="/settings" class="nav-item ${props.activeNav === 'settings' ? 'active' : ''}">
          <i class="fas fa-gear"></i> 系统设置
        </a>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info" onclick="window.location='/settings'">
        <div class="user-avatar">D</div>
        <div>
          <div class="user-name">David Zhang</div>
          <div class="user-plan">企业版 Pro</div>
        </div>
        <i class="fas fa-ellipsis" style="margin-left:auto;color:var(--text-muted);font-size:12px"></i>
      </div>
    </div>
  </aside>

  <!-- Main -->
  <div class="main-content">
    <header class="topbar">
      <div class="topbar-title">${props.title}</div>
      <div class="topbar-right">
        <div class="topbar-btn notif-dot" data-tooltip="通知">
          <i class="fas fa-bell"></i>
        </div>
        <div class="topbar-btn" data-tooltip="帮助文档">
          <i class="fas fa-circle-question"></i>
        </div>
        <a href="/" class="topbar-btn" data-tooltip="退出登录" style="text-decoration:none">
          <i class="fas fa-right-from-bracket"></i>
        </a>
      </div>
    </header>
    <main class="page-content fade-in">
      ${props.children}
    </main>
  </div>
</div>
</body>
</html>`

// ===================== LOGIN PAGE =====================
app.get('/', (c) => {
  return c.html(html`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - AgentFast CDN</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="auth-page">
  <div class="auth-container">
    <div class="auth-logo">
      <div class="logo-icon">⚡</div>
      <h1>AgentFast CDN</h1>
      <p>全球智能内容分发网络平台</p>
    </div>
    <div class="auth-card">
      <h2>欢迎回来</h2>
      <p class="subtitle">登录以管理您的 CDN 加速服务</p>
      <div class="form-group">
        <label><i class="fas fa-envelope" style="margin-right:6px;opacity:.6"></i>邮箱地址</label>
        <input type="email" placeholder="david@company.com" value="david@agentfast.io">
      </div>
      <div class="form-group">
        <label><i class="fas fa-lock" style="margin-right:6px;opacity:.6"></i>密码</label>
        <input type="password" placeholder="••••••••" value="••••••••">
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);cursor:pointer">
          <input type="checkbox" checked style="width:auto;accent-color:var(--primary)"> 记住我
        </label>
        <a href="#" style="font-size:13px;color:var(--primary-light);text-decoration:none">忘记密码?</a>
      </div>
      <a href="/dashboard" class="btn btn-primary">
        <i class="fas fa-arrow-right-to-bracket"></i> 立即登录
      </a>
      <div style="margin:20px 0;display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:1px;background:var(--border)"></div>
        <span style="font-size:12px;color:var(--text-muted)">或者</span>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <a href="/dashboard" class="btn btn-outline" style="font-size:13px">
          <i class="fab fa-github"></i> GitHub
        </a>
        <a href="/dashboard" class="btn btn-outline" style="font-size:13px">
          <i class="fab fa-google"></i> Google
        </a>
      </div>
    </div>
    <div class="auth-footer">
      还没有账号？<a href="/register">免费注册</a>
      <span style="margin:0 8px;opacity:.3">|</span>
      <a href="/dashboard">查看演示 Demo →</a>
    </div>
  </div>
</div>
</body>
</html>
  `)
})

// ===================== REGISTER PAGE =====================
app.get('/register', (c) => {
  return c.html(html`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注册 - AgentFast CDN</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="auth-page">
  <div class="auth-container" style="max-width:460px">
    <div class="auth-logo">
      <div class="logo-icon">⚡</div>
      <h1>AgentFast CDN</h1>
      <p>加速全球，触达每一个用户</p>
    </div>
    <div class="auth-card">
      <h2>创建账号</h2>
      <p class="subtitle">免费开始，按需升级，无隐藏费用</p>
      <div class="grid-2">
        <div class="form-group">
          <label>姓名</label>
          <input type="text" placeholder="张三">
        </div>
        <div class="form-group">
          <label>公司名称</label>
          <input type="text" placeholder="科技有限公司">
        </div>
      </div>
      <div class="form-group">
        <label>邮箱地址</label>
        <input type="email" placeholder="you@company.com">
      </div>
      <div class="form-group">
        <label>手机号码</label>
        <input type="tel" placeholder="+86 138 0000 0000">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>密码</label>
          <input type="password" placeholder="至少8位字符">
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input type="password" placeholder="再次输入密码">
        </div>
      </div>
      <div style="background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">选择套餐</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <label style="cursor:pointer">
            <input type="radio" name="plan" style="display:none">
            <div class="plan-option" style="padding:8px;border:1px solid var(--border);border-radius:6px;text-align:center;font-size:12px;transition:all 0.15s">
              <div style="font-weight:600;color:var(--text-primary)">免费版</div>
              <div style="color:var(--text-muted);margin-top:2px">100GB/月</div>
            </div>
          </label>
          <label style="cursor:pointer">
            <input type="radio" name="plan" checked style="display:none">
            <div style="padding:8px;border:2px solid var(--primary);border-radius:6px;text-align:center;font-size:12px;background:rgba(99,102,241,0.1)">
              <div style="font-weight:600;color:var(--primary-light)">专业版</div>
              <div style="color:var(--text-muted);margin-top:2px">1TB/月</div>
            </div>
          </label>
          <label style="cursor:pointer">
            <input type="radio" name="plan" style="display:none">
            <div style="padding:8px;border:1px solid var(--border);border-radius:6px;text-align:center;font-size:12px">
              <div style="font-weight:600;color:var(--text-primary)">企业版</div>
              <div style="color:var(--text-muted);margin-top:2px">不限量</div>
            </div>
          </label>
        </div>
      </div>
      <div style="margin-bottom:16px;font-size:12px;color:var(--text-secondary)">
        <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer">
          <input type="checkbox" checked style="width:auto;margin-top:2px;accent-color:var(--primary)">
          我已阅读并同意 <a href="#" style="color:var(--primary-light);text-decoration:none">服务协议</a> 和 <a href="#" style="color:var(--primary-light);text-decoration:none">隐私政策</a>
        </label>
      </div>
      <a href="/dashboard" class="btn btn-primary">
        <i class="fas fa-rocket"></i> 立即注册，免费开始
      </a>
    </div>
    <div class="auth-footer">
      已有账号？<a href="/">立即登录</a>
    </div>
  </div>
</div>
</body>
</html>
  `)
})

// ===================== DASHBOARD PAGE =====================
app.get('/dashboard', (c) => {
  return c.html(Layout({
    title: '控制台总览',
    activeNav: 'dashboard',
    children: html`
<!-- Stats Row -->
<div class="stats-grid">
  <div class="stat-card blue">
    <div class="stat-icon blue"><i class="fas fa-bolt"></i></div>
    <div class="stat-value">2.84<span style="font-size:16px;font-weight:500">TB</span></div>
    <div class="stat-label">今日流量</div>
    <div class="stat-change up"><i class="fas fa-arrow-trend-up"></i> +12.5% 较昨日</div>
  </div>
  <div class="stat-card green">
    <div class="stat-icon green"><i class="fas fa-chart-bar"></i></div>
    <div class="stat-value">486<span style="font-size:16px;font-weight:500">Gbps</span></div>
    <div class="stat-label">峰值带宽</div>
    <div class="stat-change up"><i class="fas fa-arrow-trend-up"></i> +8.3% 较昨日</div>
  </div>
  <div class="stat-card yellow">
    <div class="stat-icon yellow"><i class="fas fa-arrow-pointer"></i></div>
    <div class="stat-value">1.24<span style="font-size:16px;font-weight:500">亿</span></div>
    <div class="stat-label">请求次数</div>
    <div class="stat-change down"><i class="fas fa-arrow-trend-down"></i> -2.1% 较昨日</div>
  </div>
  <div class="stat-card red">
    <div class="stat-icon red" style="background:rgba(16,185,129,0.15);color:#34d399"><i class="fas fa-circle-check"></i></div>
    <div class="stat-value" style="color:#34d399">97.3<span style="font-size:16px;font-weight:500">%</span></div>
    <div class="stat-label">缓存命中率</div>
    <div class="stat-change up" style="color:var(--success)"><i class="fas fa-arrow-trend-up"></i> +1.2% 较昨日</div>
  </div>
</div>

<!-- Charts Row -->
<div class="chart-grid">
  <!-- Bandwidth Chart -->
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">带宽趋势</div>
        <div class="card-subtitle">过去 24 小时实时带宽（Gbps）</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="switchChart('24h')" id="btn-24h" style="border-color:var(--primary);color:var(--primary-light)">24小时</button>
        <button class="btn btn-outline btn-sm" onclick="switchChart('7d')" id="btn-7d">7天</button>
        <button class="btn btn-outline btn-sm" onclick="switchChart('30d')" id="btn-30d">30天</button>
      </div>
    </div>
    <div class="chart-container">
      <canvas id="bandwidthChart"></canvas>
    </div>
  </div>

  <!-- Side Panel -->
  <div style="display:flex;flex-direction:column;gap:16px">
    <!-- Hit Rate Donut -->
    <div class="card" style="flex:1">
      <div class="card-header" style="margin-bottom:8px">
        <div class="card-title">命中率分布</div>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:90px;height:90px;flex-shrink:0">
          <canvas id="hitRateChart"></canvas>
        </div>
        <div style="flex:1">
          <div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:12px;color:var(--text-secondary)"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--primary);margin-right:6px"></span>缓存命中</span>
              <span style="font-size:12px;font-weight:600">97.3%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:97.3%;background:var(--primary)"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:12px;color:var(--text-secondary)"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--dark-4);margin-right:6px"></span>回源请求</span>
              <span style="font-size:12px;font-weight:600">2.7%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:2.7%;background:var(--dark-4)"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Card -->
    <div class="card" style="flex:1">
      <div class="card-title" style="margin-bottom:12px">全球节点状态</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:var(--dark);border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--success)">48</div>
          <div style="font-size:11px;color:var(--text-muted)">正常节点</div>
        </div>
        <div style="background:var(--dark);border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--warning)">2</div>
          <div style="font-size:11px;color:var(--text-muted)">告警节点</div>
        </div>
        <div style="background:var(--dark);border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--secondary)">6</div>
          <div style="font-size:11px;color:var(--text-muted)">覆盖地区</div>
        </div>
        <div style="background:var(--dark);border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--primary-light)">99.95%</div>
          <div style="font-size:11px;color:var(--text-muted)">可用性</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Bottom Row -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
  <!-- Top Domains -->
  <div class="card" style="grid-column:span 2">
    <div class="card-header">
      <div>
        <div class="card-title">热门域名 Top 5</div>
        <div class="card-subtitle">今日流量排行</div>
      </div>
      <a href="/domains" class="btn btn-outline btn-sm">查看全部</a>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>域名</th>
          <th>今日流量</th>
          <th>带宽峰值</th>
          <th>命中率</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${[
          { rank: 1, domain: 'static.example.com', traffic: '842 GB', bw: '98 Gbps', hit: '98.2%', status: 'online' },
          { rank: 2, domain: 'cdn.shopxyz.cn', traffic: '631 GB', bw: '74 Gbps', hit: '96.8%', status: 'online' },
          { rank: 3, domain: 'img.newsportal.com', traffic: '428 GB', bw: '52 Gbps', hit: '97.5%', status: 'online' },
          { rank: 4, domain: 'api.gamehub.io', traffic: '289 GB', bw: '31 Gbps', hit: '94.1%', status: 'warning' },
          { rank: 5, domain: 'assets.educloud.cn', traffic: '198 GB', bw: '24 Gbps', hit: '97.9%', status: 'online' },
        ].map(d => html`
        <tr>
          <td style="color:var(--text-muted);font-weight:600">${d.rank}</td>
          <td>
            <div style="font-weight:500">${d.domain}</div>
          </td>
          <td style="font-weight:600">${d.traffic}</td>
          <td>${d.bw}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar" style="width:60px">
                <div class="progress-fill" style="width:${d.hit};background:var(--success)"></div>
              </div>
              <span style="font-size:12px">${d.hit}</span>
            </div>
          </td>
          <td>
            ${d.status === 'online'
              ? html`<span class="badge badge-success"><span class="dot"></span>正常</span>`
              : html`<span class="badge badge-warning"><span class="dot"></span>告警</span>`}
          </td>
        </tr>
        `)}
      </tbody>
    </table>
  </div>

  <!-- Recent Events -->
  <div class="card">
    <div class="card-header">
      <div class="card-title">最近事件</div>
      <span class="badge badge-info">实时</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[
        { icon: 'fa-shield-halved', color: 'var(--success)', text: 'SSL证书已自动续签', domain: 'cdn.shopxyz.cn', time: '2分钟前' },
        { icon: 'fa-triangle-exclamation', color: 'var(--warning)', text: '带宽异常告警', domain: 'api.gamehub.io', time: '15分钟前' },
        { icon: 'fa-rotate', color: 'var(--secondary)', text: '缓存刷新完成', domain: 'static.example.com', time: '32分钟前' },
        { icon: 'fa-circle-plus', color: 'var(--primary-light)', text: '新域名接入成功', domain: 'media.fastapp.io', time: '1小时前' },
        { icon: 'fa-circle-check', color: 'var(--success)', text: '节点巡检通过', domain: '48/50 节点正常', time: '2小时前' },
      ].map(e => html`
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="width:28px;height:28px;border-radius:8px;background:rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
          <i class="fas ${e.icon}" style="color:${e.color};font-size:12px"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;color:var(--text-primary)">${e.text}</div>
          <div style="font-size:11px;color:var(--text-muted)">${e.domain} · ${e.time}</div>
        </div>
      </div>
      `)}
    </div>
  </div>
</div>

<!-- Regional Distribution -->
<div class="card" style="margin-top:16px">
  <div class="card-header">
    <div>
      <div class="card-title">地区流量分布</div>
      <div class="card-subtitle">今日各地区流量占比</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px">
    ${[
      { region: '华东', traffic: '982 GB', pct: 34.6, color: '#6366f1' },
      { region: '华南', traffic: '641 GB', pct: 22.6, color: '#0ea5e9' },
      { region: '华北', traffic: '487 GB', pct: 17.2, color: '#10b981' },
      { region: '海外', traffic: '412 GB', pct: 14.5, color: '#f59e0b' },
      { region: '华西', traffic: '198 GB', pct: 7.0, color: '#8b5cf6' },
      { region: '其他', traffic: '120 GB', pct: 4.2, color: '#64748b' },
    ].map(r => html`
    <div style="background:var(--dark);border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:${r.color}">${r.pct}%</div>
      <div style="font-size:13px;font-weight:600;margin:4px 0">${r.region}</div>
      <div style="font-size:11px;color:var(--text-muted)">${r.traffic}</div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-fill" style="width:${r.pct}%;background:${r.color}"></div>
      </div>
    </div>
    `)}
  </div>
</div>

<script>
// Bandwidth Chart
const ctx = document.getElementById('bandwidthChart').getContext('2d');
const hours = Array.from({length:24}, (_,i) => i + ':00');

function generateData(base, variance) {
  return Array.from({length:24}, () => Math.round(base + (Math.random()-0.5)*variance));
}

const data24h = generateData(320, 200);
const data7d = Array.from({length:7}, () => generateData(300, 150)).flat().slice(0,24);
const data30d = Array.from({length:30}, () => Math.round(280 + Math.random()*200)).slice(0,24);

let bwChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: hours,
    datasets: [
      {
        label: '入站带宽',
        data: data24h,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: '出站带宽',
        data: data24h.map(v => Math.round(v * 0.85)),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 12 }, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: { mode: 'index', intersect: false, backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 }
    },
    scales: {
      x: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', font: { size: 11 }, maxRotation: 0, maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', font: { size: 11 }, callback: v => v + ' G' } }
    },
    interaction: { mode: 'index', intersect: false }
  }
});

// Switch chart periods
function switchChart(period) {
  document.querySelectorAll('[id^=btn-]').forEach(b => {
    b.style.borderColor = '';
    b.style.color = '';
  });
  document.getElementById('btn-' + period).style.borderColor = 'var(--primary)';
  document.getElementById('btn-' + period).style.color = 'var(--primary-light)';

  let newData;
  if (period === '24h') newData = data24h;
  else if (period === '7d') newData = Array.from({length:7}, () => Math.round(250 + Math.random()*200));
  else newData = Array.from({length:30}, () => Math.round(220 + Math.random()*250));

  bwChart.data.labels = period === '24h' ? hours : period === '7d' ? ['周一','周二','周三','周四','周五','周六','周日'] : Array.from({length:30}, (_,i) => (i+1)+'日');
  bwChart.data.datasets[0].data = newData;
  bwChart.data.datasets[1].data = newData.map(v => Math.round(v*0.85));
  bwChart.update();
}

// Hit Rate Donut
const ctx2 = document.getElementById('hitRateChart').getContext('2d');
new Chart(ctx2, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [97.3, 2.7],
      backgroundColor: ['#6366f1', '#334155'],
      borderWidth: 0,
      cutout: '72%'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  }
});
</script>
    `
  }))
})

// ===================== DOMAINS PAGE =====================
app.get('/domains', (c) => {
  const domains = [
    { id: 1, domain: 'static.example.com', cname: 'static.example.com.af-cdn.com', origin: 'origin1.example.com', status: 'active', ssl: true, traffic: '842 GB', requests: '3,241万', hitRate: '98.2%', added: '2025-11-01' },
    { id: 2, domain: 'cdn.shopxyz.cn', cname: 'cdn.shopxyz.cn.af-cdn.com', origin: '47.102.33.18', status: 'active', ssl: true, traffic: '631 GB', requests: '2,187万', hitRate: '96.8%', added: '2025-10-15' },
    { id: 3, domain: 'img.newsportal.com', cname: 'img.newsportal.com.af-cdn.com', origin: 'img-origin.newsportal.com', status: 'active', ssl: true, traffic: '428 GB', requests: '1,832万', hitRate: '97.5%', added: '2025-09-22' },
    { id: 4, domain: 'api.gamehub.io', cname: 'api.gamehub.io.af-cdn.com', origin: 'backend.gamehub.io', status: 'warning', ssl: true, traffic: '289 GB', requests: '4,521万', hitRate: '94.1%', added: '2025-08-30' },
    { id: 5, domain: 'assets.educloud.cn', cname: 'assets.educloud.cn.af-cdn.com', origin: 'oss.aliyuncs.com', status: 'active', ssl: true, traffic: '198 GB', requests: '891万', hitRate: '97.9%', added: '2025-08-10' },
    { id: 6, domain: 'media.fastapp.io', cname: 'media.fastapp.io.af-cdn.com', origin: 's3.amazonaws.com', status: 'deploying', ssl: false, traffic: '-', requests: '-', hitRate: '-', added: '2026-02-25' },
    { id: 7, domain: 'download.softpkg.net', cname: 'download.softpkg.net.af-cdn.com', origin: '120.88.12.44', status: 'active', ssl: true, traffic: '156 GB', requests: '432万', hitRate: '99.1%', added: '2025-07-18' },
    { id: 8, domain: 'video.stream365.cn', cname: 'video.stream365.cn.af-cdn.com', origin: 'vod.stream365.cn', status: 'offline', ssl: false, traffic: '0', requests: '0', hitRate: '-', added: '2025-06-01' },
  ]

  return c.html(Layout({
    title: '域名管理',
    activeNav: 'domains',
    children: html`
<div class="page-header">
  <div>
    <h2>域名管理</h2>
    <p>管理所有接入 AgentFast CDN 的加速域名</p>
  </div>
  <button class="btn btn-primary" onclick="openModal('addDomainModal')">
    <i class="fas fa-plus"></i> 添加域名
  </button>
</div>

<!-- Summary Stats -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${[
    { label: '域名总数', value: '12', icon: 'fa-globe', color: 'blue' },
    { label: '正常运行', value: '9', icon: 'fa-circle-check', color: 'green' },
    { label: '告警中', value: '2', icon: 'fa-triangle-exclamation', color: 'yellow' },
    { label: '今日总流量', value: '2.84 TB', icon: 'fa-bolt', color: 'blue' },
  ].map(s => html`
  <div class="card" style="padding:14px;display:flex;align-items:center;gap:12px">
    <div class="stat-icon ${s.color}" style="width:36px;height:36px;font-size:15px;margin:0">${html`<i class="fas ${s.icon}"></i>`}</div>
    <div>
      <div style="font-size:18px;font-weight:700">${s.value}</div>
      <div style="font-size:12px;color:var(--text-muted)">${s.label}</div>
    </div>
  </div>
  `)}
</div>

<!-- Filter Bar -->
<div class="filter-bar">
  <input type="text" placeholder="🔍  搜索域名..." style="flex:1;max-width:300px">
  <select>
    <option>全部状态</option>
    <option>正常</option>
    <option>告警</option>
    <option>部署中</option>
    <option>已停用</option>
  </select>
  <select>
    <option>按流量排序</option>
    <option>按添加时间</option>
    <option>按域名字母</option>
  </select>
</div>

<!-- Domains Table -->
<div class="card" style="padding:0;overflow:hidden">
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>加速域名</th>
          <th>CNAME 地址</th>
          <th>源站</th>
          <th>今日流量</th>
          <th>命中率</th>
          <th>SSL</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${domains.map(d => html`
        <tr>
          <td>
            <div style="font-weight:600">${d.domain}</div>
            <div style="font-size:11px;color:var(--text-muted)">添加于 ${d.added}</div>
          </td>
          <td>
            <div style="font-family:monospace;font-size:12px;color:var(--text-secondary)">${d.cname}</div>
          </td>
          <td>
            <div style="font-size:12px;color:var(--text-secondary)">${d.origin}</div>
          </td>
          <td style="font-weight:600">${d.traffic}</td>
          <td>${d.hitRate !== '-' ? html`<span style="color:var(--success)">${d.hitRate}</span>` : html`<span style="color:var(--text-muted)">-</span>`}</td>
          <td>
            ${d.ssl
              ? html`<span class="badge badge-success"><i class="fas fa-lock"></i> 已开启</span>`
              : html`<span class="badge badge-gray"><i class="fas fa-lock-open"></i> 未开启</span>`}
          </td>
          <td>
            ${d.status === 'active' ? html`<span class="badge badge-success"><span class="dot"></span>正常</span>` :
              d.status === 'warning' ? html`<span class="badge badge-warning"><span class="dot"></span>告警</span>` :
              d.status === 'deploying' ? html`<span class="badge badge-info"><span class="dot"></span>部署中</span>` :
              html`<span class="badge badge-gray"><span class="dot"></span>已停用</span>`}
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <a href="/domains/${d.id}" class="btn btn-outline btn-sm" style="padding:5px 10px">
                <i class="fas fa-gear"></i> 配置
              </a>
              <button class="btn btn-outline btn-sm" style="padding:5px 10px;color:var(--danger);border-color:rgba(239,68,68,0.3)" onclick="confirmDelete('${d.domain}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        `)}
      </tbody>
    </table>
  </div>
  <!-- Pagination -->
  <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--border)">
    <div style="font-size:12px;color:var(--text-muted)">共 12 条记录，显示第 1-8 条</div>
    <div style="display:flex;gap:6px">
      <button class="btn btn-outline btn-sm" disabled>← 上一页</button>
      <button class="btn btn-primary btn-sm">1</button>
      <button class="btn btn-outline btn-sm">2</button>
      <button class="btn btn-outline btn-sm">下一页 →</button>
    </div>
  </div>
</div>

<!-- Add Domain Modal -->
<div class="modal-overlay" id="addDomainModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title"><i class="fas fa-plus-circle" style="color:var(--primary-light);margin-right:8px"></i>添加加速域名</div>
      <button class="modal-close" onclick="closeModal('addDomainModal')"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label>加速域名 <span style="color:var(--danger)">*</span></label>
      <input type="text" placeholder="例如：static.yoursite.com">
      <div style="font-size:12px;color:var(--text-muted);margin-top:4px"><i class="fas fa-circle-info" style="margin-right:4px"></i>域名需已完成 ICP 备案</div>
    </div>
    <div class="form-group">
      <label>源站地址 <span style="color:var(--danger)">*</span></label>
      <input type="text" placeholder="例如：origin.yoursite.com 或 IP 地址">
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>源站端口</label>
        <input type="number" placeholder="80" value="80">
      </div>
      <div class="form-group">
        <label>加速类型</label>
        <select>
          <option>静态文件加速</option>
          <option>下载加速</option>
          <option>视频点播加速</option>
          <option>动态加速</option>
          <option>全站加速</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>加速区域</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['中国大陆', '中国香港', '亚太地区', '欧美地区', '全球'].map((r, i) => html`
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);cursor:pointer">
          <input type="checkbox" ${i < 2 ? 'checked' : ''} style="width:auto;accent-color:var(--primary)"> ${r}
        </label>
        `)}
      </div>
    </div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" checked style="width:auto;accent-color:var(--primary)">
        自动申请免费 SSL 证书（Let's Encrypt）
      </label>
    </div>
    <div class="alert alert-info" style="margin:0">
      <i class="fas fa-circle-info"></i>
      添加成功后，请将域名 CNAME 解析到分配的加速域名，生效约需 5-10 分钟
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('addDomainModal')">取消</button>
      <button class="btn btn-primary" onclick="closeModal('addDomainModal');showToast('域名添加成功，正在部署中...')">
        <i class="fas fa-rocket"></i> 确认添加
      </button>
    </div>
  </div>
</div>

<!-- Toast -->
<div id="toast" style="position:fixed;bottom:24px;right:24px;background:var(--dark-2);border:1px solid var(--success);color:var(--success);padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;z-index:999;transform:translateY(100px);transition:transform 0.3s;display:flex;align-items:center;gap:8px">
  <i class="fas fa-circle-check"></i>
  <span id="toastMsg"></span>
</div>

<script>
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function confirmDelete(domain) {
  if(confirm('确定要删除域名 ' + domain + ' 吗？此操作不可恢复。')) {
    showToast('域名 ' + domain + ' 已删除');
  }
}
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.style.transform = 'translateY(0)';
  setTimeout(() => t.style.transform = 'translateY(100px)', 3000);
}
</script>
    `
  }))
})

// Domain Detail Page
app.get('/domains/:id', (c) => {
  const id = c.req.param('id')
  return c.html(Layout({
    title: '域名配置',
    activeNav: 'domains',
    children: html`
<div class="page-header">
  <div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <a href="/domains" style="color:var(--text-muted);text-decoration:none;font-size:13px"><i class="fas fa-arrow-left"></i> 返回域名列表</a>
    </div>
    <h2>static.example.com</h2>
    <p>CNAME: static.example.com.af-cdn.com &nbsp;·&nbsp; <span class="badge badge-success" style="font-size:11px"><span class="dot"></span>正常运行</span></p>
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn btn-outline"><i class="fas fa-pause"></i> 暂停加速</button>
    <button class="btn btn-primary"><i class="fas fa-floppy-disk"></i> 保存配置</button>
  </div>
</div>

<div class="tabs">
  <div class="tab-item active">基础配置</div>
  <div class="tab-item">缓存规则</div>
  <div class="tab-item">访问控制</div>
  <div class="tab-item">HTTPS 配置</div>
  <div class="tab-item">性能优化</div>
</div>

<div class="grid-2" style="gap:20px">
  <div>
    <div class="card mb-4">
      <div class="card-title" style="margin-bottom:16px">源站配置</div>
      <div class="form-group">
        <label>主源站地址</label>
        <input value="origin1.example.com">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>源站端口</label>
          <input value="443">
        </div>
        <div class="form-group">
          <label>回源协议</label>
          <select><option selected>HTTPS</option><option>HTTP</option><option>跟随请求</option></select>
        </div>
      </div>
      <div class="form-group">
        <label>回源 Host</label>
        <input value="origin1.example.com">
      </div>
      <div class="form-group">
        <label>备用源站</label>
        <input placeholder="选填，主源不可用时自动切换">
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:16px">加速区域</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[['中国大陆', true, '45个节点'],['中国香港', true, '3个节点'],['亚太地区', false, '12个节点'],['欧美地区', false, '18个节点']].map(([r, checked, nodes]) => html`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--dark);border-radius:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="node-dot ${checked ? 'online' : 'offline'}"></div>
            <div>
              <div style="font-size:13px;font-weight:500">${r}</div>
              <div style="font-size:11px;color:var(--text-muted)">${nodes}</div>
            </div>
          </div>
          <label style="position:relative;display:inline-block;width:40px;height:22px">
            <input type="checkbox" ${checked ? 'checked' : ''} style="opacity:0;width:0;height:0">
            <span style="position:absolute;cursor:pointer;inset:0;background:${checked ? 'var(--primary)' : 'var(--dark-3)'};border-radius:22px;transition:0.2s"></span>
          </label>
        </div>
        `)}
      </div>
    </div>
  </div>

  <div>
    <div class="card mb-4">
      <div class="card-title" style="margin-bottom:16px">今日数据快照</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          ['今日流量', '842 GB', 'fa-bolt', '#6366f1'],
          ['请求次数', '3,241万', 'fa-arrow-pointer', '#0ea5e9'],
          ['缓存命中率', '98.2%', 'fa-circle-check', '#10b981'],
          ['平均响应', '18 ms', 'fa-stopwatch', '#f59e0b'],
        ].map(([l, v, i, c]) => html`
        <div style="background:var(--dark);border-radius:8px;padding:12px">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px"><i class="fas ${i}" style="color:${c};margin-right:4px"></i>${l}</div>
          <div style="font-size:18px;font-weight:700">${v}</div>
        </div>
        `)}
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-title" style="margin-bottom:16px">缓存设置</div>
      <div class="form-group">
        <label>默认缓存时间</label>
        <div style="display:flex;gap:8px">
          <input value="7" style="width:80px">
          <select style="flex:1"><option>天</option><option>小时</option><option>分钟</option></select>
        </div>
      </div>
      <div class="form-group">
        <label>忽略 Cache-Control 头</label>
        <select><option>否（跟随源站）</option><option>是（强制覆盖）</option></select>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px">
          <input type="checkbox" checked style="width:auto;accent-color:var(--primary)">
          开启 Gzip/Brotli 压缩
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:16px">防盗链</div>
      <div class="form-group">
        <label>Referer 黑/白名单</label>
        <select><option>不启用</option><option>白名单（只允许以下来源）</option><option>黑名单（禁止以下来源）</option></select>
      </div>
      <div class="form-group">
        <label>IP 访问限制</label>
        <textarea placeholder="每行一个IP或CIDR，例如：&#10;192.168.1.0/24&#10;10.0.0.1" style="height:80px;resize:vertical"></textarea>
      </div>
    </div>
  </div>
</div>
    `
  }))
})

// ===================== TRAFFIC PAGE =====================
app.get('/traffic', (c) => {
  return c.html(Layout({
    title: '流量统计',
    activeNav: 'traffic',
    children: html`
<div class="page-header">
  <div>
    <h2>流量统计</h2>
    <p>全面的带宽、流量、请求数据分析</p>
  </div>
  <div style="display:flex;gap:8px">
    <select class="filter-bar" style="padding:8px 14px;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none">
      <option>全部域名</option>
      <option>static.example.com</option>
      <option>cdn.shopxyz.cn</option>
      <option>img.newsportal.com</option>
    </select>
    <div style="display:flex;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;overflow:hidden">
      ${['今日','7天','30天','本月'].map((t, i) => html`
      <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='');this.style.background='var(--primary)'" style="padding:8px 14px;border:none;background:${i===0?'var(--primary)':'transparent'};color:var(--text-primary);font-size:13px;cursor:pointer;font-weight:500;transition:background 0.15s">${t}</button>
      `)}
    </div>
    <button class="btn btn-outline btn-sm"><i class="fas fa-download"></i> 导出报表</button>
  </div>
</div>

<!-- Stats Row -->
<div class="stats-grid" style="margin-bottom:20px">
  <div class="stat-card blue">
    <div class="stat-icon blue"><i class="fas fa-bolt"></i></div>
    <div class="stat-value">2.84<span style="font-size:16px">TB</span></div>
    <div class="stat-label">今日总流量</div>
    <div class="stat-change up"><i class="fas fa-arrow-trend-up"></i> +12.5% 环比昨日</div>
  </div>
  <div class="stat-card green">
    <div class="stat-icon green"><i class="fas fa-gauge-high"></i></div>
    <div class="stat-value">486<span style="font-size:16px">Gbps</span></div>
    <div class="stat-label">峰值带宽</div>
    <div class="stat-change up"><i class="fas fa-arrow-trend-up"></i> 发生于 14:32</div>
  </div>
  <div class="stat-card yellow">
    <div class="stat-icon yellow"><i class="fas fa-arrow-pointer"></i></div>
    <div class="stat-value">1.24<span style="font-size:16px">亿</span></div>
    <div class="stat-label">总请求次数</div>
    <div class="stat-change down"><i class="fas fa-arrow-trend-down"></i> -2.1% 环比昨日</div>
  </div>
  <div class="stat-card red">
    <div class="stat-icon red" style="background:rgba(16,185,129,0.15);color:#34d399"><i class="fas fa-circle-check"></i></div>
    <div class="stat-value" style="color:#34d399">97.3<span style="font-size:16px">%</span></div>
    <div class="stat-label">平均命中率</div>
    <div class="stat-change up" style="color:var(--success)"><i class="fas fa-arrow-trend-up"></i> +1.2% 环比昨日</div>
  </div>
</div>

<!-- Main Chart -->
<div class="card mb-6">
  <div class="card-header">
    <div>
      <div class="card-title">带宽 & 流量趋势</div>
      <div class="card-subtitle">今日 0:00 - 24:00（每小时统计）</div>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);cursor:pointer">
        <input type="checkbox" checked style="width:auto;accent-color:var(--primary)"> 带宽
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);cursor:pointer">
        <input type="checkbox" checked style="width:auto;accent-color:#0ea5e9"> 请求数
      </label>
    </div>
  </div>
  <div class="chart-container" style="height:300px">
    <canvas id="trafficChart"></canvas>
  </div>
</div>

<!-- Bottom 3 Charts -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px">
  <!-- Status Codes -->
  <div class="card">
    <div class="card-header">
      <div class="card-title">状态码分布</div>
    </div>
    <div class="chart-container" style="height:180px">
      <canvas id="statusChart"></canvas>
    </div>
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
      ${[['2xx 成功', '96.3%', '#10b981'],['3xx 重定向', '1.8%', '#f59e0b'],['4xx 客户端错误', '1.5%', '#ef4444'],['5xx 服务器错误', '0.4%', '#8b5cf6']].map(([l,v,c]) => html`
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px">
        <span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c}"></span>${l}</span>
        <span style="font-weight:600;color:${c}">${v}</span>
      </div>
      `)}
    </div>
  </div>

  <!-- Protocol Distribution -->
  <div class="card">
    <div class="card-header">
      <div class="card-title">协议分布</div>
    </div>
    <div class="chart-container" style="height:180px">
      <canvas id="protocolChart"></canvas>
    </div>
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
      ${[['HTTP/3', '54.2%', '#6366f1'],['HTTP/2', '38.1%', '#0ea5e9'],['HTTP/1.1', '7.7%', '#64748b']].map(([l,v,c]) => html`
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px">
        <span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c}"></span>${l}</span>
        <span style="font-weight:600;color:${c}">${v}</span>
      </div>
      `)}
    </div>
  </div>

  <!-- Hourly Top -->
  <div class="card">
    <div class="card-header">
      <div class="card-title">流量 Top 时段</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
      ${[
        ['14:00 - 15:00', '312 GB', 94],
        ['13:00 - 14:00', '298 GB', 90],
        ['20:00 - 21:00', '287 GB', 87],
        ['15:00 - 16:00', '274 GB', 83],
        ['12:00 - 13:00', '261 GB', 79],
        ['19:00 - 20:00', '248 GB', 75],
      ].map(([t, v, pct]) => html`
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
          <span style="color:var(--text-secondary)">${t}</span>
          <span style="font-weight:600">${v}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--primary),var(--secondary))"></div>
        </div>
      </div>
      `)}
    </div>
  </div>
</div>

<!-- Per-domain table -->
<div class="card" style="padding:0;overflow:hidden">
  <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <div class="card-title">各域名流量明细</div>
    <span style="font-size:12px;color:var(--text-muted)">今日数据，每5分钟更新</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>域名</th>
        <th>流量</th>
        <th>请求次数</th>
        <th>带宽峰值</th>
        <th>命中率</th>
        <th>平均响应</th>
        <th>流量占比</th>
      </tr>
    </thead>
    <tbody>
      ${[
        ['static.example.com', '842 GB', '3,241万', '98 Gbps', '98.2%', '12ms', 29.7],
        ['cdn.shopxyz.cn', '631 GB', '2,187万', '74 Gbps', '96.8%', '18ms', 22.2],
        ['img.newsportal.com', '428 GB', '1,832万', '52 Gbps', '97.5%', '21ms', 15.1],
        ['api.gamehub.io', '289 GB', '4,521万', '31 Gbps', '94.1%', '35ms', 10.2],
        ['assets.educloud.cn', '198 GB', '891万', '24 Gbps', '97.9%', '15ms', 7.0],
        ['download.softpkg.net', '156 GB', '432万', '19 Gbps', '99.1%', '9ms', 5.5],
      ].map(([d, t, r, b, h, resp, pct]) => html`
      <tr>
        <td style="font-weight:500">${d}</td>
        <td style="font-weight:600">${t}</td>
        <td>${r}</td>
        <td>${b}</td>
        <td style="color:var(--success)">${h}</td>
        <td style="color:var(--text-secondary)">${resp}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="progress-bar" style="width:80px">
              <div class="progress-fill" style="width:${pct * 3}%;background:linear-gradient(90deg,var(--primary),var(--secondary))"></div>
            </div>
            <span style="font-size:12px">${pct}%</span>
          </div>
        </td>
      </tr>
      `)}
    </tbody>
  </table>
</div>

<script>
// Traffic Chart
const tCtx = document.getElementById('trafficChart').getContext('2d');
const hours = Array.from({length:24}, (_,i) => i+':00');
const bwData = [82,71,65,58,62,89,134,198,267,312,298,321,298,312,324,287,261,248,287,298,271,243,189,142];
const reqData = [420,380,340,310,330,450,680,980,1340,1560,1490,1610,1490,1560,1620,1430,1310,1240,1430,1490,1360,1220,950,710];

new Chart(tCtx, {
  type: 'line',
  data: {
    labels: hours,
    datasets: [
      {
        label: '带宽 (Gbps)',
        data: bwData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        label: '请求数 (万次)',
        data: reqData,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'y1',
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', usePointStyle: true } },
      tooltip: { mode: 'index', intersect: false, backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }
    },
    scales: {
      x: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', callback: v => v+'G' }, position: 'left' },
      y1: { grid: { display: false }, ticks: { color: '#64748b', callback: v => v+'万' }, position: 'right' }
    }
  }
});

// Status Code Chart
new Chart(document.getElementById('statusChart').getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: ['2xx', '3xx', '4xx', '5xx'],
    datasets: [{ data: [96.3, 1.8, 1.5, 0.4], backgroundColor: ['#10b981','#f59e0b','#ef4444','#8b5cf6'], borderWidth: 0 }]
  },
  options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 } } }
});

// Protocol Chart
new Chart(document.getElementById('protocolChart').getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: ['HTTP/3', 'HTTP/2', 'HTTP/1.1'],
    datasets: [{ data: [54.2, 38.1, 7.7], backgroundColor: ['#6366f1','#0ea5e9','#64748b'], borderWidth: 0 }]
  },
  options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 } } }
});
</script>
    `
  }))
})

// ===================== CACHE PAGE =====================
app.get('/cache', (c) => {
  return c.html(Layout({
    title: '缓存管理',
    activeNav: 'cache',
    children: html`
<div class="page-header">
  <div>
    <h2>缓存管理</h2>
    <p>刷新、预热缓存，精准管控内容分发</p>
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
  <!-- Purge Panel -->
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title"><i class="fas fa-rotate" style="color:var(--primary-light);margin-right:8px"></i>缓存刷新</div>
        <div class="card-subtitle">删除 CDN 节点上的缓存内容，下次访问时重新回源</div>
      </div>
    </div>
    <div class="tabs" style="margin-bottom:16px">
      <div class="tab-item active" id="tab-url" onclick="switchTab('url')">URL 刷新</div>
      <div class="tab-item" id="tab-dir" onclick="switchTab('dir')">目录刷新</div>
      <div class="tab-item" id="tab-all" onclick="switchTab('all')">全量刷新</div>
    </div>

    <div id="panel-url">
      <div class="form-group">
        <label>加速域名</label>
        <select>
          <option>全部域名</option>
          <option selected>static.example.com</option>
          <option>cdn.shopxyz.cn</option>
          <option>img.newsportal.com</option>
        </select>
      </div>
      <div class="form-group">
        <label>刷新 URL <span style="color:var(--text-muted);font-weight:400">（每行一个，最多 100 条）</span></label>
        <textarea style="height:120px;resize:vertical;font-family:monospace;font-size:13px" placeholder="https://static.example.com/js/app.js&#10;https://static.example.com/css/main.css&#10;https://static.example.com/img/banner.png"></textarea>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--text-muted)"><i class="fas fa-clock" style="margin-right:4px"></i>今日剩余配额：<strong style="color:var(--text-primary)">487</strong> / 500 条</span>
        <button class="btn btn-primary" onclick="submitPurge('URL')"><i class="fas fa-rotate"></i> 提交刷新</button>
      </div>
    </div>

    <div id="panel-dir" style="display:none">
      <div class="form-group">
        <label>加速域名</label>
        <select><option>static.example.com</option></select>
      </div>
      <div class="form-group">
        <label>刷新目录 <span style="color:var(--text-muted);font-weight:400">（以 / 结尾）</span></label>
        <textarea style="height:100px;resize:vertical;font-family:monospace;font-size:13px" placeholder="https://static.example.com/js/&#10;https://static.example.com/css/"></textarea>
      </div>
      <div class="alert alert-warning"><i class="fas fa-triangle-exclamation"></i> 目录刷新将清空该目录下所有缓存内容，请谨慎操作</div>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn btn-primary" onclick="submitPurge('目录')"><i class="fas fa-rotate"></i> 提交刷新</button>
      </div>
    </div>

    <div id="panel-all" style="display:none">
      <div class="alert alert-danger"><i class="fas fa-circle-exclamation"></i> <strong>高危操作：</strong>全量刷新将清空所选域名的 <strong>所有</strong> CDN 缓存，可能导致大量回源请求，影响源站负载</div>
      <div class="form-group">
        <label>选择域名</label>
        <select><option>请选择要刷新的域名</option><option>static.example.com</option><option>cdn.shopxyz.cn</option></select>
      </div>
      <div class="form-group">
        <label>确认操作</label>
        <input placeholder='请输入 "CONFIRM" 确认全量刷新'>
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn btn-danger"><i class="fas fa-trash-can"></i> 执行全量刷新</button>
      </div>
    </div>
  </div>

  <!-- Prefetch Panel -->
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title"><i class="fas fa-download" style="color:var(--secondary);margin-right:8px"></i>缓存预热</div>
        <div class="card-subtitle">主动将内容拉取到 CDN 节点，提升首次访问速度</div>
      </div>
    </div>
    <div class="alert alert-info"><i class="fas fa-circle-info"></i> 预热通常在业务高峰前或新版本发布后使用，建议提前 30 分钟提交</div>
    <div class="form-group">
      <label>加速域名</label>
      <select><option>static.example.com</option><option>cdn.shopxyz.cn</option></select>
    </div>
    <div class="form-group">
      <label>预热 URL <span style="color:var(--text-muted);font-weight:400">（每行一个，最多 500 条）</span></label>
      <textarea style="height:120px;resize:vertical;font-family:monospace;font-size:13px" placeholder="https://static.example.com/app-v2.1.js&#10;https://static.example.com/vendor.js&#10;https://static.example.com/main.css"></textarea>
    </div>
    <div class="form-group">
      <label>预热节点范围</label>
      <select>
        <option>全部节点（约需 5-10 分钟）</option>
        <option>中国大陆（约需 3-5 分钟）</option>
        <option>中国香港</option>
        <option>亚太地区</option>
      </select>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;color:var(--text-muted)"><i class="fas fa-clock" style="margin-right:4px"></i>今日剩余配额：<strong style="color:var(--text-primary)">348</strong> / 500 条</span>
      <button class="btn btn-success" onclick="submitPurge('预热')"><i class="fas fa-download"></i> 提交预热</button>
    </div>
  </div>
</div>

<!-- History Table -->
<div class="card" style="padding:0;overflow:hidden">
  <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <div class="card-title">操作历史</div>
    <div style="display:flex;gap:8px">
      <select style="padding:6px 10px;background:var(--dark);border:1px solid var(--dark-3);border-radius:6px;color:var(--text-primary);font-size:12px;outline:none">
        <option>全部类型</option>
        <option>URL刷新</option>
        <option>目录刷新</option>
        <option>缓存预热</option>
      </select>
      <select style="padding:6px 10px;background:var(--dark);border:1px solid var(--dark-3);border-radius:6px;color:var(--text-primary);font-size:12px;outline:none">
        <option>最近7天</option>
        <option>最近30天</option>
      </select>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>操作类型</th>
        <th>操作对象</th>
        <th>涉及 URL 数</th>
        <th>提交时间</th>
        <th>完成时间</th>
        <th>状态</th>
        <th>操作者</th>
      </tr>
    </thead>
    <tbody>
      ${[
        ['URL 刷新', 'static.example.com', 12, '2026-02-26 14:23:11', '2026-02-26 14:23:54', 'success', 'david@agentfast.io'],
        ['缓存预热', 'cdn.shopxyz.cn', 45, '2026-02-26 10:15:08', '2026-02-26 10:22:33', 'success', 'api-key-003'],
        ['目录刷新', 'img.newsportal.com', 831, '2026-02-25 22:00:01', '2026-02-25 22:04:47', 'success', 'system'],
        ['URL 刷新', 'cdn.shopxyz.cn', 8, '2026-02-25 18:44:22', '2026-02-25 18:44:51', 'success', 'david@agentfast.io'],
        ['全量刷新', 'assets.educloud.cn', 2841, '2026-02-24 09:30:00', '2026-02-24 09:38:12', 'success', 'david@agentfast.io'],
        ['缓存预热', 'static.example.com', 156, '2026-02-23 15:20:44', '-', 'failed', 'api-key-001'],
      ].map(([type, domain, count, submit, finish, status, user]) => html`
      <tr>
        <td>
          <span class="badge ${type.includes('刷新') ? 'badge-info' : 'badge-success'}">${type}</span>
        </td>
        <td style="font-weight:500">${domain}</td>
        <td>${count} 条</td>
        <td style="font-size:12px;color:var(--text-secondary)">${submit}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${finish}</td>
        <td>
          ${status === 'success'
            ? html`<span class="badge badge-success"><span class="dot"></span>完成</span>`
            : html`<span class="badge badge-danger"><span class="dot"></span>失败</span>`}
        </td>
        <td style="font-size:12px;color:var(--text-muted)">${user}</td>
      </tr>
      `)}
    </tbody>
  </table>
</div>

<!-- Toast -->
<div id="toast" style="position:fixed;bottom:24px;right:24px;background:var(--dark-2);border:1px solid var(--success);color:var(--success);padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;z-index:999;transform:translateY(100px);transition:transform 0.3s;display:flex;align-items:center;gap:8px">
  <i class="fas fa-circle-check"></i><span id="toastMsg"></span>
</div>

<script>
function switchTab(t) {
  ['url','dir','all'].forEach(id => {
    document.getElementById('tab-'+id).className = 'tab-item' + (id===t?' active':'');
    document.getElementById('panel-'+id).style.display = id===t?'block':'none';
  });
}
function submitPurge(type) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = type + '任务已提交，预计 1-2 分钟内完成';
  t.style.transform = 'translateY(0)';
  setTimeout(() => t.style.transform = 'translateY(100px)', 3500);
}
</script>
    `
  }))
})

// ===================== SSL PAGE =====================
app.get('/ssl', (c) => {
  return c.html(Layout({
    title: 'SSL 证书',
    activeNav: 'ssl',
    children: html`
<div class="page-header">
  <div>
    <h2>SSL 证书管理</h2>
    <p>管理所有域名的 HTTPS 证书，自动续签，零运维</p>
  </div>
  <button class="btn btn-primary" onclick="openModal('addCertModal')">
    <i class="fas fa-plus"></i> 添加证书
  </button>
</div>

<!-- Alert -->
<div class="alert alert-warning mb-6">
  <i class="fas fa-triangle-exclamation"></i>
  <div>您有 <strong>2</strong> 个证书将在 30 天内到期，建议尽快续签。
    <a href="#" style="color:var(--warning);text-decoration:underline;margin-left:8px">立即处理 →</a>
  </div>
</div>

<!-- Stats -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${[
    { label: '证书总数', value: '12', icon: 'fa-certificate', color: '#6366f1' },
    { label: '正常有效', value: '10', icon: 'fa-shield-halved', color: '#10b981' },
    { label: '即将到期', value: '2', icon: 'fa-triangle-exclamation', color: '#f59e0b' },
    { label: '自动续签', value: '11', icon: 'fa-rotate', color: '#0ea5e9' },
  ].map(s => html`
  <div class="card" style="padding:14px;display:flex;align-items:center;gap:12px">
    <div style="width:36px;height:36px;border-radius:10px;background:${s.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <i class="fas ${s.icon}" style="color:${s.color};font-size:15px"></i>
    </div>
    <div>
      <div style="font-size:20px;font-weight:700">${s.value}</div>
      <div style="font-size:12px;color:var(--text-muted)">${s.label}</div>
    </div>
  </div>
  `)}
</div>

<!-- Cert List -->
<div class="card" style="padding:0;overflow:hidden">
  <table>
    <thead>
      <tr>
        <th>域名</th>
        <th>证书类型</th>
        <th>颁发机构</th>
        <th>有效期至</th>
        <th>剩余天数</th>
        <th>自动续签</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      ${[
        { domain: 'static.example.com', type: 'DV 单域名', ca: "Let's Encrypt", expire: '2026-05-18', days: 81, auto: true, status: 'valid' },
        { domain: 'cdn.shopxyz.cn', type: 'DV 单域名', ca: "Let's Encrypt", expire: '2026-05-02', days: 65, auto: true, status: 'valid' },
        { domain: 'img.newsportal.com', type: 'OV 单域名', ca: 'DigiCert', expire: '2026-09-30', days: 216, auto: false, status: 'valid' },
        { domain: 'api.gamehub.io', type: 'DV 通配符', ca: "Let's Encrypt", expire: '2026-04-10', days: 43, auto: true, status: 'expiring' },
        { domain: 'assets.educloud.cn', type: 'DV 单域名', ca: "Let's Encrypt", expire: '2026-04-05', days: 38, auto: true, status: 'expiring' },
        { domain: 'download.softpkg.net', type: 'DV 单域名', ca: "Let's Encrypt", expire: '2026-07-22', days: 146, auto: true, status: 'valid' },
        { domain: 'video.stream365.cn', type: '-', ca: '-', expire: '-', days: 0, auto: false, status: 'none' },
        { domain: 'media.fastapp.io', type: 'DV 单域名', ca: "Let's Encrypt", expire: '部署中...', days: null, auto: true, status: 'pending' },
      ].map(cert => html`
      <tr>
        <td style="font-weight:600">${cert.domain}</td>
        <td>
          ${cert.type !== '-' ? html`<span class="badge badge-purple">${cert.type}</span>` : html`<span style="color:var(--text-muted)">-</span>`}
        </td>
        <td style="color:var(--text-secondary)">${cert.ca}</td>
        <td style="font-size:12px">${cert.expire}</td>
        <td>
          ${cert.days !== null && cert.days > 0
            ? html`<span style="font-weight:600;color:${cert.days < 60 ? 'var(--warning)' : 'var(--success)'}">${cert.days} 天</span>`
            : cert.days === 0 ? html`<span style="color:var(--text-muted)">-</span>` : html`<span style="color:var(--text-muted)">-</span>`}
        </td>
        <td>
          ${cert.auto
            ? html`<span style="color:var(--success)"><i class="fas fa-rotate" style="margin-right:4px"></i>已开启</span>`
            : html`<span style="color:var(--text-muted)">未开启</span>`}
        </td>
        <td>
          ${cert.status === 'valid' ? html`<span class="badge badge-success"><span class="dot"></span>有效</span>` :
            cert.status === 'expiring' ? html`<span class="badge badge-warning"><span class="dot"></span>即将到期</span>` :
            cert.status === 'pending' ? html`<span class="badge badge-info"><span class="dot"></span>申请中</span>` :
            html`<span class="badge badge-gray">未部署</span>`}
        </td>
        <td>
          <div style="display:flex;gap:6px">
            ${cert.status === 'expiring'
              ? html`<button class="btn btn-warning btn-sm" style="background:var(--warning);color:#000;font-weight:600">立即续签</button>`
              : cert.status === 'none'
              ? html`<button class="btn btn-primary btn-sm" onclick="openModal('addCertModal')">申请证书</button>`
              : html`<button class="btn btn-outline btn-sm">查看详情</button>`}
          </div>
        </td>
      </tr>
      `)}
    </tbody>
  </table>
</div>

<!-- Add Cert Modal -->
<div class="modal-overlay" id="addCertModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title"><i class="fas fa-shield-halved" style="color:var(--success);margin-right:8px"></i>申请 / 上传 SSL 证书</div>
      <button class="modal-close" onclick="closeModal('addCertModal')"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="tabs" style="margin-bottom:16px">
      <div class="tab-item active">免费证书（Let's Encrypt）</div>
      <div class="tab-item">上传自有证书</div>
    </div>
    <div class="form-group">
      <label>关联域名</label>
      <select>
        <option>请选择域名</option>
        <option>video.stream365.cn</option>
        <option>api.gamehub.io</option>
      </select>
    </div>
    <div class="form-group">
      <label>证书类型</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="padding:12px;border:2px solid var(--primary);border-radius:8px;background:rgba(99,102,241,0.1);cursor:pointer">
          <div style="font-weight:600;color:var(--primary-light)">DV 证书</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">域名验证，免费，推荐</div>
        </div>
        <div style="padding:12px;border:1px solid var(--border);border-radius:8px;cursor:pointer">
          <div style="font-weight:600">OV/EV 证书</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">企业验证，付费</div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" checked style="width:auto;accent-color:var(--primary)">
        自动续签（到期前 30 天自动续签）
      </label>
    </div>
    <div class="alert alert-info" style="margin:0">
      <i class="fas fa-circle-info"></i>
      证书申请通常在 2-5 分钟内完成，申请前请确保域名已正确解析到 AgentFast CDN
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('addCertModal')">取消</button>
      <button class="btn btn-success" onclick="closeModal('addCertModal')">
        <i class="fas fa-shield-halved"></i> 立即申请
      </button>
    </div>
  </div>
</div>

<script>
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
</script>
    `
  }))
})

// ===================== BILLING PAGE =====================
app.get('/billing', (c) => {
  return c.html(Layout({
    title: '用量计费',
    activeNav: 'billing',
    children: html`
<div class="page-header">
  <div>
    <h2>用量计费</h2>
    <p>查看本月用量、费用明细和账单历史</p>
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn btn-outline"><i class="fas fa-cube"></i> 购买流量包</button>
    <button class="btn btn-primary"><i class="fas fa-credit-card"></i> 充值</button>
  </div>
</div>

<!-- Balance & Plan -->
<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px">
  <div class="card" style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(14,165,233,0.1)),var(--card-bg);border-color:rgba(99,102,241,0.3)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">当前套餐</div>
        <div style="font-size:22px;font-weight:700;margin-bottom:4px">企业版 Pro <span class="badge badge-purple" style="font-size:12px;vertical-align:middle">年付</span></div>
        <div style="font-size:13px;color:var(--text-secondary)">有效期至 2026-12-31 &nbsp;·&nbsp; 下次账单 ¥8,800/年</div>
      </div>
      <button class="btn btn-outline btn-sm">升级套餐</button>
    </div>
    <div class="divider"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      ${[
        ['含流量', '10 TB/月', 'fa-bolt', '#6366f1'],
        ['已用流量', '6.82 TB', 'fa-chart-bar', '#0ea5e9'],
        ['域名配额', '50 个', 'fa-globe', '#10b981'],
        ['API 调用', '100万次/月', 'fa-code', '#f59e0b'],
      ].map(([l, v, i, c]) => html`
      <div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px"><i class="fas ${i}" style="color:${c};margin-right:4px"></i>${l}</div>
        <div style="font-size:16px;font-weight:700">${v}</div>
      </div>
      `)}
    </div>
    <div style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span style="color:var(--text-secondary)">流量使用进度</span>
        <span>6.82 / 10 TB（68.2%）</span>
      </div>
      <div class="progress-bar" style="height:8px">
        <div class="progress-fill" style="width:68.2%;background:linear-gradient(90deg,var(--primary),var(--secondary))"></div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:12px">
    <div class="card">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">账户余额</div>
      <div style="font-size:28px;font-weight:700;color:var(--success)">¥2,841.50</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:4px">预计可用 ~4.2 个月</div>
    </div>
    <div class="card">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">本月实际消费</div>
      <div style="font-size:28px;font-weight:700">¥1,247.82</div>
      <div style="font-size:12px;color:var(--success);margin-top:4px"><i class="fas fa-arrow-down"></i> 较上月节省 ¥183.40</div>
    </div>
  </div>
</div>

<!-- Current Month Billing -->
<div class="card mb-6">
  <div class="card-header">
    <div>
      <div class="card-title">本月费用明细</div>
      <div class="card-subtitle">2026年2月（账单日：每月1日）</div>
    </div>
    <button class="btn btn-outline btn-sm"><i class="fas fa-download"></i> 下载账单</button>
  </div>
  <div class="chart-container" style="height:220px">
    <canvas id="billingChart"></canvas>
  </div>
</div>

<!-- Billing Detail Table -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
  <div class="card" style="padding:0;overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
      <div class="card-title">计费明细</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>计费项</th>
          <th>本月用量</th>
          <th>单价</th>
          <th>金额</th>
        </tr>
      </thead>
      <tbody>
        ${[
          ['CDN流量（中国大陆）', '5.12 TB', '¥0.18/GB', '¥941.60'],
          ['CDN流量（海外）', '1.70 TB', '¥0.18/GB', '¥313.60'],
          ['HTTPS请求数', '8.4亿次', '¥0.05/万次', '¥420.00'],
          ['实时日志', '1.2 TB', '¥0.05/GB', '¥61.44'],
          ['套餐折扣', '-', '-', '-¥888.82'],
        ].map(([i, u, p, a]) => html`
        <tr>
          <td style="font-size:13px">${i}</td>
          <td style="color:var(--text-secondary)">${u}</td>
          <td style="color:var(--text-muted);font-size:12px">${p}</td>
          <td style="font-weight:600;color:${a.startsWith('-') ? 'var(--success)' : 'var(--text-primary)'}">${a}</td>
        </tr>
        `)}
        <tr style="background:rgba(99,102,241,0.05)">
          <td colspan="3" style="font-weight:600;text-align:right;padding-right:12px">本月合计</td>
          <td style="font-weight:700;color:var(--primary-light);font-size:15px">¥847.82</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div>
    <div class="card mb-4" style="padding:0;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid var(--border)">
        <div class="card-title">历史账单</div>
      </div>
      <table>
        <thead>
          <tr><th>账单月份</th><th>消费金额</th><th>流量用量</th><th>状态</th></tr>
        </thead>
        <tbody>
          ${[
            ['2026年1月', '¥1,431.22', '8.2 TB', 'paid'],
            ['2025年12月', '¥1,284.66', '7.8 TB', 'paid'],
            ['2025年11月', '¥1,198.44', '6.9 TB', 'paid'],
            ['2025年10月', '¥987.30', '5.4 TB', 'paid'],
          ].map(([m, a, t, s]) => html`
          <tr>
            <td>${m}</td>
            <td style="font-weight:600">${a}</td>
            <td style="color:var(--text-secondary)">${t}</td>
            <td><span class="badge badge-success"><span class="dot"></span>已付款</span></td>
          </tr>
          `)}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:12px">流量包余额</div>
      ${[
        { name: '大陆流量包 5TB', used: 68, expire: '2026-03-31', color: 'var(--primary)' },
        { name: '海外流量包 1TB', used: 45, expire: '2026-06-30', color: 'var(--secondary)' },
      ].map(p => html`
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="font-weight:500">${p.name}</span>
          <span style="color:var(--text-muted)">到期：${p.expire}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
          <span>已使用 ${p.used}%</span>
          <span>剩余 ${100-p.used}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${p.used}%;background:${p.color}"></div>
        </div>
      </div>
      `)}
      <button class="btn btn-outline w-full" style="margin-top:8px">
        <i class="fas fa-plus"></i> 购买更多流量包
      </button>
    </div>
  </div>
</div>

<script>
new Chart(document.getElementById('billingChart').getContext('2d'), {
  type: 'bar',
  data: {
    labels: Array.from({length:26}, (_,i) => i+1+'日').slice(0,26),
    datasets: [{
      label: '每日费用 (¥)',
      data: Array.from({length:26}, () => Math.round(30 + Math.random()*60)),
      backgroundColor: 'rgba(99,102,241,0.6)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
      tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, callbacks: { label: ctx => '¥' + ctx.raw } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', maxTicksLimit: 13 } },
      y: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', callback: v => '¥'+v } }
    }
  }
});
</script>
    `
  }))
})

// ===================== SETTINGS PAGE =====================
app.get('/settings', (c) => {
  return c.html(Layout({
    title: '系统设置',
    activeNav: 'settings',
    children: html`
<div class="page-header">
  <div>
    <h2>系统设置</h2>
    <p>管理账号信息、API密钥和通知配置</p>
  </div>
</div>

<div style="display:grid;grid-template-columns:200px 1fr;gap:24px">
  <!-- Settings Nav -->
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      ${[
        ['fa-user', '账号信息', 'account', true],
        ['fa-key', 'API 密钥', 'apikey', false],
        ['fa-bell', '通知设置', 'notify', false],
        ['fa-shield-halved', '安全设置', 'security', false],
        ['fa-users', '子账号管理', 'subaccount', false],
        ['fa-file-invoice', '发票管理', 'invoice', false],
      ].map(([icon, label, id, active]) => html`
      <div class="nav-item ${active ? 'active' : ''}" onclick="switchSection('${id}', this)" style="font-size:13.5px">
        <i class="fas ${icon}"></i> ${label}
      </div>
      `)}
    </div>
  </div>

  <!-- Settings Content -->
  <div>
    <!-- Account Section -->
    <div id="sec-account" class="card">
      <div class="card-title" style="margin-bottom:20px"><i class="fas fa-user" style="color:var(--primary-light);margin-right:8px"></i>账号信息</div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding:16px;background:var(--dark);border-radius:10px">
        <div class="user-avatar" style="width:56px;height:56px;font-size:20px;border-radius:14px">D</div>
        <div style="flex:1">
          <div style="font-size:16px;font-weight:600">David Zhang</div>
          <div style="font-size:13px;color:var(--text-muted)">david@agentfast.io &nbsp;·&nbsp; 企业版 Pro</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">注册于 2025-08-01 &nbsp;·&nbsp; 账号ID: af-10086</div>
        </div>
        <button class="btn btn-outline btn-sm"><i class="fas fa-camera"></i> 更换头像</button>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>姓名</label>
          <input value="David Zhang">
        </div>
        <div class="form-group">
          <label>公司名称</label>
          <input value="AgentFast Technology Co.">
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>邮箱地址</label>
          <input value="david@agentfast.io">
        </div>
        <div class="form-group">
          <label>手机号码</label>
          <input value="+86 138 8888 8888">
        </div>
      </div>
      <div class="form-group">
        <label>时区</label>
        <select>
          <option selected>UTC+8 中国标准时间</option>
          <option>UTC+0 格林威治时间</option>
          <option>UTC-8 太平洋时间</option>
        </select>
      </div>
      <button class="btn btn-primary" style="width:auto;padding:10px 24px">
        <i class="fas fa-floppy-disk"></i> 保存修改
      </button>
    </div>

    <!-- API Keys Section (hidden) -->
    <div id="sec-apikey" class="card" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div class="card-title"><i class="fas fa-key" style="color:var(--warning);margin-right:8px"></i>API 密钥管理</div>
        <button class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> 新建密钥</button>
      </div>
      <div class="alert alert-warning mb-4">
        <i class="fas fa-triangle-exclamation"></i>
        API 密钥拥有账号的操作权限，请妥善保管，不要泄露给他人
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${[
          { name: '生产环境 API Key', key: 'af_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', perm: ['读取', '刷新', '预热'], created: '2025-09-01', last: '2分钟前' },
          { name: 'CI/CD 自动化', key: 'af_live_sk_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', perm: ['刷新', '预热'], created: '2025-11-15', last: '3天前' },
          { name: '测试密钥', key: 'af_test_sk_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', perm: ['只读'], created: '2026-01-20', last: '7天前' },
        ].map(k => html`
        <div style="background:var(--dark);border:1px solid var(--border);border-radius:10px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
              <div style="font-weight:600">${k.name}</div>
              <div style="font-family:monospace;font-size:12px;color:var(--text-muted);margin-top:3px">${k.key.slice(0,12)}••••••••••••••••••••••••••••••••</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm"><i class="fas fa-copy"></i></button>
              <button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:var(--text-muted)">
            <span><i class="fas fa-shield-halved" style="margin-right:4px"></i>${k.perm.join(' · ')}</span>
            <span><i class="fas fa-calendar" style="margin-right:4px"></i>创建于 ${k.created}</span>
            <span><i class="fas fa-clock" style="margin-right:4px"></i>最近使用 ${k.last}</span>
          </div>
        </div>
        `)}
      </div>
    </div>

    <!-- Notify Section (hidden) -->
    <div id="sec-notify" class="card" style="display:none">
      <div class="card-title" style="margin-bottom:20px"><i class="fas fa-bell" style="color:var(--secondary);margin-right:8px"></i>通知设置</div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${[
          ['带宽超出阈值告警', '当某域名带宽超过设定值时发送告警', true],
          ['域名异常告警', '当域名出现 5xx 错误率超标时通知', true],
          ['证书到期提醒', '证书到期前 30/7 天发送邮件提醒', true],
          ['刷新任务完成通知', '缓存刷新/预热任务完成时发送通知', false],
          ['账单生成提醒', '每月账单生成后发送邮件', true],
          ['余额不足提醒', '账户余额低于 ¥100 时发出警告', true],
        ].map(([title, desc, enabled]) => html`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--dark);border-radius:8px">
          <div>
            <div style="font-size:14px;font-weight:500">${title}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${desc}</div>
          </div>
          <div style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0">
            <input type="checkbox" ${enabled ? 'checked' : ''} style="opacity:0;width:0;height:0" onchange="this.nextElementSibling.style.background=this.checked?'var(--primary)':'var(--dark-3)'">
            <span style="position:absolute;cursor:pointer;inset:0;background:${enabled ? 'var(--primary)' : 'var(--dark-3)'};border-radius:24px;transition:0.2s" onclick="let cb=this.previousElementSibling;cb.checked=!cb.checked;this.style.background=cb.checked?'var(--primary)':'var(--dark-3)'"></span>
          </div>
        </div>
        `)}
      </div>
      <div style="margin-top:20px">
        <div class="form-group">
          <label>告警通知邮箱</label>
          <input value="david@agentfast.io, ops@agentfast.io">
        </div>
        <div class="form-group">
          <label>企业微信 Webhook（可选）</label>
          <input placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx">
        </div>
        <button class="btn btn-primary" style="width:auto;padding:10px 24px"><i class="fas fa-floppy-disk"></i> 保存设置</button>
      </div>
    </div>
  </div>
</div>

<script>
function switchSection(id, el) {
  document.querySelectorAll('[id^="sec-"]').forEach(s => s.style.display = 'none');
  document.getElementById('sec-' + id).style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}
</script>
    `
  }))
})

export default app
