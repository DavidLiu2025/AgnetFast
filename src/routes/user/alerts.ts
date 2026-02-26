import { Hono } from 'hono'
import { Layout } from '../../lib/layout'
import { TOAST_SCRIPT } from '../../lib/mock'

export const alertsRoute = new Hono()

// Mock数据
const ALERT_RULES = [
  { id: 'ar001', name: '带宽超限告警', metric: 'bandwidth', threshold: 500, unit: 'Gbps', operator: 'gt', domain: '全部域名', channels: ['email', 'wechat'], enabled: true, triggered: 3 },
  { id: 'ar002', name: '5xx错误率告警', metric: 'error_rate', threshold: 1, unit: '%', operator: 'gt', domain: '全部域名', channels: ['email'], enabled: true, triggered: 1 },
  { id: 'ar003', name: '命中率下降告警', metric: 'hit_rate', threshold: 90, unit: '%', operator: 'lt', domain: 'api.gamehub.io', channels: ['email'], enabled: true, triggered: 0 },
  { id: 'ar004', name: '回源流量异常', metric: 'origin_traffic', threshold: 100, unit: 'GB/h', operator: 'gt', domain: '全部域名', channels: ['wechat'], enabled: false, triggered: 0 },
  { id: 'ar005', name: '节点延迟告警', metric: 'latency', threshold: 200, unit: 'ms', operator: 'gt', domain: '全部域名', channels: ['email', 'sms'], enabled: true, triggered: 0 },
]

const ALERT_HISTORY = [
  { id: 'ah001', level: 'critical', rule: '带宽超限告警', domain: 'cdn.shopxyz.cn', message: '带宽达到 612 Gbps，超过阈值 500 Gbps', time: '2026-02-26 14:32:18', duration: '23分钟', status: 'resolved' },
  { id: 'ah002', level: 'warning', rule: '5xx错误率告警', domain: 'api.gamehub.io', message: '5xx 错误率 2.3%，超过阈值 1%', time: '2026-02-26 10:15:44', duration: '8分钟', status: 'resolved' },
  { id: 'ah003', level: 'critical', rule: '带宽超限告警', domain: 'static.example.com', message: '带宽达到 534 Gbps，超过阈值 500 Gbps', time: '2026-02-25 20:08:12', duration: '15分钟', status: 'resolved' },
  { id: 'ah004', level: 'info', rule: '命中率下降告警', domain: 'img.newsportal.com', message: '缓存命中率 88.2%，低于阈值 90%', time: '2026-02-24 16:44:33', duration: '42分钟', status: 'resolved' },
  { id: 'ah005', level: 'warning', rule: '带宽超限告警', domain: 'cdn.shopxyz.cn', message: '带宽达到 503 Gbps，超过阈值 500 Gbps', time: '2026-02-23 11:20:05', duration: '6分钟', status: 'resolved' },
]

// ─── Page ────────────────────────────────────────────────────────────────────
alertsRoute.get('/alerts', (c) => {
  return c.html(Layout({ title: '告警配置', activeNav: 'alerts', children: pageHtml() }))
})

// ─── API ─────────────────────────────────────────────────────────────────────
alertsRoute.post('/api/alerts/rules', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.name) return c.json({ error: 'name is required' }, 400)
  if (body.threshold === undefined || body.threshold === null) return c.json({ error: 'threshold is required' }, 400)
  return c.json({ id: `rule-${Date.now()}`, ...body, enabled: true, triggered: 0 }, 201)
})

alertsRoute.put('/api/alerts/rules/:id/toggle', (c) => {
  const id = c.req.param('id')
  const rule = ALERT_RULES.find(r => r.id === id)
  const enabled = rule ? !rule.enabled : true
  return c.json({ id, enabled })
})

alertsRoute.delete('/api/alerts/rules/:id', (c) => {
  return c.json({ success: true, id: c.req.param('id') })
})

alertsRoute.get('/api/alerts/history', (c) => {
  const domain = c.req.query('domain')
  const data = domain
    ? ALERT_HISTORY.filter(h => h.domain.includes(domain))
    : ALERT_HISTORY
  return c.json(data)
})

// ─── Page HTML ───────────────────────────────────────────────────────────────
function pageHtml(): string {
  const metricLabels: Record<string, string> = {
    bandwidth: '带宽', error_rate: '错误率', hit_rate: '命中率',
    origin_traffic: '回源流量', latency: '延迟'
  }
  const levelColors: Record<string, string> = {
    critical: 'var(--danger)', warning: 'var(--warning)', info: 'var(--secondary)'
  }
  const levelLabels: Record<string, string> = {
    critical: '严重', warning: '警告', info: '提示'
  }

  return `
<div class="page-header">
  <div>
    <h2>告警配置</h2>
    <p>配置监控指标阈值，异常时自动触发多渠道通知</p>
  </div>
  <button class="btn btn-primary" onclick="openModal('addRuleModal')">
    <i class="fas fa-plus"></i> 新建告警规则
  </button>
</div>

<!-- Stats -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${[
    ['告警规则总数', '5', 'fa-bell', '#6366f1'],
    ['已启用规则', '4', 'fa-circle-check', '#10b981'],
    ['今日触发次数', '3', 'fa-triangle-exclamation', '#f59e0b'],
    ['待处理告警', '0', 'fa-circle-xmark', '#64748b'],
  ].map(([l, v, i, c]) => `
  <div class="card" style="padding:14px;display:flex;align-items:center;gap:12px">
    <div style="width:36px;height:36px;border-radius:10px;background:${c}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <i class="fas ${i}" style="color:${c};font-size:15px"></i>
    </div>
    <div>
      <div style="font-size:20px;font-weight:700">${v}</div>
      <div style="font-size:12px;color:var(--text-muted)">${l}</div>
    </div>
  </div>`).join('')}
</div>

<!-- Rules List -->
<div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
  <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <div class="card-title">告警规则列表</div>
    <select style="padding:6px 10px;background:var(--dark);border:1px solid var(--dark-3);border-radius:6px;color:var(--text-primary);font-size:12px;outline:none">
      <option>全部状态</option><option>已启用</option><option>已禁用</option>
    </select>
  </div>
  <table>
    <thead>
      <tr><th>规则名称</th><th>监控指标</th><th>触发条件</th><th>生效域名</th><th>通知渠道</th><th>触发次数</th><th>状态</th><th>操作</th></tr>
    </thead>
    <tbody>
      ${ALERT_RULES.map(r => `
      <tr>
        <td style="font-weight:600">${r.name}</td>
        <td><span class="badge badge-purple">${metricLabels[r.metric] || r.metric}</span></td>
        <td style="font-family:monospace;font-size:12px;color:var(--text-secondary)">
          ${r.operator === 'gt' ? '>' : '<'} ${r.threshold} ${r.unit}
        </td>
        <td style="font-size:12px;color:var(--text-secondary)">${r.domain}</td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${r.channels.map(ch => {
              const icons: Record<string, string> = { email: 'fa-envelope', wechat: 'fa-comments', sms: 'fa-mobile' }
              const labels: Record<string, string> = { email: '邮件', wechat: '微信', sms: '短信' }
              return `<span class="badge badge-info"><i class="fas ${icons[ch]||'fa-bell'}" style="margin-right:3px"></i>${labels[ch]||ch}</span>`
            }).join('')}
          </div>
        </td>
        <td>
          <span style="font-weight:700;color:${r.triggered > 0 ? 'var(--warning)' : 'var(--text-muted)'}">${r.triggered}</span>
          <span style="font-size:11px;color:var(--text-muted)"> 次/近7天</span>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="position:relative;display:inline-block;width:40px;height:22px">
              <input type="checkbox" ${r.enabled ? 'checked' : ''} style="opacity:0;width:0;height:0">
              <span style="position:absolute;cursor:pointer;inset:0;background:${r.enabled ? 'var(--primary)' : 'var(--dark-3)'};border-radius:22px" onclick="showToast('告警规则状态已切换')"></span>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-outline btn-sm" onclick="openModal('editRuleModal')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:rgba(239,68,68,0.3)"
              onclick="showToast('告警规则已删除')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>

<!-- Notification Channels -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
  <div class="card">
    <div class="card-title" style="margin-bottom:16px"><i class="fas fa-bell" style="color:var(--primary-light);margin-right:8px"></i>通知渠道配置</div>
    ${[
      { name: '邮件通知', icon: 'fa-envelope', color: '#6366f1', status: true, desc: 'david@agentfast.io, ops@agentfast.io' },
      { name: '企业微信', icon: 'fa-comments', color: '#10b981', status: true, desc: 'Webhook 已配置' },
      { name: '短信通知', icon: 'fa-mobile', color: '#f59e0b', status: false, desc: '+86 138 8888 8888' },
      { name: 'Slack', icon: 'fa-slack', color: '#8b5cf6', status: false, desc: '未配置' },
    ].map(ch => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--dark);border-radius:8px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:8px;background:${ch.color}22;display:flex;align-items:center;justify-content:center">
          <i class="fab ${ch.icon}" style="color:${ch.color};font-size:14px"></i>
        </div>
        <div>
          <div style="font-size:13px;font-weight:500">${ch.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">${ch.desc}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        ${ch.status
          ? '<span class="badge badge-success"><span class="dot"></span>已启用</span>'
          : '<span class="badge badge-gray">未启用</span>'}
        <button class="btn btn-outline btn-sm">配置</button>
      </div>
    </div>`).join('')}
  </div>

  <div class="card">
    <div class="card-title" style="margin-bottom:16px"><i class="fas fa-clock" style="color:var(--warning);margin-right:8px"></i>告警静默时段</div>
    <div class="alert alert-info" style="margin-bottom:16px">
      <i class="fas fa-circle-info"></i> 静默时段内触发的告警不会发送通知，但仍会记录
    </div>
    <div class="form-group">
      <label>每日静默时段</label>
      <div style="display:flex;gap:10px;align-items:center">
        <input type="time" value="00:00" style="flex:1">
        <span style="color:var(--text-muted)">至</span>
        <input type="time" value="08:00" style="flex:1">
      </div>
    </div>
    <div class="form-group">
      <label>重复告警间隔</label>
      <select>
        <option>15分钟（同一规则15分钟内不重复通知）</option>
        <option>30分钟</option>
        <option>1小时</option>
        <option>不限制</option>
      </select>
    </div>
    <div class="form-group">
      <label>告警恢复通知</label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" checked style="width:auto;accent-color:var(--primary)">
        告警恢复时发送"已恢复"通知
      </label>
    </div>
    <button class="btn btn-primary" style="width:auto" onclick="showToast('静默配置已保存')">
      <i class="fas fa-floppy-disk"></i> 保存
    </button>
  </div>
</div>

<!-- Alert History -->
<div class="card" style="padding:0;overflow:hidden">
  <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <div class="card-title">告警历史记录</div>
    <div style="display:flex;gap:8px">
      <select style="padding:6px 10px;background:var(--dark);border:1px solid var(--dark-3);border-radius:6px;color:var(--text-primary);font-size:12px;outline:none">
        <option>全部级别</option><option>严重</option><option>警告</option><option>提示</option>
      </select>
      <select style="padding:6px 10px;background:var(--dark);border:1px solid var(--dark-3);border-radius:6px;color:var(--text-primary);font-size:12px;outline:none">
        <option>最近7天</option><option>最近30天</option>
      </select>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>级别</th><th>告警规则</th><th>域名</th><th>告警内容</th><th>触发时间</th><th>持续时长</th><th>状态</th></tr>
    </thead>
    <tbody>
      ${ALERT_HISTORY.map(h => `
      <tr>
        <td>
          <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;background:${levelColors[h.level]}22;color:${levelColors[h.level]}">
            <span style="width:5px;height:5px;border-radius:50%;background:currentColor"></span>
            ${levelLabels[h.level]}
          </span>
        </td>
        <td style="font-weight:500;font-size:13px">${h.rule}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${h.domain}</td>
        <td style="font-size:12px;color:var(--text-secondary);max-width:280px">${h.message}</td>
        <td style="font-size:12px;color:var(--text-muted)">${h.time}</td>
        <td style="font-size:12px;color:var(--text-muted)">${h.duration}</td>
        <td><span class="badge badge-success"><span class="dot"></span>已恢复</span></td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>

<!-- Add Rule Modal -->
<div class="modal-overlay" id="addRuleModal">
  <div class="modal" style="max-width:560px">
    <div class="modal-header">
      <div class="modal-title"><i class="fas fa-bell" style="color:var(--warning);margin-right:8px"></i>新建告警规则</div>
      <button class="modal-close" onclick="closeModal('addRuleModal')"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label>规则名称 <span style="color:var(--danger)">*</span></label>
      <input placeholder="例如：带宽超限告警">
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>监控指标 <span style="color:var(--danger)">*</span></label>
        <select>
          <option value="bandwidth">带宽 (Gbps)</option>
          <option value="error_rate">5xx 错误率 (%)</option>
          <option value="hit_rate">缓存命中率 (%)</option>
          <option value="latency">平均延迟 (ms)</option>
          <option value="origin_traffic">回源流量 (GB/h)</option>
          <option value="qps">QPS (次/秒)</option>
        </select>
      </div>
      <div class="form-group">
        <label>触发条件</label>
        <div style="display:flex;gap:8px">
          <select style="width:100px">
            <option value="gt">大于 &gt;</option>
            <option value="lt">小于 &lt;</option>
            <option value="gte">≥</option>
            <option value="lte">≤</option>
          </select>
          <input type="number" placeholder="阈值" style="flex:1">
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>生效域名</label>
      <select>
        <option>全部域名</option>
        <option>static.example.com</option>
        <option>cdn.shopxyz.cn</option>
        <option>api.gamehub.io</option>
      </select>
    </div>
    <div class="form-group">
      <label>通知渠道（可多选）</label>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${[['email','fa-envelope','邮件'],['wechat','fa-comments','企业微信'],['sms','fa-mobile','短信']].map(([v, i, l]) => `
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
          <input type="checkbox" value="${v}" checked style="width:auto;accent-color:var(--primary)">
          <i class="fas ${i}" style="color:var(--primary-light)"></i> ${l}
        </label>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label>持续时长（超过多久才触发告警）</label>
      <select>
        <option>立即触发（超过阈值即通知）</option>
        <option>持续1分钟</option>
        <option>持续5分钟</option>
        <option>持续10分钟</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('addRuleModal')">取消</button>
      <button class="btn btn-primary" onclick="closeModal('addRuleModal');showToast('告警规则已创建')">
        <i class="fas fa-check"></i> 创建规则
      </button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}`
}
