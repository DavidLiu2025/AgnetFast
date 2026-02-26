/**
 * 公共Mock数据工厂
 * 所有模块共享的数据生成工具
 */

// 生成随机数（可复现，用于测试）
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 生成24小时带宽数据
export function gen24hBandwidth(base = 300, variance = 200): number[] {
  return Array.from({ length: 24 }, (_, i) => Math.round(base + seededRandom(i * 7) * variance))
}

// 生成时间序列标签
export function genHourLabels(): string[] {
  return Array.from({ length: 24 }, (_, i) => `${i}:00`)
}

// Mock客户列表
export const MOCK_CUSTOMERS = [
  { id: 'c001', name: '张三', company: '北京科技有限公司', email: 'zhang@tech.com', plan: 'enterprise', status: 'active', domains: 12, traffic: '8.4 TB', spend: '¥12,480', joined: '2025-06-01' },
  { id: 'c002', name: '李四', company: '上海电商集团', email: 'li@shop.cn', plan: 'pro', status: 'active', domains: 5, traffic: '3.2 TB', spend: '¥4,680', joined: '2025-08-15' },
  { id: 'c003', name: '王五', company: '广州传媒公司', email: 'wang@media.com', plan: 'pro', status: 'suspended', domains: 3, traffic: '0', spend: '¥2,100', joined: '2025-09-01' },
  { id: 'c004', name: '赵六', company: '深圳游戏科技', email: 'zhao@game.io', plan: 'enterprise', status: 'active', domains: 8, traffic: '15.6 TB', spend: '¥28,900', joined: '2025-07-20' },
  { id: 'c005', name: '钱七', company: '杭州教育平台', email: 'qian@edu.cn', plan: 'free', status: 'active', domains: 1, traffic: '0.3 TB', spend: '¥0', joined: '2026-01-10' },
  { id: 'c006', name: '孙八', company: '成都软件公司', email: 'sun@soft.net', plan: 'pro', status: 'active', domains: 4, traffic: '1.8 TB', spend: '¥3,200', joined: '2025-11-05' },
]

// Mock节点列表
export const MOCK_NODES = [
  { id: 'n001', name: '华东-上海-01', ip: '101.251.12.18', region: '华东', city: '上海', isp: '电信', status: 'online', bandwidth: 482, capacity: 1000, cpu: 34, mem: 61, uptime: '99.98%' },
  { id: 'n002', name: '华东-上海-02', ip: '101.251.12.19', region: '华东', city: '上海', isp: '联通', status: 'online', bandwidth: 321, capacity: 1000, cpu: 28, mem: 54, uptime: '99.95%' },
  { id: 'n003', name: '华南-广州-01', ip: '121.14.22.33', region: '华南', city: '广州', isp: '电信', status: 'online', bandwidth: 267, capacity: 500, cpu: 52, mem: 71, uptime: '99.92%' },
  { id: 'n004', name: '华北-北京-01', ip: '61.135.17.44', region: '华北', city: '北京', isp: '联通', status: 'warning', bandwidth: 189, capacity: 500, cpu: 78, mem: 85, uptime: '99.81%' },
  { id: 'n005', name: '华西-成都-01', ip: '115.171.8.55', region: '华西', city: '成都', isp: '电信', status: 'online', bandwidth: 98, capacity: 200, cpu: 41, mem: 58, uptime: '99.99%' },
  { id: 'n006', name: '香港-HK-01', ip: '203.18.11.66', region: '香港', city: '香港', isp: 'HKBN', status: 'online', bandwidth: 312, capacity: 500, cpu: 29, mem: 47, uptime: '100%' },
  { id: 'n007', name: '新加坡-SG-01', ip: '128.199.22.77', region: '亚太', city: '新加坡', isp: 'Singtel', status: 'online', bandwidth: 201, capacity: 500, cpu: 33, mem: 52, uptime: '99.97%' },
  { id: 'n008', name: '美西-LA-01', ip: '23.224.33.88', region: '欧美', city: '洛杉矶', isp: 'Cogent', status: 'offline', bandwidth: 0, capacity: 500, cpu: 0, mem: 0, uptime: '98.12%' },
]

// Mock DNS规则
export const MOCK_DNS_RULES = [
  { id: 'd001', name: '中国大陆-电信', match: 'CN-Telecom', nodeGroup: '华东电信组', weight: 100, ttl: 60, status: 'active' },
  { id: 'd002', name: '中国大陆-联通', match: 'CN-Unicom', nodeGroup: '华东联通组', weight: 100, ttl: 60, status: 'active' },
  { id: 'd003', name: '中国大陆-移动', match: 'CN-Mobile', nodeGroup: '华南移动组', weight: 100, ttl: 60, status: 'active' },
  { id: 'd004', name: '香港/澳门/台湾', match: 'HK/MO/TW', nodeGroup: '香港节点组', weight: 100, ttl: 30, status: 'active' },
  { id: 'd005', name: '亚太地区', match: 'APAC', nodeGroup: '新加坡节点组', weight: 80, ttl: 60, status: 'active' },
  { id: 'd006', name: '欧美地区', match: 'NA/EU', nodeGroup: '美西节点组', weight: 60, ttl: 120, status: 'inactive' },
]

// Mock待审核域名
export const MOCK_PENDING_DOMAINS = [
  { id: 'dr001', domain: 'video.newstream.cn', customer: '张三 / 北京科技', type: '视频点播', icp: '京ICP备2024001234号', submitted: '2026-02-26 09:12:33', status: 'pending' },
  { id: 'dr002', domain: 'api.fastgame.io', customer: '赵六 / 深圳游戏科技', type: '动态加速', icp: '粤ICP备2023005678号', submitted: '2026-02-26 08:44:01', status: 'pending' },
  { id: 'dr003', domain: 'img.shopfast.cn', customer: '李四 / 上海电商集团', type: '静态文件', icp: '沪ICP备2022009012号', submitted: '2026-02-25 22:30:15', status: 'reviewing' },
  { id: 'dr004', domain: 'cdn.badsite.xyz', customer: '匿名用户', type: '静态文件', icp: '未备案', submitted: '2026-02-25 20:11:44', status: 'pending' },
  { id: 'dr005', domain: 'files.edufast.cn', customer: '钱七 / 杭州教育平台', type: '下载加速', icp: '浙ICP备2025003456号', submitted: '2026-02-25 18:55:22', status: 'pending' },
]

// Mock工单
export const MOCK_TICKETS = [
  { id: 't001', subject: '域名解析不生效，已等待2小时', customer: '张三', priority: 'high', status: 'open', created: '2026-02-26 14:23', assigned: '客服小王' },
  { id: 't002', subject: '缓存刷新接口报错 500', customer: '赵六', priority: 'urgent', status: 'open', created: '2026-02-26 13:45', assigned: '未分配' },
  { id: 't003', subject: '申请开具增值税发票', customer: '李四', priority: 'low', status: 'pending', created: '2026-02-26 11:20', assigned: '财务小张' },
  { id: 't004', subject: '带宽告警频繁触发，需调整阈值', customer: '孙八', priority: 'medium', status: 'resolved', created: '2026-02-25 16:30', assigned: '客服小王' },
  { id: 't005', subject: 'SSL证书申请失败', customer: '钱七', priority: 'high', status: 'open', created: '2026-02-25 09:12', assigned: '技术小李' },
]

// Mock财务数据
export const MOCK_FINANCE = {
  today: { revenue: 18420, transactions: 34 },
  month: { revenue: 284600, target: 300000 },
  year: { revenue: 1840000 },
  pending: { amount: 42300, count: 8 },
}

// 状态Badge HTML
export function statusBadge(status: string): string {
  const map: Record<string, [string, string]> = {
    active:    ['badge-success', '正常'],
    online:    ['badge-success', '在线'],
    suspended: ['badge-danger',  '已封禁'],
    offline:   ['badge-gray',    '离线'],
    warning:   ['badge-warning', '告警'],
    pending:   ['badge-info',    '待处理'],
    reviewing: ['badge-warning', '审核中'],
    open:      ['badge-danger',  '待处理'],
    resolved:  ['badge-success', '已解决'],
    inactive:  ['badge-gray',    '未启用'],
    free:      ['badge-gray',    '免费版'],
    pro:       ['badge-info',    '专业版'],
    enterprise:['badge-purple',  '企业版'],
    high:      ['badge-warning', '高'],
    urgent:    ['badge-danger',  '紧急'],
    medium:    ['badge-info',    '中'],
    low:       ['badge-gray',    '低'],
  }
  const [cls, label] = map[status] || ['badge-gray', status]
  return `<span class="badge ${cls}"><span class="dot"></span>${label}</span>`
}

// 通用Toast脚本
export const TOAST_SCRIPT = `
<div id="toast" style="position:fixed;bottom:24px;right:24px;background:var(--dark-2);border:1px solid var(--success);color:var(--success);padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;z-index:9999;transform:translateY(100px);transition:transform 0.3s;display:flex;align-items:center;gap:8px;max-width:360px">
  <i class="fas fa-circle-check"></i><span id="toastMsg"></span>
</div>
<script>
function showToast(msg, type) {
  const t = document.getElementById('toast');
  const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--secondary)' };
  t.style.borderColor = colors[type||'success'];
  t.style.color = colors[type||'success'];
  document.getElementById('toastMsg').textContent = msg;
  t.style.transform = 'translateY(0)';
  setTimeout(() => t.style.transform = 'translateY(100px)', 3500);
}
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
</script>`
