/**
 * M6 API 文档页面（用户前台）
 */
import { Hono } from 'hono'
import { Layout } from '../../lib/layout'
import { TOAST_SCRIPT } from '../../lib/mock'

export const apiDocsRoute = new Hono()

// ─── API Key 管理端点 ──────────────────────────────────────────────────────────
apiDocsRoute.post('/api/apikeys', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.name) return c.json({ error: 'name is required' }, 400)
  const key = `af_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`
  return c.json({
    id: `key-${Date.now()}`,
    name: body.name,
    key,
    permissions: body.permissions || ['read', 'write'],
    created: new Date().toISOString(),
    lastUsed: null,
  }, 201)
})

apiDocsRoute.get('/api/apikeys', (c) => {
  return c.json({
    keys: [
      { id: 'key-001', name: '生产环境Key', key: 'af_prod****', permissions: ['read', 'write'], created: '2026-01-15', lastUsed: '5分钟前' },
      { id: 'key-002', name: '监控系统Key', key: 'af_mon*****', permissions: ['read'],          created: '2025-12-01', lastUsed: '1小时前' },
    ]
  })
})

// ─── 页面路由 ─────────────────────────────────────────────────────────────────
apiDocsRoute.get('/api-docs', (c) => {
  return c.html(Layout({
    title: 'API 文档',
    activeNav: 'api-docs',
    children: apiDocsHtml(),
  }))
})

// ─── 页面 HTML ────────────────────────────────────────────────────────────────
function apiDocsHtml(): string {
  const endpoints = [
    {
      group: '域名管理',
      icon: 'fa-globe',
      color: '#6366f1',
      apis: [
        { method: 'GET',    path: '/v1/domains',                    desc: '获取域名列表',      params: 'page, limit, status' },
        { method: 'POST',   path: '/v1/domains',                    desc: '添加加速域名',      params: 'domain, origin, type' },
        { method: 'GET',    path: '/v1/domains/:domain',            desc: '获取域名详情',      params: 'domain(path)' },
        { method: 'PUT',    path: '/v1/domains/:domain',            desc: '更新域名配置',      params: 'origin, cacheRules...' },
        { method: 'DELETE', path: '/v1/domains/:domain',            desc: '删除域名',          params: 'domain(path)' },
      ]
    },
    {
      group: '缓存管理',
      icon: 'fa-database',
      color: '#10b981',
      apis: [
        { method: 'POST', path: '/v1/cache/purge/url',     desc: '刷新指定URL缓存',    params: 'urls: string[]' },
        { method: 'POST', path: '/v1/cache/purge/dir',     desc: '刷新目录缓存',       params: 'dirs: string[]' },
        { method: 'POST', path: '/v1/cache/purge/all',     desc: '全站缓存刷新',       params: 'domain' },
        { method: 'POST', path: '/v1/cache/prefetch',      desc: '预热URL',            params: 'urls: string[]' },
        { method: 'GET',  path: '/v1/cache/tasks',         desc: '查询刷新/预热任务',  params: 'taskId, status' },
      ]
    },
    {
      group: '流量统计',
      icon: 'fa-chart-area',
      color: '#f59e0b',
      apis: [
        { method: 'GET', path: '/v1/statistics/bandwidth',  desc: '带宽流量统计',      params: 'domain, startTime, endTime, interval' },
        { method: 'GET', path: '/v1/statistics/request',    desc: '请求数统计',        params: 'domain, startTime, endTime' },
        { method: 'GET', path: '/v1/statistics/hit-rate',   desc: '缓存命中率',        params: 'domain, date' },
        { method: 'GET', path: '/v1/statistics/top-urls',   desc: 'TOP请求URL',        params: 'domain, limit' },
        { method: 'GET', path: '/v1/statistics/isp',        desc: '运营商分布统计',    params: 'domain, date' },
      ]
    },
    {
      group: '日志服务',
      icon: 'fa-file-lines',
      color: '#8b5cf6',
      apis: [
        { method: 'GET',  path: '/v1/logs/realtime',   desc: '实时访问日志流',    params: 'domain, fields' },
        { method: 'GET',  path: '/v1/logs/download',   desc: '下载离线日志',      params: 'domain, date' },
        { method: 'POST', path: '/v1/logs/push-config', desc: '配置日志推送',     params: 'endpoint, format, fields' },
      ]
    },
    {
      group: 'SSL 证书',
      icon: 'fa-shield-halved',
      color: '#ef4444',
      apis: [
        { method: 'GET',  path: '/v1/ssl',              desc: '证书列表',          params: 'domain, status' },
        { method: 'POST', path: '/v1/ssl/request',      desc: '申请免费SSL证书',   params: 'domain' },
        { method: 'POST', path: '/v1/ssl/upload',       desc: '上传自有证书',      params: 'cert, key, domain' },
        { method: 'POST', path: '/v1/ssl/renew/:id',    desc: '续期证书',          params: 'id(path)' },
      ]
    },
  ]

  const methodColor: Record<string, string> = {
    GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6'
  }

  return `
<div class="page-header">
  <div>
    <h1 class="page-title">API 文档</h1>
    <p class="page-desc">使用 RESTful API 将AgentFast CDN集成到您的系统</p>
  </div>
  <div style="display:flex;gap:10px">
    <a href="#api-keys" class="btn btn-outline"><i class="fas fa-key"></i> 管理API Key</a>
  </div>
</div>

<!-- 快速开始 -->
<div class="card" style="margin-bottom:20px">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-rocket"></i> 快速开始</div>
    <div style="display:flex;gap:8px" id="langTabs">
      ${['curl','Python','Node.js','Go'].map((lang, i) => `
      <button class="btn btn-outline btn-sm ${i===0?'active':''}" onclick="switchLang('${lang}',this)">${lang}</button>`).join('')}
    </div>
  </div>
  <div class="card-body">
    <!-- Base URL & Auth -->
    <div style="margin-bottom:16px">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Base URL</div>
      <code style="display:block;background:var(--dark-3);padding:10px 14px;border-radius:8px;font-size:13px;color:var(--secondary)">
        https://api.agentfast.io
      </code>
    </div>

    <!-- 代码示例 -->
    <div id="codeSample">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">示例：刷新缓存</div>
      <pre style="background:var(--dark-3);padding:14px;border-radius:8px;font-size:12px;overflow-x:auto;color:#e2e8f0;line-height:1.6" id="codeBlock">curl -X POST https://api.agentfast.io/v1/cache/purge/url \\
  -H "Authorization: Bearer af_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": [
      "https://cdn.example.com/image.jpg",
      "https://cdn.example.com/style.css"
    ]
  }'</pre>
    </div>

    <!-- 鉴权说明 -->
    <div style="margin-top:16px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:8px;padding:12px 16px">
      <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:var(--secondary)">
        <i class="fas fa-lock" style="margin-right:6px"></i>API Key 鉴权（Authorization）
      </div>
      <div style="font-size:12px;color:var(--text-muted);line-height:1.7">
        所有API请求需在Header中携带：<code style="background:var(--dark-3);padding:2px 6px;border-radius:4px;color:var(--secondary)">Authorization: Bearer &lt;API_KEY&gt;</code><br>
        API Key 以 <code style="color:var(--secondary)">af_</code> 前缀开头，请妥善保管，不要暴露在前端代码中。
      </div>
    </div>
  </div>
</div>

<!-- 分组 API 端点 -->
<div style="display:flex;gap:20px">
  <!-- 左侧导航 -->
  <div style="width:180px;flex-shrink:0">
    <div style="position:sticky;top:20px">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">API 分组</div>
      ${endpoints.map(g => `
      <a href="#group-${g.group}" class="nav-item" style="font-size:12px;padding:7px 12px;margin-bottom:2px;text-decoration:none">
        <i class="fas ${g.icon}" style="color:${g.color};margin-right:6px"></i>${g.group}
      </a>`).join('')}
      <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:12px">
        <a href="#api-keys" class="nav-item" style="font-size:12px;padding:7px 12px;text-decoration:none">
          <i class="fas fa-key" style="color:#f59e0b;margin-right:6px"></i>API Keys
        </a>
        <a href="#rate-limit" class="nav-item" style="font-size:12px;padding:7px 12px;margin-top:2px;text-decoration:none">
          <i class="fas fa-gauge" style="color:#8b5cf6;margin-right:6px"></i>频率限制
        </a>
        <a href="#errors" class="nav-item" style="font-size:12px;padding:7px 12px;margin-top:2px;text-decoration:none">
          <i class="fas fa-circle-exclamation" style="color:#ef4444;margin-right:6px"></i>错误码
        </a>
      </div>
    </div>
  </div>

  <!-- 右侧内容 -->
  <div style="flex:1;min-width:0">
    ${endpoints.map(g => `
    <div class="card" id="group-${g.group}" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">
          <i class="fas ${g.icon}" style="color:${g.color};margin-right:8px"></i>${g.group}
        </div>
      </div>
      <div class="card-body" style="padding:0">
        ${g.apis.map((api, i) => `
        <div style="padding:12px 16px;${i < g.apis.length-1 ? 'border-bottom:1px solid var(--border)' : ''}"
             onclick="this.querySelector('.api-detail').style.display = this.querySelector('.api-detail').style.display==='block'?'none':'block'"
             style="cursor:pointer">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="display:inline-block;min-width:60px;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;text-align:center;background:${methodColor[api.method]}22;color:${methodColor[api.method]}">${api.method}</span>
            <code style="font-size:13px;color:var(--text-primary);flex:1">${api.path}</code>
            <span style="font-size:12px;color:var(--text-muted)">${api.desc}</span>
          </div>
          <div class="api-detail" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
            <div style="font-size:12px;color:var(--text-muted)">
              <span style="font-weight:500;color:var(--text-primary)">参数：</span>${api.params}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>`).join('')}

    <!-- API Keys 管理 -->
    <div class="card" id="api-keys" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-key" style="color:#f59e0b;margin-right:8px"></i>我的 API Keys</div>
        <button class="btn btn-primary btn-sm" onclick="openModal('newKeyModal')">
          <i class="fas fa-plus"></i> 生成新Key
        </button>
      </div>
      <div class="card-body" style="padding:0" id="apiKeysList">
        ${[
          { id: 'key-001', name: '生产环境Key',  key: 'af_prod8f3k2m9x', permissions: ['read','write'], created: '2026-01-15', lastUsed: '5分钟前' },
          { id: 'key-002', name: '监控系统Key',  key: 'af_monp7q1n5wr',  permissions: ['read'],          created: '2025-12-01', lastUsed: '1小时前' },
        ].map(k => `
        <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:500;font-size:13px;margin-bottom:4px">${k.name}</div>
              <div style="display:flex;gap:12px;font-size:12px;color:var(--text-muted)">
                <code style="background:var(--dark-3);padding:2px 8px;border-radius:4px;color:var(--secondary)">${k.key.slice(0,10)}****</code>
                ${k.permissions.map(p => `<span class="badge badge-info" style="font-size:10px">${p}</span>`).join('')}
                <span>创建于 ${k.created}</span>
                <span>最近使用：${k.lastUsed}</span>
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-outline btn-sm" onclick="copyKey('${k.key}')"><i class="fas fa-copy"></i></button>
              <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)"
                onclick="deleteKey('${k.id}','${k.name}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- 频率限制 -->
    <div class="card" id="rate-limit" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-gauge" style="color:#8b5cf6;margin-right:8px"></i>频率限制</div>
      </div>
      <div class="card-body">
        <table class="table" style="margin-bottom:0">
          <thead><tr><th>套餐</th><th>QPS上限</th><th>日调用上限</th><th>并发连接</th></tr></thead>
          <tbody>
            <tr><td>免费版</td><td>10 QPS</td><td>1,000次/日</td><td>2</td></tr>
            <tr><td>专业版 Pro</td><td>100 QPS</td><td>100,000次/日</td><td>10</td></tr>
            <tr><td>企业版</td><td>1,000 QPS</td><td>无限制</td><td>100</td></tr>
          </tbody>
        </table>
        <p style="font-size:12px;color:var(--text-muted);margin-top:12px;margin-bottom:0">
          超出限制时，API将返回 <code style="color:#ef4444">429 Too Many Requests</code>，
          Header中包含 <code>X-RateLimit-Reset</code> 字段表示限制重置时间。
        </p>
      </div>
    </div>

    <!-- 错误码 -->
    <div class="card" id="errors">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-circle-exclamation" style="color:#ef4444;margin-right:8px"></i>错误码说明</div>
      </div>
      <div class="card-body" style="padding:0">
        ${[
          ['400', 'Bad Request',           '请求参数错误，请检查必填字段'],
          ['401', 'Unauthorized',          'API Key无效或已过期'],
          ['403', 'Forbidden',             '无权限访问此资源'],
          ['404', 'Not Found',             '资源不存在'],
          ['409', 'Conflict',              '域名已存在或资源冲突'],
          ['429', 'Too Many Requests',     '请求频率超出限制'],
          ['500', 'Internal Server Error', '服务器内部错误，请联系支持'],
          ['503', 'Service Unavailable',   '服务暂时不可用，稍后重试'],
        ].map(([code, name, desc]) => `
        <div style="padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:16px;font-size:12px">
          <code style="min-width:40px;color:${parseInt(code) >= 500 ? '#ef4444' : parseInt(code) >= 400 ? '#f59e0b' : '#10b981'};font-weight:700">${code}</code>
          <span style="min-width:160px;font-weight:500">${name}</span>
          <span style="color:var(--text-muted)">${desc}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>

<!-- 生成API Key Modal -->
<div class="modal" id="newKeyModal">
  <div class="modal-content" style="max-width:440px">
    <div class="modal-header">
      <div class="modal-title">生成新 API Key</div>
      <button class="modal-close" onclick="closeModal('newKeyModal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Key 名称 <span style="color:#ef4444">*</span></label>
        <input type="text" class="form-control" id="newKeyName" placeholder="例：生产环境，监控系统">
      </div>
      <div class="form-group">
        <label class="form-label">权限</label>
        <div style="display:flex;gap:16px;margin-top:6px">
          <label style="cursor:pointer;display:flex;align-items:center;gap:6px">
            <input type="checkbox" id="permRead" checked style="accent-color:var(--primary)"> 读取
          </label>
          <label style="cursor:pointer;display:flex;align-items:center;gap:6px">
            <input type="checkbox" id="permWrite" style="accent-color:var(--primary)"> 写入
          </label>
          <label style="cursor:pointer;display:flex;align-items:center;gap:6px">
            <input type="checkbox" id="permPurge" style="accent-color:var(--primary)"> 缓存刷新
          </label>
        </div>
      </div>
      <div id="newKeyResult" style="display:none;margin-top:12px">
        <div style="font-size:12px;color:var(--warning);margin-bottom:8px">
          <i class="fas fa-exclamation-triangle"></i> 请立即复制保存！此Key只显示一次
        </div>
        <div style="background:var(--dark-3);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
          <code id="generatedKey" style="color:var(--secondary);font-size:13px"></code>
          <button class="btn btn-outline btn-sm" onclick="copyKey(document.getElementById('generatedKey').textContent)">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('newKeyModal')">关闭</button>
      <button class="btn btn-primary" id="generateBtn" onclick="generateKey()">
        <i class="fas fa-key"></i> 生成Key
      </button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
const codeSamples = {
  curl: \`curl -X POST https://api.agentfast.io/v1/cache/purge/url \\\\
  -H "Authorization: Bearer af_your_api_key" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"urls":["https://cdn.example.com/image.jpg"]}'\`,
  Python: \`import requests
res = requests.post(
    "https://api.agentfast.io/v1/cache/purge/url",
    headers={"Authorization": "Bearer af_your_api_key"},
    json={"urls": ["https://cdn.example.com/image.jpg"]}
)
print(res.json())\`,
  "Node.js": \`const res = await fetch("https://api.agentfast.io/v1/cache/purge/url", {
  method: "POST",
  headers: {
    "Authorization": "Bearer af_your_api_key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ urls: ["https://cdn.example.com/image.jpg"] })
});
console.log(await res.json());\`,
  Go: \`req, _ := http.NewRequest("POST", "https://api.agentfast.io/v1/cache/purge/url",
  strings.NewReader(\\\`{"urls":["https://cdn.example.com/image.jpg"]}\\\`))
req.Header.Set("Authorization", "Bearer af_your_api_key")
req.Header.Set("Content-Type", "application/json")
resp, _ := http.DefaultClient.Do(req)\`,
}
function switchLang(lang, btn) {
  document.querySelectorAll('#langTabs .btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  document.getElementById('codeBlock').textContent = codeSamples[lang] || codeSamples['curl']
}
function copyKey(key) {
  navigator.clipboard?.writeText(key).then(() => showToast('已复制到剪贴板', 'success')).catch(() => showToast('请手动复制', 'info'))
}
function deleteKey(id, name) {
  if (confirm('确认删除 API Key「' + name + '」？删除后将无法恢复！')) {
    showToast('API Key 已删除', 'success')
  }
}
async function generateKey() {
  const name = document.getElementById('newKeyName').value
  if (!name) { showToast('请填写Key名称', 'error'); return }
  const perms = []
  if (document.getElementById('permRead').checked) perms.push('read')
  if (document.getElementById('permWrite').checked) perms.push('write')
  if (document.getElementById('permPurge').checked) perms.push('purge')
  const res = await fetch('/api/apikeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, permissions: perms })
  })
  const data = await res.json()
  document.getElementById('generatedKey').textContent = data.key
  document.getElementById('newKeyResult').style.display = 'block'
  document.getElementById('generateBtn').disabled = true
  showToast('API Key 已生成，请立即复制保存！', 'warning')
}
</script>`
}
