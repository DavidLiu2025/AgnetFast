/**
 * M18 审计日志API + M19 系统配置API 测试
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import adminRouter from '../../src/routes/admin/index'

const app = new Hono()
app.route('/admin', adminRouter)

// ─── M18: 审计日志 ────────────────────────────────────────────────────────────
describe('M18 审计日志', () => {
  it('GET /admin/audit-logs 页面正常渲染', async () => {
    const res = await app.request('/admin/audit-logs')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('审计')
  })

  it('GET /admin/api/audit-logs 返回日志列表', async () => {
    const res = await app.request('/admin/api/audit-logs')
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json).toHaveProperty('logs')
    expect(Array.isArray(json.logs)).toBe(true)
    expect(json).toHaveProperty('total')
    expect(json.total).toBeGreaterThan(0)
  })

  it('审计日志条目包含必填字段', async () => {
    const res = await app.request('/admin/api/audit-logs')
    const json = await res.json() as any
    const log = json.logs[0]
    expect(log).toHaveProperty('id')
    expect(log).toHaveProperty('operator')
    expect(log).toHaveProperty('action')
    expect(log).toHaveProperty('resource')
    expect(log).toHaveProperty('ip')
    expect(log).toHaveProperty('createdAt')
  })

  it('GET /admin/api/audit-logs?action=login 按操作类型过滤', async () => {
    const res = await app.request('/admin/api/audit-logs?action=login')
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(Array.isArray(json.logs)).toBe(true)
    // 所有返回结果的action应该是login
    json.logs.forEach((log: any) => {
      expect(log.action).toBe('login')
    })
  })

  it('GET /admin/api/audit-logs?operator=admin 按操作人过滤', async () => {
    const res = await app.request('/admin/api/audit-logs?operator=admin')
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(Array.isArray(json.logs)).toBe(true)
  })

  it('GET /admin/api/audit-logs?page=1&limit=5 分页正常', async () => {
    const res = await app.request('/admin/api/audit-logs?page=1&limit=5')
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.logs.length).toBeLessThanOrEqual(5)
    expect(json).toHaveProperty('page')
    expect(json).toHaveProperty('limit')
  })

  it('GET /admin/api/audit-logs/export 导出CSV格式', async () => {
    const res = await app.request('/admin/api/audit-logs/export')
    expect(res.status).toBe(200)
    const ct = res.headers.get('content-type') || ''
    expect(ct).toMatch(/csv|text/)
  })
})

// ─── M19: 系统配置 ────────────────────────────────────────────────────────────
describe('M19 系统配置', () => {
  it('GET /admin/settings 页面正常渲染', async () => {
    const res = await app.request('/admin/settings')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('系统配置')
  })

  it('GET /admin/api/settings 返回系统配置', async () => {
    const res = await app.request('/admin/api/settings')
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json).toHaveProperty('settings')
    expect(json.settings).toHaveProperty('smtp')
    expect(json.settings).toHaveProperty('security')
    expect(json.settings).toHaveProperty('platform')
  })

  it('PUT /admin/api/settings/platform 更新平台配置', async () => {
    const res = await app.request('/admin/api/settings/platform', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName: 'AgentFast CDN Pro', maxDomains: 20 }),
    })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.success).toBe(true)
    expect(json.settings).toHaveProperty('siteName', 'AgentFast CDN Pro')
  })

  it('PUT /admin/api/settings/smtp 更新SMTP配置', async () => {
    const res = await app.request('/admin/api/settings/smtp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'smtp.example.com',
        port: 465,
        user: 'no-reply@example.com',
        secure: true,
      }),
    })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.success).toBe(true)
  })

  it('PUT /admin/api/settings/smtp 缺少host返回400', async () => {
    const res = await app.request('/admin/api/settings/smtp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port: 465 }), // 缺少host
    })
    expect(res.status).toBe(400)
  })

  it('POST /admin/api/settings/smtp/test 测试SMTP连接', async () => {
    const res = await app.request('/admin/api/settings/smtp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'test@example.com' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json).toHaveProperty('success')
    expect(json).toHaveProperty('message')
  })

  it('PUT /admin/api/settings/security 更新安全配置', async () => {
    const res = await app.request('/admin/api/settings/security', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxLoginAttempts: 5, sessionTimeout: 3600 }),
    })
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.success).toBe(true)
  })
})
