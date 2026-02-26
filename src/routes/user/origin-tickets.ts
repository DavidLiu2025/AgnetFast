/**
 * M4 回源配置路由
 * M7 工单入口路由（用户前台）
 */
import { Hono } from 'hono'
import { Layout } from '../../lib/layout'
import { TOAST_SCRIPT } from '../../lib/mock'

export const originConfigRoute = new Hono()
export const ticketsUserRoute = new Hono()

// ─── M4: 回源配置 ─────────────────────────────────────────────────────────────
originConfigRoute.get('/origin-config', (c) => {
  return c.html(Layout({
    title: '回源配置',
    activeNav: 'origin-config',
    children: originConfigHtml(),
  }))
})

originConfigRoute.post('/api/origin-config', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.domain) return c.json({ error: 'domain is required' }, 400)
  if (!body.originUrl) return c.json({ error: 'originUrl is required' }, 400)
  return c.json({ id: `oc-${Date.now()}`, ...body, updated: new Date().toISOString() }, 201)
})

originConfigRoute.put('/api/origin-config/:domain', async (c) => {
  const domain = c.req.param('domain')
  const body = await c.req.json().catch(() => ({})) as any
  return c.json({ success: true, domain, ...body })
})

// ─── M7: 工单入口（用户前台） ──────────────────────────────────────────────────
ticketsUserRoute.get('/tickets', (c) => {
  return c.html(Layout({
    title: '技术支持',
    activeNav: 'tickets',
    children: ticketsHtml(),
  }))
})

ticketsUserRoute.post('/api/tickets', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.subject) return c.json({ error: 'subject is required' }, 400)
  if (!body.content) return c.json({ error: 'content is required' }, 400)
  return c.json({
    id: `T-${Date.now().toString().slice(-6)}`,
    subject: body.subject,
    status: 'open',
    priority: body.priority || 'medium',
    created: new Date().toISOString(),
  }, 201)
})

// ─── 回源配置页面HTML ──────────────────────────────────────────────────────────
function originConfigHtml(): string {
  const originConfigs = [
    { domain: 'cdn.shopxyz.cn', originUrl: 'https://origin.shopxyz.cn', protocol: 'HTTPS', port: 443, timeout: 30, followRedirect: true, sni: '自动', status: 'active' },
    { domain: 'img.newsportal.com', originUrl: 'http://img-origin.newsportal.com', protocol: 'HTTP', port: 80, timeout: 15, followRedirect: false, sni: '-', status: 'active' },
    { domain: 'api.fastgame.io', originUrl: 'https://api-origin.fastgame.io', protocol: 'HTTPS', port: 443, timeout: 10, followRedirect: false, sni: '自动', status: 'active' },
    { domain: 'files.edufast.cn', originUrl: 'http://files.edufast.cn:8080', protocol: 'HTTP', port: 8080, timeout: 60, followRedirect: true, sni: '-', status: 'active' },
  ]

  return `
<div class="page-header">
  <div>
    <h1 class="page-title">回源配置</h1>
    <p class="page-desc">配置CDN回源策略，控制如何访问您的源站服务器</p>
  </div>
  <button class="btn btn-primary" onclick="openModal('addOriginModal')">
    <i class="fas fa-plus"></i> 新增回源配置
  </button>
</div>

<!-- 回源策略说明 -->
<div class="card" style="margin-bottom:20px;background:rgba(99,102,241,0.05);border-color:rgba(99,102,241,0.2)">
  <div class="card-body" style="padding:14px 16px">
    <div style="display:flex;gap:12px;align-items:flex-start">
      <i class="fas fa-circle-info" style="color:var(--secondary);margin-top:2px"></i>
      <div style="font-size:13px;color:var(--text-muted)">
        <strong style="color:var(--text-primary)">回源说明：</strong>
        CDN节点缓存未命中时，将按此配置向您的源站拉取内容。建议源站开放CDN节点IP段，并配置Host校验。
        <a href="#" style="color:var(--secondary);margin-left:4px">查看CDN出口IP段 →</a>
      </div>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-server"></i> 回源配置列表</div>
  </div>
  <div class="card-body" style="padding:0">
    <table class="table">
      <thead>
        <tr>
          <th>加速域名</th>
          <th>源站地址</th>
          <th>协议/端口</th>
          <th>超时(s)</th>
          <th>跟随重定向</th>
          <th>SNI</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${originConfigs.map(oc => `
        <tr>
          <td><span style="font-weight:500">${oc.domain}</span></td>
          <td><code style="font-size:12px;color:var(--secondary)">${oc.originUrl}</code></td>
          <td>
            <span class="badge ${oc.protocol === 'HTTPS' ? 'badge-success' : 'badge-info'}">${oc.protocol}</span>
            <span style="font-size:12px;color:var(--text-muted);margin-left:4px">:${oc.port}</span>
          </td>
          <td>${oc.timeout}s</td>
          <td>
            <span style="color:${oc.followRedirect ? 'var(--success)' : 'var(--text-muted)'}">
              <i class="fas ${oc.followRedirect ? 'fa-check' : 'fa-times'}"></i>
            </span>
          </td>
          <td style="font-size:12px;color:var(--text-muted)">${oc.sni}</td>
          <td><span class="badge badge-success"><span class="dot"></span>正常</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="editOrigin('${oc.domain}')">
              <i class="fas fa-edit"></i> 编辑
            </button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- 高级回源设置 -->
<div class="card" style="margin-top:20px">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-sliders"></i> 高级回源设置</div>
  </div>
  <div class="card-body">
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px">
      <div>
        <h4 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text-primary)">
          <i class="fas fa-shield-halved" style="color:var(--secondary);margin-right:6px"></i>回源Host配置
        </h4>
        <div class="form-group">
          <label class="form-label">默认回源Host</label>
          <select class="form-control">
            <option>与加速域名相同</option>
            <option>与源站域名相同</option>
            <option>自定义</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">回源协议</label>
          <div style="display:flex;gap:12px;margin-top:6px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" name="protocol" value="http" style="accent-color:var(--primary)"> HTTP
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" name="protocol" value="https" checked style="accent-color:var(--primary)"> HTTPS
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" name="protocol" value="follow" style="accent-color:var(--primary)"> 跟随请求
            </label>
          </div>
        </div>
      </div>
      <div>
        <h4 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text-primary)">
          <i class="fas fa-clock" style="color:var(--secondary);margin-right:6px"></i>超时与重试
        </h4>
        <div class="form-group">
          <label class="form-label">连接超时</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" min="5" max="60" value="30" oninput="document.getElementById('connTimeout').textContent=this.value" style="flex:1;accent-color:var(--primary)">
            <span id="connTimeout" style="min-width:30px;text-align:right">30</span>s
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">失败重试次数</label>
          <select class="form-control">
            <option>不重试</option>
            <option selected>重试1次</option>
            <option>重试2次</option>
            <option>重试3次</option>
          </select>
        </div>
      </div>
    </div>
    <div style="margin-top:16px;display:flex;justify-content:flex-end">
      <button class="btn btn-primary" onclick="saveOriginSettings()">
        <i class="fas fa-save"></i> 保存全局配置
      </button>
    </div>
  </div>
</div>

<!-- 新增Modal -->
<div class="modal" id="addOriginModal">
  <div class="modal-content" style="max-width:520px">
    <div class="modal-header">
      <div class="modal-title">新增回源配置</div>
      <button class="modal-close" onclick="closeModal('addOriginModal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">加速域名 <span style="color:#ef4444">*</span></label>
        <input type="text" class="form-control" id="newDomain" placeholder="例：cdn.example.com">
      </div>
      <div class="form-group">
        <label class="form-label">源站地址 <span style="color:#ef4444">*</span></label>
        <input type="text" class="form-control" id="newOriginUrl" placeholder="例：https://origin.example.com">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">端口</label>
          <input type="number" class="form-control" id="newPort" value="443">
        </div>
        <div class="form-group">
          <label class="form-label">超时时间(s)</label>
          <input type="number" class="form-control" id="newTimeout" value="30">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('addOriginModal')">取消</button>
      <button class="btn btn-primary" onclick="addOriginConfig()"><i class="fas fa-check"></i> 保存配置</button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function editOrigin(domain) { showToast('正在加载 ' + domain + ' 的配置...', 'info'); }
function saveOriginSettings() { showToast('全局回源配置已保存', 'success'); }
async function addOriginConfig() {
  const domain = document.getElementById('newDomain').value;
  const originUrl = document.getElementById('newOriginUrl').value;
  const port = document.getElementById('newPort').value;
  const timeout = document.getElementById('newTimeout').value;
  if (!domain || !originUrl) { showToast('请填写必填项', 'error'); return; }
  const res = await fetch('/api/origin-config', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ domain, originUrl, port: parseInt(port), timeout: parseInt(timeout) })
  });
  if (res.ok) {
    showToast('回源配置已添加', 'success');
    closeModal('addOriginModal');
    setTimeout(() => location.reload(), 1500);
  }
}
</script>`
}

// ─── 工单入口页面HTML ──────────────────────────────────────────────────────────
function ticketsHtml(): string {
  const myTickets = [
    { id: 'T-202601', subject: '域名解析不生效，已等待2小时', priority: 'high', status: 'open', created: '2026-02-26 14:23', reply: null },
    { id: 'T-202589', subject: 'SSL证书申请失败，提示DNS验证错误', priority: 'high', status: 'open', created: '2026-02-25 09:12', reply: '技术小李' },
    { id: 'T-202544', subject: '请问带宽超出后会自动限速还是停服？', priority: 'low', status: 'resolved', created: '2026-02-20 16:45', reply: '客服小王' },
    { id: 'T-202512', subject: '申请开具增值税专用发票', priority: 'low', status: 'resolved', created: '2026-02-15 11:30', reply: '财务小张' },
  ]

  const statusMap: Record<string, [string, string]> = {
    open: ['badge-danger', '待处理'],
    pending: ['badge-warning', '处理中'],
    resolved: ['badge-success', '已解决'],
  }

  return `
<div class="page-header">
  <div>
    <h1 class="page-title">技术支持</h1>
    <p class="page-desc">提交工单，我们7×24小时响应</p>
  </div>
  <button class="btn btn-primary" onclick="openModal('newTicketModal')">
    <i class="fas fa-plus"></i> 提交工单
  </button>
</div>

<!-- SLA承诺 -->
<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(99,102,241,0.15)"><i class="fas fa-bolt" style="color:#6366f1"></i></div>
    <div class="stat-info">
      <div class="stat-value">15<span style="font-size:14px;color:var(--text-muted)">分钟</span></div>
      <div class="stat-label">紧急工单首响</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(16,185,129,0.15)"><i class="fas fa-clock" style="color:#10b981"></i></div>
    <div class="stat-info">
      <div class="stat-value">2<span style="font-size:14px;color:var(--text-muted)">小时</span></div>
      <div class="stat-label">普通工单首响</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(245,158,11,0.15)"><i class="fas fa-headset" style="color:#f59e0b"></i></div>
    <div class="stat-info">
      <div class="stat-value">98.6<span style="font-size:14px;color:var(--text-muted)">%</span></div>
      <div class="stat-label">满意度</div>
    </div>
  </div>
</div>

<!-- 工单列表 -->
<div class="card">
  <div class="card-header">
    <div class="card-title"><i class="fas fa-list"></i> 我的工单</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm active">全部</button>
      <button class="btn btn-outline btn-sm">待处理</button>
      <button class="btn btn-outline btn-sm">已解决</button>
    </div>
  </div>
  <div class="card-body" style="padding:0">
    ${myTickets.map(t => `
    <div style="padding:16px;border-bottom:1px solid var(--border);cursor:pointer" onclick="viewTicket('${t.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span class="badge ${statusMap[t.status][0]}"><span class="dot"></span>${statusMap[t.status][1]}</span>
            <span style="font-weight:500">${t.subject}</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);display:flex;gap:16px">
            <span><i class="fas fa-hashtag" style="margin-right:4px"></i>${t.id}</span>
            <span><i class="fas fa-clock" style="margin-right:4px"></i>${t.created}</span>
            ${t.reply ? `<span><i class="fas fa-user-tie" style="margin-right:4px"></i>${t.reply}</span>` : ''}
          </div>
        </div>
        <i class="fas fa-chevron-right" style="color:var(--text-muted);margin-left:12px"></i>
      </div>
    </div>`).join('')}
  </div>
</div>

<!-- 常见问题 -->
<div class="card" style="margin-top:20px">
  <div class="card-header"><div class="card-title"><i class="fas fa-circle-question"></i> 常见问题</div></div>
  <div class="card-body" style="padding:0">
    ${[
      ['为什么域名接入后无法解析？', '请确认已将域名CNAME记录指向AgentFast分配的加速域名，DNS生效通常需要5-30分钟。'],
      ['如何清除CDN缓存？', '进入「缓存管理」页面，输入需要刷新的URL或目录路径，点击「立即刷新」。'],
      ['SSL证书申请失败怎么办？', 'SSL申请需要DNS验证通过，请确认CNAME记录已生效后重新申请。'],
      ['超出流量包后会怎样？', '默认超出套餐流量后按量计费（¥0.12/GB），可在计费设置中启用流量封顶。'],
    ].map(([q, a]) => `
    <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
      <div style="font-weight:500;margin-bottom:6px;font-size:14px">${q}</div>
      <div style="font-size:13px;color:var(--text-muted)">${a}</div>
    </div>`).join('')}
  </div>
</div>

<!-- 新建工单Modal -->
<div class="modal" id="newTicketModal">
  <div class="modal-content" style="max-width:560px">
    <div class="modal-header">
      <div class="modal-title">提交新工单</div>
      <button class="modal-close" onclick="closeModal('newTicketModal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">问题类型</label>
        <select class="form-control">
          <option>域名接入问题</option>
          <option>缓存刷新问题</option>
          <option>SSL证书问题</option>
          <option>计费账单问题</option>
          <option>其他</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">问题标题 <span style="color:#ef4444">*</span></label>
        <input type="text" class="form-control" id="ticketSubject" placeholder="简明描述您的问题">
      </div>
      <div class="form-group">
        <label class="form-label">详细描述 <span style="color:#ef4444">*</span></label>
        <textarea class="form-control" id="ticketContent" rows="5" placeholder="请尽量提供：错误截图、域名、出现时间等信息，有助于更快解决问题" style="resize:vertical"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">优先级</label>
        <div style="display:flex;gap:12px;margin-top:6px">
          <label style="cursor:pointer"><input type="radio" name="priority" value="low" style="accent-color:var(--primary)"> 普通</label>
          <label style="cursor:pointer"><input type="radio" name="priority" value="medium" checked style="accent-color:var(--primary)"> 较高</label>
          <label style="cursor:pointer"><input type="radio" name="priority" value="high" style="accent-color:var(--primary)"> 紧急</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('newTicketModal')">取消</button>
      <button class="btn btn-primary" onclick="submitTicket()"><i class="fas fa-paper-plane"></i> 提交工单</button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function viewTicket(id) { showToast('工单详情：' + id, 'info'); }
async function submitTicket() {
  const subject = document.getElementById('ticketSubject').value;
  const content = document.getElementById('ticketContent').value;
  const priority = document.querySelector('[name="priority"]:checked')?.value || 'medium';
  if (!subject) { showToast('请填写问题标题', 'error'); return; }
  if (!content) { showToast('请填写详细描述', 'error'); return; }
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ subject, content, priority })
  });
  const data = await res.json();
  if (res.ok) {
    showToast('工单已提交，编号：' + data.id, 'success');
    closeModal('newTicketModal');
    setTimeout(() => location.reload(), 2000);
  }
}
</script>`
}
