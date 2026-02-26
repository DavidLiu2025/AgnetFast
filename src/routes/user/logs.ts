import { Hono } from 'hono'
import { Layout } from '../../lib/layout'
import { TOAST_SCRIPT } from '../../lib/mock'

export const logsRoute = new Hono()

// ─── Mock日志生成 ────────────────────────────────────────────────────────────
const DOMAINS = ['static.example.com', 'cdn.shopxyz.cn', 'img.newsportal.com', 'api.gamehub.io', 'assets.educloud.cn']
const METHODS = ['GET', 'GET', 'GET', 'GET', 'HEAD', 'POST']
const STATUSES = [200, 200, 200, 200, 200, 200, 200, 304, 404, 206, 500]
const PATHS = ['/js/app.js', '/css/main.css', '/img/banner.jpg', '/api/data.json', '/fonts/icon.woff2', '/video/intro.mp4', '/download/file.zip']

function genLogs(count = 50): any[] {
  return Array.from({ length: count }, (_, i) => {
    const status = STATUSES[Math.floor(Math.abs(Math.sin(i * 3)) * STATUSES.length)]
    const domain = DOMAINS[i % DOMAINS.length]
    return {
      id: `log-${i + 1}`,
      time: `2026-02-26 ${String(Math.floor(i / 6) % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
      ip: `${(i * 7 + 1) % 255}.${(i * 13 + 1) % 255}.${(i * 3 + 1) % 255}.${(i * 17 + 1) % 255}`,
      method: METHODS[i % METHODS.length],
      domain,
      url: `https://${domain}${PATHS[i % PATHS.length]}`,
      status,
      size: Math.round(1024 + Math.abs(Math.sin(i)) * 512000),
      duration: Math.round(5 + Math.abs(Math.sin(i * 2)) * 200),
      cache: status === 304 ? 'HIT' : Math.random() > 0.1 ? 'HIT' : 'MISS',
      region: ['华东', '华南', '华北', '华西', '海外'][i % 5],
      node: `node-${String(Math.floor(i / 3) % 8 + 1).padStart(3, '0')}`,
    }
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────
logsRoute.get('/logs', (c) => {
  return c.html(Layout({ title: '实时日志', activeNav: 'logs', children: pageHtml() }))
})

// ─── API: GET /api/logs ──────────────────────────────────────────────────────
logsRoute.get('/api/logs', (c) => {
  const domain = c.req.query('domain')
  const status = c.req.query('status')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')

  let logs = genLogs(100)

  if (domain) logs = logs.filter(l => l.domain === domain || l.url.includes(domain))
  if (status) logs = logs.filter(l => l.status === parseInt(status))

  const start = (page - 1) * limit
  return c.json(logs.slice(start, start + limit))
})

// ─── API: GET /api/logs/download ─────────────────────────────────────────────
logsRoute.get('/api/logs/download', (c) => {
  const domain = c.req.query('domain')
  if (!domain) return c.json({ error: 'domain is required' }, 400)
  const date = c.req.query('date') || '2026-02-26'
  return c.json({
    download_url: `https://logs.agentfast.io/cdn/${domain}/${date}.log.gz`,
    size: '128.4 MB',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  })
})

// ─── Page HTML ───────────────────────────────────────────────────────────────
function pageHtml(): string {
  const logs = genLogs(20)
  const statusColor = (s: number) =>
    s >= 500 ? 'var(--danger)' : s >= 400 ? 'var(--warning)' : s >= 300 ? 'var(--secondary)' : 'var(--success)'

  return `
<div class="page-header">
  <div>
    <h2>实时日志</h2>
    <p>查看 CDN 访问日志，支持多维度筛选与下载</p>
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn btn-outline" onclick="openModal('downloadModal')">
      <i class="fas fa-download"></i> 下载日志
    </button>
    <button class="btn btn-primary" onclick="refreshLogs()">
      <i class="fas fa-rotate"></i> 刷新
    </button>
  </div>
</div>

<!-- Filters -->
<div class="card" style="padding:16px;margin-bottom:16px">
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr auto;gap:10px;align-items:end">
    <div>
      <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">域名</label>
      <select style="width:100%;padding:8px 12px;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none">
        <option>全部域名</option>
        <option>static.example.com</option>
        <option>cdn.shopxyz.cn</option>
        <option>img.newsportal.com</option>
        <option>api.gamehub.io</option>
      </select>
    </div>
    <div>
      <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">状态码</label>
      <select style="width:100%;padding:8px 12px;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none">
        <option value="">全部</option>
        <option value="200">200</option>
        <option value="304">304</option>
        <option value="404">404</option>
        <option value="500">500</option>
      </select>
    </div>
    <div>
      <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">缓存状态</label>
      <select style="width:100%;padding:8px 12px;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none">
        <option>全部</option>
        <option>HIT</option>
        <option>MISS</option>
      </select>
    </div>
    <div>
      <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">时间范围</label>
      <select style="width:100%;padding:8px 12px;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none">
        <option>最近5分钟</option>
        <option>最近1小时</option>
        <option selected>最近24小时</option>
        <option>最近7天</option>
      </select>
    </div>
    <div>
      <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">搜索URL</label>
      <input placeholder="/path/to/file" style="width:100%;padding:8px 12px;background:var(--dark);border:1px solid var(--dark-3);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none">
    </div>
    <button class="btn btn-primary" style="white-space:nowrap">
      <i class="fas fa-magnifying-glass"></i> 查询
    </button>
  </div>
</div>

<!-- Stats Bar -->
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px">
  ${[
    ['总请求数', '124,831', '#6366f1'],
    ['命中数(HIT)', '121,563', '#10b981'],
    ['4xx 错误', '1,847', '#f59e0b'],
    ['5xx 错误', '498', '#ef4444'],
    ['平均响应', '18ms', '#0ea5e9'],
  ].map(([l, v, c]) => `
  <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px">
    <div style="font-size:11px;color:var(--text-muted)">${l}</div>
    <div style="font-size:18px;font-weight:700;color:${c};margin-top:2px">${v}</div>
  </div>`).join('')}
</div>

<!-- Log Table -->
<div class="card" style="padding:0;overflow:hidden">
  <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:13px;color:var(--text-muted)">
      显示最新 <strong style="color:var(--text-primary)">1,000</strong> 条记录（共 124,831 条）
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);cursor:pointer">
        <input type="checkbox" id="autoRefresh" style="width:auto;accent-color:var(--primary)">
        自动刷新（5秒）
      </label>
    </div>
  </div>
  <div style="overflow-x:auto">
    <table style="font-size:12px">
      <thead>
        <tr>
          <th style="min-width:140px">时间</th>
          <th>客户端IP</th>
          <th>方法</th>
          <th style="min-width:300px">请求URL</th>
          <th>状态码</th>
          <th>大小</th>
          <th>耗时</th>
          <th>缓存</th>
          <th>节点</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => `
        <tr>
          <td style="color:var(--text-muted);white-space:nowrap">${log.time}</td>
          <td style="font-family:monospace;color:var(--text-secondary)">${log.ip}</td>
          <td><span class="badge ${log.method === 'GET' ? 'badge-info' : 'badge-purple'}" style="font-size:10px">${log.method}</span></td>
          <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:11px;color:var(--text-secondary)" title="${log.url}">
            ${log.url}
          </td>
          <td>
            <span style="font-family:monospace;font-weight:700;color:${statusColor(log.status)}">${log.status}</span>
          </td>
          <td style="color:var(--text-secondary)">${log.size > 1048576 ? (log.size / 1048576).toFixed(1) + 'MB' : (log.size / 1024).toFixed(0) + 'KB'}</td>
          <td style="color:${log.duration > 100 ? 'var(--warning)' : 'var(--success)'}">${log.duration}ms</td>
          <td>
            <span class="badge ${log.cache === 'HIT' ? 'badge-success' : 'badge-warning'}" style="font-size:10px">${log.cache}</span>
          </td>
          <td style="font-size:11px;color:var(--text-muted)">${log.node}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:12px;color:var(--text-muted)">第 1 页，共 2,497 页</span>
    <div style="display:flex;gap:6px">
      <button class="btn btn-outline btn-sm" disabled>← 上一页</button>
      <button class="btn btn-outline btn-sm">下一页 →</button>
    </div>
  </div>
</div>

<!-- Download Modal -->
<div class="modal-overlay" id="downloadModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title"><i class="fas fa-download" style="color:var(--primary-light);margin-right:8px"></i>下载访问日志</div>
      <button class="modal-close" onclick="closeModal('downloadModal')"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label>选择域名 <span style="color:var(--danger)">*</span></label>
      <select>
        <option>static.example.com</option>
        <option>cdn.shopxyz.cn</option>
        <option>img.newsportal.com</option>
      </select>
    </div>
    <div class="form-group">
      <label>日期 <span style="color:var(--danger)">*</span></label>
      <input type="date" value="2026-02-26">
    </div>
    <div class="form-group">
      <label>日志格式</label>
      <select>
        <option>标准格式（W3C Combined Log）</option>
        <option>JSON格式</option>
        <option>CSV格式</option>
      </select>
    </div>
    <div class="alert alert-info" style="margin:0">
      <i class="fas fa-circle-info"></i>
      日志文件以 Gzip 压缩格式提供，有效期 1 小时，请及时下载
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('downloadModal')">取消</button>
      <button class="btn btn-primary" onclick="closeModal('downloadModal');showToast('日志包正在生成，请稍候...')">
        <i class="fas fa-download"></i> 生成下载链接
      </button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function refreshLogs() {
  document.querySelector('table tbody').style.opacity = '0.5';
  setTimeout(() => {
    document.querySelector('table tbody').style.opacity = '1';
    showToast('日志已刷新', 'success');
  }, 800);
}
document.getElementById('autoRefresh').addEventListener('change', function() {
  if (this.checked) showToast('自动刷新已开启（每5秒）', 'info');
  else showToast('自动刷新已关闭', 'info');
});
</script>`
}
