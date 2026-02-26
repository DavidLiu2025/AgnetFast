/**
 * M5 性能优化配置路由（用户前台）
 */
import { Hono } from 'hono'
import { Layout } from '../../lib/layout'
import { TOAST_SCRIPT } from '../../lib/mock'

export const performanceRoute = new Hono()

// Mock 性能配置数据
const MOCK_PERF_CONFIGS = [
  { domain: 'cdn.shopxyz.cn',     gzip: true,  brotli: true,  http2: true,  http3: false, webp: true,  lazyLoad: true,  minifyJs: true,  minifyCss: true,  cacheMode: 'smart' },
  { domain: 'img.newsportal.com', gzip: true,  brotli: false, http2: true,  http3: true,  webp: true,  lazyLoad: false, minifyJs: false, minifyCss: false, cacheMode: 'aggressive' },
  { domain: 'api.fastgame.io',    gzip: true,  brotli: true,  http2: true,  http3: true,  webp: false, lazyLoad: false, minifyJs: false, minifyCss: false, cacheMode: 'bypass' },
  { domain: 'files.edufast.cn',   gzip: true,  brotli: false, http2: true,  http3: false, webp: false, lazyLoad: true,  minifyJs: false, minifyCss: false, cacheMode: 'standard' },
]

// ─── 页面路由 ─────────────────────────────────────────────────────────────────
performanceRoute.get('/performance', (c) => {
  return c.html(Layout({
    title: '性能优化',
    activeNav: 'performance',
    children: performanceHtml(),
  }))
})

// ─── API ──────────────────────────────────────────────────────────────────────
performanceRoute.get('/api/performance/config', (c) => {
  return c.json({ configs: MOCK_PERF_CONFIGS, total: MOCK_PERF_CONFIGS.length })
})

performanceRoute.post('/api/performance/config', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.domain) return c.json({ error: 'domain is required' }, 400)
  return c.json({
    success: true,
    domain: body.domain,
    updated: new Date().toISOString(),
    config: { gzip: body.gzip ?? true, http2: body.http2 ?? true, ...body },
  })
})

// ─── 页面 HTML ────────────────────────────────────────────────────────────────
function performanceHtml(): string {
  // 性能评分 mock
  const scores = [
    { domain: 'cdn.shopxyz.cn',     score: 94, grade: 'A', ttfb: '38ms',  hitRate: '96.2%' },
    { domain: 'img.newsportal.com', score: 88, grade: 'B', ttfb: '52ms',  hitRate: '91.4%' },
    { domain: 'api.fastgame.io',    score: 97, grade: 'A', ttfb: '22ms',  hitRate: '98.7%' },
    { domain: 'files.edufast.cn',   score: 79, grade: 'C', ttfb: '120ms', hitRate: '82.1%' },
  ]

  const gradeColor: Record<string, string> = { A: '#10b981', B: '#f59e0b', C: '#ef4444' }

  return `
<div class="page-header">
  <div>
    <h1 class="page-title">性能优化</h1>
    <p class="page-desc">配置压缩、HTTP/2、图片优化等加速参数，提升用户体验</p>
  </div>
</div>

<!-- 性能评分总览 -->
<div class="card" style="margin-bottom:20px">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-gauge-high"></i> 域名性能评分</div>
    <span style="font-size:12px;color:var(--text-muted)">综合评估压缩率、TTFB、缓存命中率</span>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead>
        <tr>
          <th>域名</th>
          <th>性能评分</th>
          <th>TTFB</th>
          <th>缓存命中率</th>
          <th>Gzip</th>
          <th>Brotli</th>
          <th>HTTP/2</th>
          <th>HTTP/3</th>
          <th>WebP</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${scores.map((s, i) => {
          const cfg = MOCK_PERF_CONFIGS[i]
          return `
          <tr>
            <td><span style="font-weight:500">${s.domain}</span></td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:18px;font-weight:700;color:${gradeColor[s.grade]}">${s.score}</span>
                <span style="font-size:11px;background:${gradeColor[s.grade]}22;color:${gradeColor[s.grade]};padding:2px 6px;border-radius:4px;font-weight:600">${s.grade}</span>
              </div>
            </td>
            <td style="color:${parseInt(s.ttfb) < 50 ? 'var(--success)' : parseInt(s.ttfb) < 100 ? 'var(--warning)' : 'var(--danger)'}">
              ${s.ttfb}
            </td>
            <td>${s.hitRate}</td>
            <td><i class="fas ${cfg.gzip  ? 'fa-check' : 'fa-times'}" style="color:${cfg.gzip  ? 'var(--success)' : 'var(--text-muted)'}"></i></td>
            <td><i class="fas ${cfg.brotli? 'fa-check' : 'fa-times'}" style="color:${cfg.brotli? 'var(--success)' : 'var(--text-muted)'}"></i></td>
            <td><i class="fas ${cfg.http2 ? 'fa-check' : 'fa-times'}" style="color:${cfg.http2 ? 'var(--success)' : 'var(--text-muted)'}"></i></td>
            <td><i class="fas ${cfg.http3 ? 'fa-check' : 'fa-times'}" style="color:${cfg.http3 ? 'var(--success)' : 'var(--text-muted)'}"></i></td>
            <td><i class="fas ${cfg.webp  ? 'fa-check' : 'fa-times'}" style="color:${cfg.webp  ? 'var(--success)' : 'var(--text-muted)'}"></i></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="openPerfModal('${s.domain}',${i})">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>`
        }).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- 优化配置卡片区 -->
<div class="grid-2" style="margin-bottom:20px">

  <!-- 传输压缩 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-compress"></i> 传输压缩</div>
      <span class="badge badge-success"><span class="dot"></span>已全局启用</span>
    </div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:16px">
        ${[
          { name: 'Gzip 压缩', desc: '兼容性最佳，压缩率约70%', enabled: true, savings: '节省 ~68% 流量' },
          { name: 'Brotli 压缩', desc: '比Gzip压缩率高约20%，现代浏览器支持', enabled: true, savings: '节省 ~78% 流量' },
          { name: '动态压缩', desc: '对非静态内容实时压缩', enabled: false, savings: '' },
        ].map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:500;font-size:13px">${item.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">${item.desc}</div>
            ${item.savings ? `<div style="font-size:11px;color:var(--success);margin-top:2px">${item.savings}</div>` : ''}
          </div>
          <div class="toggle-switch ${item.enabled ? 'on' : ''}" onclick="toggleSwitch(this,'${item.name}')">
            <div class="toggle-knob"></div>
          </div>
        </div>`).join('')}
        <div class="form-group" style="margin-top:4px;margin-bottom:0">
          <label class="form-label" style="font-size:12px">压缩最小文件大小</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" min="256" max="10240" value="1024" step="256"
              oninput="document.getElementById('minSizeLabel').textContent=Math.round(this.value/1024*10)/10+'KB'"
              style="flex:1;accent-color:var(--primary)">
            <span id="minSizeLabel" style="min-width:40px;font-size:12px">1.0KB</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 协议优化 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-network-wired"></i> 协议优化</div>
    </div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:16px">
        ${[
          { name: 'HTTP/2', desc: '多路复用，头部压缩，服务器推送', enabled: true },
          { name: 'HTTP/3 (QUIC)', desc: '基于UDP，更低延迟，弱网优化', enabled: false },
          { name: 'TLS 1.3', desc: '最新TLS协议，握手更快', enabled: true },
          { name: 'HSTS 强制HTTPS', desc: '浏览器强制走HTTPS，防降级攻击', enabled: true },
          { name: '0-RTT 快速恢复', desc: '复用会话，减少握手往返', enabled: false },
        ].map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:500;font-size:13px">${item.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">${item.desc}</div>
          </div>
          <div class="toggle-switch ${item.enabled ? 'on' : ''}" onclick="toggleSwitch(this,'${item.name}')">
            <div class="toggle-knob"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- 图片优化 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-image"></i> 图片优化</div>
    </div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:16px">
        ${[
          { name: 'WebP 自动转换', desc: '对支持WebP的浏览器自动转换，减小30-50%', enabled: true },
          { name: 'AVIF 格式支持', desc: '比WebP更高压缩率，Chrome/Firefox支持', enabled: false },
          { name: '图片懒加载', desc: '页面滚动到可视区域再加载图片', enabled: true },
          { name: '响应式图片', desc: '根据设备分辨率返回对应尺寸', enabled: false },
        ].map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:500;font-size:13px">${item.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">${item.desc}</div>
          </div>
          <div class="toggle-switch ${item.enabled ? 'on' : ''}" onclick="toggleSwitch(this,'${item.name}')">
            <div class="toggle-knob"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- 缓存规则 -->
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-database"></i> Cache-Control 规则</div>
      <button class="btn btn-outline btn-sm" onclick="openModal('addCacheRuleModal')">
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div class="card-body" style="padding:0">
      ${[
        { pattern: '*.jpg, *.png, *.gif, *.ico', maxAge: '30天', stale: '7天', vary: '' },
        { pattern: '*.js, *.css',                maxAge: '7天',  stale: '1天', vary: '' },
        { pattern: '*.html, *.htm',              maxAge: '1小时', stale: '10分钟', vary: 'Accept-Encoding' },
        { pattern: '/api/*',                      maxAge: '不缓存', stale: '-', vary: '' },
        { pattern: '*.mp4, *.webm',               maxAge: '90天', stale: '30天', vary: '' },
      ].map(r => `
      <div style="padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <code style="color:var(--secondary)">${r.pattern}</code>
          <div style="display:flex;gap:12px;color:var(--text-muted)">
            <span>max-age: <b style="color:var(--text-primary)">${r.maxAge}</b></span>
            <span>stale: <b style="color:var(--text-primary)">${r.stale}</b></span>
            ${r.vary ? `<span>Vary: <b style="color:var(--text-primary)">${r.vary}</b></span>` : ''}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- JS/CSS 压缩 -->
<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-code"></i> 代码压缩（Minify）</div>
    <button class="btn btn-primary btn-sm" onclick="saveAll()">
      <i class="fas fa-save"></i> 保存所有配置
    </button>
  </div>
  <div class="card-body">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      ${[
        { name: 'JavaScript Minify', desc: '移除空白和注释，混淆变量名', enabled: true, savings: '平均减少 35%' },
        { name: 'CSS Minify',        desc: '合并重复选择器，移除冗余样式', enabled: true, savings: '平均减少 25%' },
        { name: 'HTML Minify',       desc: '移除HTML注释和多余空白',       enabled: false, savings: '平均减少 10%' },
      ].map(item => `
      <div style="background:var(--dark-3);border-radius:10px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="font-weight:600;font-size:13px">${item.name}</div>
          <div class="toggle-switch ${item.enabled ? 'on' : ''}" onclick="toggleSwitch(this,'${item.name}')">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">${item.desc}</div>
        ${item.enabled ? `<div style="font-size:11px;color:var(--success)">${item.savings}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<style>
.toggle-switch {
  width: 42px; height: 22px;
  background: rgba(255,255,255,0.1);
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-switch.on { background: var(--success); }
.toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 16px; height: 16px;
  background: white;
  border-radius: 50%;
  transition: left 0.2s;
}
.toggle-switch.on .toggle-knob { left: 23px; }
</style>
<script>
function toggleSwitch(el, name) {
  el.classList.toggle('on');
  const isOn = el.classList.contains('on');
  showToast(name + (isOn ? ' 已开启' : ' 已关闭'), isOn ? 'success' : 'info');
}
function saveAll() {
  const configs = {};
  document.querySelectorAll('.toggle-switch').forEach((sw, i) => {
    configs['opt_' + i] = sw.classList.contains('on');
  });
  fetch('/api/performance/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: 'global', ...configs })
  }).then(r => r.json()).then(d => {
    if (d.success) showToast('性能优化配置已保存', 'success');
  });
}
function openPerfModal(domain, idx) {
  showToast('正在加载 ' + domain + ' 的性能配置...', 'info');
}
</script>`
}
