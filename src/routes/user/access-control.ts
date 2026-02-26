import { Hono } from 'hono'
import { Layout } from '../../lib/layout'
import { TOAST_SCRIPT } from '../../lib/mock'

export const accessControlRoute = new Hono()

// ─── Page ────────────────────────────────────────────────────────────────────
accessControlRoute.get('/access-control', (c) => {
  return c.html(Layout({
    title: '访问控制',
    activeNav: 'access-control',
    children: pageHtml(),
  }))
})

// ─── API: IP Rules ───────────────────────────────────────────────────────────
accessControlRoute.post('/api/access-control/ip-rules', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.ip) return c.json({ error: 'ip is required' }, 400)
  if (!body.type) return c.json({ error: 'type is required' }, 400)
  return c.json({ id: `rule-${Date.now()}`, ...body, created: new Date().toISOString() }, 201)
})

accessControlRoute.delete('/api/access-control/ip-rules/:id', (c) => {
  return c.json({ success: true, id: c.req.param('id') })
})

// ─── API: Referer Rules ──────────────────────────────────────────────────────
accessControlRoute.post('/api/access-control/referer-rules', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  if (!body.values) return c.json({ error: 'values is required' }, 400)
  return c.json({ id: `ref-${Date.now()}`, ...body }, 201)
})

// ─── Page HTML ───────────────────────────────────────────────────────────────
function pageHtml(): string {
  const ipRules = [
    { id: 'r001', ip: '192.168.1.0/24', type: 'whitelist', domain: '全部域名', remark: '内网白名单', added: '2026-01-10' },
    { id: 'r002', ip: '103.21.244.0/22', type: 'blacklist', domain: 'cdn.shopxyz.cn', remark: '已知爬虫IP段', added: '2026-02-01' },
    { id: 'r003', ip: '45.138.0.0/16', type: 'blacklist', domain: '全部域名', remark: '恶意扫描', added: '2026-02-18' },
    { id: 'r004', ip: '10.0.0.0/8', type: 'whitelist', domain: '全部域名', remark: '私有网络', added: '2025-12-01' },
  ]

  const uaRules = [
    { id: 'u001', pattern: 'python-requests/*', action: 'block', domain: '全部域名', remark: '脚本爬虫' },
    { id: 'u002', pattern: 'curl/*', action: 'block', domain: 'img.newsportal.com', remark: '接口爬取防护' },
    { id: 'u003', pattern: 'Googlebot/*', action: 'allow', domain: '全部域名', remark: '允许谷歌爬虫' },
  ]

  return `
<div class="page-header">
  <div>
    <h2>访问控制</h2>
    <p>IP 黑白名单、防盗链、User-Agent 过滤，精准管控访问来源</p>
  </div>
</div>

<!-- Tabs -->
<div class="tabs" id="acTabs">
  <div class="tab-item active" onclick="switchTab('ip')">IP 黑白名单</div>
  <div class="tab-item" onclick="switchTab('referer')">防盗链配置</div>
  <div class="tab-item" onclick="switchTab('ua')">User-Agent 过滤</div>
  <div class="tab-item" onclick="switchTab('geo')">地区封锁</div>
</div>

<!-- IP黑白名单 -->
<div id="panel-ip">
  <div class="page-header" style="margin-bottom:16px">
    <div>
      <div style="font-size:14px;font-weight:600">IP 访问规则</div>
      <div style="font-size:12px;color:var(--text-muted)">黑名单：拒绝访问 / 白名单：仅允许访问</div>
    </div>
    <button class="btn btn-primary" onclick="openModal('addIpModal')">
      <i class="fas fa-plus"></i> 添加规则
    </button>
  </div>

  <div class="filter-bar" style="margin-bottom:12px">
    <input type="text" placeholder="🔍 搜索IP或备注..." style="flex:1;max-width:280px">
    <select>
      <option>全部类型</option>
      <option>黑名单</option>
      <option>白名单</option>
    </select>
    <select>
      <option>全部域名</option>
      <option>static.example.com</option>
      <option>cdn.shopxyz.cn</option>
    </select>
  </div>

  <div class="card" style="padding:0;overflow:hidden">
    <table>
      <thead>
        <tr>
          <th>IP / CIDR</th>
          <th>类型</th>
          <th>生效域名</th>
          <th>备注</th>
          <th>添加时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${ipRules.map(r => `
        <tr>
          <td><code style="font-family:monospace;font-size:13px;color:var(--text-primary)">${r.ip}</code></td>
          <td>
            ${r.type === 'blacklist'
              ? '<span class="badge badge-danger"><span class="dot"></span>黑名单</span>'
              : '<span class="badge badge-success"><span class="dot"></span>白名单</span>'}
          </td>
          <td style="font-size:12px;color:var(--text-secondary)">${r.domain}</td>
          <td style="color:var(--text-muted);font-size:12px">${r.remark}</td>
          <td style="font-size:12px;color:var(--text-muted)">${r.added}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm"><i class="fas fa-pen"></i></button>
              <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:rgba(239,68,68,0.3)"
                onclick="showToast('规则 ${r.ip} 已删除','success')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- 防盗链 -->
<div id="panel-referer" style="display:none">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="card">
      <div class="card-title" style="margin-bottom:16px"><i class="fas fa-link" style="color:var(--primary-light);margin-right:8px"></i>Referer 防盗链</div>
      <div class="alert alert-info" style="margin-bottom:16px">
        <i class="fas fa-circle-info"></i>
        通过检查请求的 Referer 头，限制资源只能从指定来源引用
      </div>
      <div class="form-group">
        <label>生效域名</label>
        <select>
          <option>全部域名</option>
          <option>img.newsportal.com</option>
          <option>static.example.com</option>
        </select>
      </div>
      <div class="form-group">
        <label>规则类型</label>
        <div style="display:flex;gap:10px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
            <input type="radio" name="refType" value="whitelist" checked style="accent-color:var(--primary)"> 白名单（只允许以下来源）
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
            <input type="radio" name="refType" value="blacklist" style="accent-color:var(--primary)"> 黑名单（拒绝以下来源）
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>允许空 Referer</label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" checked style="width:auto;accent-color:var(--primary)">
          允许（直接访问URL不被拦截）
        </label>
      </div>
      <div class="form-group">
        <label>域名列表 <span style="color:var(--text-muted);font-weight:400">（每行一个）</span></label>
        <textarea style="height:120px;font-family:monospace;font-size:13px;resize:vertical"
          placeholder="example.com&#10;*.myshop.cn&#10;partner.site.com">example.com
*.myshop.cn
newsportal.com</textarea>
      </div>
      <button class="btn btn-primary" style="width:auto" onclick="showToast('防盗链规则已保存')">
        <i class="fas fa-floppy-disk"></i> 保存配置
      </button>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:16px"><i class="fas fa-shield-halved" style="color:var(--success);margin-right:8px"></i>访问令牌（Token鉴权）</div>
      <div class="alert alert-warning" style="margin-bottom:16px">
        <i class="fas fa-triangle-exclamation"></i>
        开启后，URL中需携带有效签名才能访问，适用于私有内容防护
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;justify-content:space-between">
          <span>Token 鉴权状态</span>
          <span class="badge badge-gray">未开启</span>
        </label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn btn-primary btn-sm" onclick="showToast('Token鉴权已开启')"><i class="fas fa-power-off"></i> 开启</button>
          <button class="btn btn-outline btn-sm" disabled>生成密钥</button>
        </div>
      </div>
      <div class="form-group">
        <label>鉴权密钥（开启后可用）</label>
        <div style="display:flex;gap:8px">
          <input type="password" value="••••••••••••••••••••••••••••••••" disabled style="flex:1;font-family:monospace">
          <button class="btn btn-outline btn-sm" disabled><i class="fas fa-rotate"></i></button>
        </div>
      </div>
      <div class="form-group">
        <label>有效期（秒）</label>
        <input type="number" value="3600" disabled placeholder="单位：秒，0为永不过期">
      </div>
      <div class="form-group">
        <label>URL格式示例</label>
        <code style="display:block;background:var(--dark);padding:10px;border-radius:6px;font-size:11px;color:var(--text-secondary);word-break:break-all">
          https://cdn.example.com/img.jpg?sign=abc123&t=1706000000
        </code>
      </div>
    </div>
  </div>
</div>

<!-- UA过滤 -->
<div id="panel-ua" style="display:none">
  <div class="page-header" style="margin-bottom:16px">
    <div>
      <div style="font-size:14px;font-weight:600">User-Agent 过滤规则</div>
      <div style="font-size:12px;color:var(--text-muted)">支持通配符匹配，例如 python-requests/*</div>
    </div>
    <button class="btn btn-primary" onclick="openModal('addUaModal')">
      <i class="fas fa-plus"></i> 添加规则
    </button>
  </div>
  <div class="card" style="padding:0;overflow:hidden">
    <table>
      <thead>
        <tr><th>UA 匹配模式</th><th>动作</th><th>生效域名</th><th>备注</th><th>操作</th></tr>
      </thead>
      <tbody>
        ${uaRules.map(r => `
        <tr>
          <td><code style="font-family:monospace;font-size:13px">${r.pattern}</code></td>
          <td>${r.action === 'block'
            ? '<span class="badge badge-danger">拦截</span>'
            : '<span class="badge badge-success">放行</span>'}</td>
          <td style="font-size:12px;color:var(--text-secondary)">${r.domain}</td>
          <td style="font-size:12px;color:var(--text-muted)">${r.remark}</td>
          <td>
            <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:rgba(239,68,68,0.3)"
              onclick="showToast('规则已删除')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- 地区封锁 -->
<div id="panel-geo" style="display:none">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="card">
      <div class="card-title" style="margin-bottom:16px"><i class="fas fa-earth-asia" style="color:var(--secondary);margin-right:8px"></i>地区访问控制</div>
      <div class="form-group">
        <label>生效域名</label>
        <select><option>全部域名</option><option>cdn.shopxyz.cn</option></select>
      </div>
      <div class="form-group">
        <label>规则类型</label>
        <select>
          <option>黑名单（拒绝以下地区）</option>
          <option>白名单（只允许以下地区）</option>
        </select>
      </div>
      <div class="form-group">
        <label>选择地区</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:240px;overflow-y:auto;padding:4px">
          ${['中国大陆','中国香港','中国澳门','中国台湾','日本','韩国','新加坡','美国','英国','德国','法国','俄罗斯','印度','巴西','澳大利亚'].map((r, i) => `
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;padding:6px;border-radius:6px;transition:background 0.15s" onmouseover="this.style.background='var(--dark)'" onmouseout="this.style.background=''">
            <input type="checkbox" ${i < 4 ? 'checked' : ''} style="width:auto;accent-color:var(--primary)"> ${r}
          </label>
          `).join('')}
        </div>
      </div>
      <button class="btn btn-primary" style="width:auto" onclick="showToast('地区规则已保存')">
        <i class="fas fa-floppy-disk"></i> 保存
      </button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">生效中的地区规则</div>
      <div class="empty-state" style="padding:32px">
        <i class="fas fa-earth-asia"></i>
        <p>暂未配置地区封锁规则</p>
        <p style="font-size:12px;margin-top:4px">在左侧配置并保存后生效</p>
      </div>
    </div>
  </div>
</div>

<!-- Add IP Modal -->
<div class="modal-overlay" id="addIpModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title"><i class="fas fa-ban" style="color:var(--danger);margin-right:8px"></i>添加 IP 规则</div>
      <button class="modal-close" onclick="closeModal('addIpModal')"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label>IP 地址 / CIDR <span style="color:var(--danger)">*</span></label>
      <input id="newIp" placeholder="例如：1.2.3.4 或 1.2.3.0/24">
    </div>
    <div class="form-group">
      <label>规则类型 <span style="color:var(--danger)">*</span></label>
      <select id="newIpType">
        <option value="blacklist">黑名单（拒绝访问）</option>
        <option value="whitelist">白名单（允许访问）</option>
      </select>
    </div>
    <div class="form-group">
      <label>生效域名</label>
      <select><option>全部域名</option><option>static.example.com</option><option>cdn.shopxyz.cn</option></select>
    </div>
    <div class="form-group">
      <label>备注</label>
      <input placeholder="描述此规则的用途（可选）">
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('addIpModal')">取消</button>
      <button class="btn btn-primary" onclick="closeModal('addIpModal');showToast('IP规则添加成功')">
        <i class="fas fa-check"></i> 确认添加
      </button>
    </div>
  </div>
</div>

<!-- Add UA Modal -->
<div class="modal-overlay" id="addUaModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">添加 User-Agent 规则</div>
      <button class="modal-close" onclick="closeModal('addUaModal')"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label>UA 匹配模式 <span style="color:var(--danger)">*</span></label>
      <input placeholder="例如：python-requests/* 或 BadBot/1.0">
      <div style="font-size:12px;color:var(--text-muted);margin-top:4px">支持 * 通配符，大小写不敏感</div>
    </div>
    <div class="form-group">
      <label>处理动作</label>
      <select>
        <option>拦截（返回403）</option>
        <option>放行（白名单）</option>
        <option>重定向到指定URL</option>
      </select>
    </div>
    <div class="form-group">
      <label>生效域名</label>
      <select><option>全部域名</option><option>img.newsportal.com</option></select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('addUaModal')">取消</button>
      <button class="btn btn-primary" onclick="closeModal('addUaModal');showToast('UA规则添加成功')">确认添加</button>
    </div>
  </div>
</div>

${TOAST_SCRIPT}
<script>
function switchTab(t) {
  const panels = ['ip','referer','ua','geo'];
  const tabs = document.querySelectorAll('#acTabs .tab-item');
  panels.forEach((p, i) => {
    document.getElementById('panel-'+p).style.display = p===t?'block':'none';
    tabs[i].className = 'tab-item' + (p===t?' active':'');
  });
}
</script>`
}
