/**
 * 共享布局组件
 * 用户前台 Layout 和 管理后台 AdminLayout
 */

export function Layout(props: {
  title: string
  activeNav: string
  children: string
}): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title} - AgentFast CDN</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
<div class="app-layout">
  ${userSidebar(props.activeNav)}
  <div class="main-content">
    ${topbar(props.title)}
    <main class="page-content fade-in">
      ${props.children}
    </main>
  </div>
</div>
</body>
</html>`
}

export function AdminLayout(props: {
  title: string
  activeNav: string
  children: string
}): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title} - AgentFast 运营后台</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="/static/admin.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body class="admin-body">
<div class="app-layout">
  ${adminSidebar(props.activeNav)}
  <div class="main-content">
    ${adminTopbar(props.title)}
    <main class="page-content fade-in">
      ${props.children}
    </main>
  </div>
</div>
</body>
</html>`
}

// ─── User Sidebar ────────────────────────────────────────────────────────────
function navItem(href: string, icon: string, label: string, active: string, current: string, badge?: string): string {
  const isActive = active === current
  const badgeHtml = badge ? `<span class="nav-badge" style="${badge.includes('#') ? `background:${badge}` : ''}">${badge.replace(/#[^ ]+ /, '')}</span>` : ''
  return `<a href="${href}" class="nav-item ${isActive ? 'active' : ''}">
    <i class="fas ${icon}"></i> ${label}${badgeHtml}
  </a>`
}

function userSidebar(active: string): string {
  return `<aside class="sidebar">
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
        ${navItem('/dashboard', 'fa-chart-line', '控制台', active, 'dashboard')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">加速服务</div>
        ${navItem('/domains', 'fa-globe', '域名管理', active, 'domains', '12')}
        ${navItem('/traffic', 'fa-chart-area', '流量统计', active, 'traffic')}
        ${navItem('/cache', 'fa-database', '缓存管理', active, 'cache')}
        ${navItem('/origin-config', 'fa-server', '回源配置', active, 'origin-config')}
        ${navItem('/performance', 'fa-gauge-high', '性能优化', active, 'performance')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">安全与证书</div>
        ${navItem('/ssl', 'fa-shield-halved', 'SSL 证书', active, 'ssl', '#f59e0b 2')}
        ${navItem('/access-control', 'fa-ban', '访问控制', active, 'access-control')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">监控与日志</div>
        ${navItem('/alerts', 'fa-bell', '告警配置', active, 'alerts')}
        ${navItem('/logs', 'fa-file-lines', '实时日志', active, 'logs')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">账户</div>
        ${navItem('/billing', 'fa-credit-card', '用量计费', active, 'billing')}
        ${navItem('/tickets', 'fa-headset', '技术支持', active, 'tickets')}
        ${navItem('/api-docs', 'fa-code', 'API 文档', active, 'api-docs')}
        ${navItem('/settings', 'fa-gear', '系统设置', active, 'settings')}
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
  </aside>`
}

function topbar(title: string): string {
  return `<header class="topbar">
    <div class="topbar-title">${title}</div>
    <div class="topbar-right">
      <div class="topbar-btn notif-dot" data-tooltip="通知"><i class="fas fa-bell"></i></div>
      <div class="topbar-btn" data-tooltip="帮助文档"><i class="fas fa-circle-question"></i></div>
      <a href="/" class="topbar-btn" data-tooltip="退出登录" style="text-decoration:none">
        <i class="fas fa-right-from-bracket"></i>
      </a>
    </div>
  </header>`
}

// ─── Admin Sidebar ───────────────────────────────────────────────────────────
function adminNavItem(href: string, icon: string, label: string, active: string, current: string, badge?: string): string {
  const isActive = active === current
  const badgeHtml = badge ? `<span class="nav-badge" style="background:${badge.startsWith('#') ? badge.split(' ')[0] : 'var(--danger)'};">${badge.includes(' ') ? badge.split(' ')[1] : badge}</span>` : ''
  return `<a href="${href}" class="nav-item ${isActive ? 'active' : ''}">
    <i class="fas ${icon}"></i> ${label}${badgeHtml}
  </a>`
}

function adminSidebar(active: string): string {
  return `<aside id="admin-sidebar" class="sidebar admin-sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">🛡️</div>
      <div>
        <div class="logo-text">AgentFast</div>
        <span class="logo-tag" style="color:#f59e0b">运营后台</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">运营总览</div>
        ${adminNavItem('/admin/dashboard', 'fa-gauge', '运营总览', active, 'admin-dashboard')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">客户运营</div>
        ${adminNavItem('/admin/customers', 'fa-users', '客户管理', active, 'admin-customers')}
        ${adminNavItem('/admin/domain-review', 'fa-magnifying-glass', '域名审核', active, 'admin-domain-review', '#ef4444 5')}
        ${adminNavItem('/admin/tickets', 'fa-headset', '工单系统', active, 'admin-tickets', '#ef4444 12')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">基础设施</div>
        ${adminNavItem('/admin/nodes', 'fa-server', '节点管理', active, 'admin-nodes')}
        ${adminNavItem('/admin/dns', 'fa-network-wired', 'DNS 调度', active, 'admin-dns')}
        ${adminNavItem('/admin/scheduling', 'fa-shuffle', '调度策略', active, 'admin-scheduling')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">商业化</div>
        ${adminNavItem('/admin/plans', 'fa-box', '套餐管理', active, 'admin-plans')}
        ${adminNavItem('/admin/finance', 'fa-chart-pie', '财务报表', active, 'admin-finance')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">安全与合规</div>
        ${adminNavItem('/admin/security', 'fa-shield-halved', '安全管理', active, 'admin-security')}
        ${adminNavItem('/admin/audit-logs', 'fa-file-shield', '操作审计', active, 'admin-audit-logs')}
      </div>
      <div class="nav-section">
        <div class="nav-section-title">系统</div>
        ${adminNavItem('/admin/system', 'fa-sliders', '系统配置', active, 'admin-system')}
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">A</div>
        <div>
          <div class="user-name">Admin</div>
          <div class="user-plan" style="color:#f59e0b">超级管理员</div>
        </div>
        <a href="/" class="topbar-btn" style="margin-left:auto;width:24px;height:24px;font-size:11px;text-decoration:none" data-tooltip="退出">
          <i class="fas fa-right-from-bracket"></i>
        </a>
      </div>
    </div>
  </aside>`
}

function adminTopbar(title: string): string {
  return `<header id="admin-topbar" class="topbar" style="border-bottom-color:rgba(245,158,11,0.2)">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:11px;background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 8px;border-radius:4px;font-weight:600">ADMIN</span>
      <div class="topbar-title">${title}</div>
    </div>
    <div class="topbar-right">
      <a href="/dashboard" class="btn btn-outline btn-sm" style="text-decoration:none;font-size:12px">
        <i class="fas fa-arrow-up-right-from-square"></i> 用户前台
      </a>
      <div class="topbar-btn notif-dot"><i class="fas fa-bell"></i></div>
      <a href="/admin/login" class="topbar-btn" style="text-decoration:none">
        <i class="fas fa-right-from-bracket"></i>
      </a>
    </div>
  </header>`
}
