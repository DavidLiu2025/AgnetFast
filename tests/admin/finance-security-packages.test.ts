/**
 * Task 3 - M14 财务深化 + M15 安全深化 + M16 套餐深化 测试
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import adminRouter from '../../src/routes/admin/index'

const app = new Hono()
app.route('/admin', adminRouter)

// ─── M14: 财务管理深化 ────────────────────────────────────────────────────────
describe('M14 财务管理深化', () => {
  it('GET /admin/api/finance/overview 返回财务概览', async () => {
    const res = await app.request('/admin/api/finance/overview')
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(data).toHaveProperty('today')
    expect(data).toHaveProperty('month')
    expect(data).toHaveProperty('year')
  })

  it('overview包含收入和交易笔数', async () => {
    const res = await app.request('/admin/api/finance/overview')
    const data = await res.json() as any
    expect(data.today).toHaveProperty('revenue')
    expect(data.today).toHaveProperty('transactions')
    expect(typeof data.today.revenue).toBe('number')
  })

  it('GET /admin/api/finance/invoices 返回账单列表', async () => {
    const res = await app.request('/admin/api/finance/invoices')
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(Array.isArray(data.invoices)).toBe(true)
  })

  it('账单包含客户、金额、状态字段', async () => {
    const res = await app.request('/admin/api/finance/invoices')
    const data = await res.json() as any
    const inv = data.invoices[0]
    expect(inv).toHaveProperty('id')
    expect(inv).toHaveProperty('customer')
    expect(inv).toHaveProperty('amount')
    expect(inv).toHaveProperty('status')
  })

  it('GET /admin/api/finance/trend 返回月度趋势', async () => {
    const res = await app.request('/admin/api/finance/trend')
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(Array.isArray(data.months)).toBe(true)
    expect(data.months.length).toBeGreaterThanOrEqual(6)
  })

  it('财务页面包含图表', async () => {
    const res = await app.request('/admin/finance')
    const html = await res.text()
    expect(html).toContain('revenueChart')
    expect(html).toContain('monthChart')
  })
})

// ─── M15: 安全管理深化 ────────────────────────────────────────────────────────
describe('M15 安全管理深化', () => {
  it('GET /admin/api/security/overview 返回安全概览', async () => {
    const res = await app.request('/admin/api/security/overview')
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(data).toHaveProperty('blockedToday')
    expect(data).toHaveProperty('activeDDoS')
    expect(data).toHaveProperty('blacklistCount')
  })

  it('GET /admin/api/security/events 返回攻击事件列表', async () => {
    const res = await app.request('/admin/api/security/events')
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(Array.isArray(data.events)).toBe(true)
  })

  it('攻击事件包含必要字段', async () => {
    const res = await app.request('/admin/api/security/events')
    const data = await res.json() as any
    const evt = data.events[0]
    expect(evt).toHaveProperty('time')
    expect(evt).toHaveProperty('ip')
    expect(evt).toHaveProperty('type')
    expect(evt).toHaveProperty('action')
  })

  it('POST /admin/api/security/blacklist 加入黑名单', async () => {
    const res = await app.request('/admin/api/security/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: '192.168.1.100', reason: '恶意扫描' })
    })
    expect(res.status).toBe(201)
    const data = await res.json() as any
    expect(data.success).toBe(true)
    expect(data.ip).toBe('192.168.1.100')
  })

  it('POST blacklist 缺ip返回400', async () => {
    const res = await app.request('/admin/api/security/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: '测试' })
    })
    expect(res.status).toBe(400)
  })

  it('安全页面包含DDoS图表', async () => {
    const res = await app.request('/admin/security')
    const html = await res.text()
    expect(html).toContain('ddosChart')
  })

  it('安全页面包含WAF规则列表', async () => {
    const res = await app.request('/admin/security')
    const html = await res.text()
    expect(html).toContain('WAF')
    expect(html).toContain('SQL注入防护')
  })
})

// ─── M16: 套餐管理深化 ────────────────────────────────────────────────────────
describe('M16 套餐管理深化', () => {
  it('GET /admin/api/packages 返回套餐列表', async () => {
    const res = await app.request('/admin/api/packages')
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(Array.isArray(data.packages)).toBe(true)
    expect(data.packages.length).toBeGreaterThan(0)
  })

  it('套餐包含必要字段', async () => {
    const res = await app.request('/admin/api/packages')
    const data = await res.json() as any
    const pkg = data.packages[0]
    expect(pkg).toHaveProperty('id')
    expect(pkg).toHaveProperty('name')
    expect(pkg).toHaveProperty('price')
    expect(pkg).toHaveProperty('users')
    expect(pkg).toHaveProperty('status')
  })

  it('POST /admin/api/packages 创建套餐', async () => {
    const res = await app.request('/admin/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试套餐', price: 99, traffic: '100GB', domains: 3 })
    })
    expect(res.status).toBe(201)
    const data = await res.json() as any
    expect(data.name).toBe('测试套餐')
    expect(data.id).toBeTruthy()
  })

  it('POST 缺name返回400', async () => {
    const res = await app.request('/admin/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 99 })
    })
    expect(res.status).toBe(400)
  })

  it('PUT /admin/api/packages/:id 更新套餐', async () => {
    const res = await app.request('/admin/api/packages/p001', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 399 })
    })
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(data.success).toBe(true)
  })

  it('套餐页面渲染', async () => {
    const res = await app.request('/admin/packages')
    const html = await res.text()
    expect(html).toContain('套餐管理')
    expect(html).toContain('专业版 Pro')
  })
})
