/**
 * Task 3 - M12 DNS调度深化 + M13 域名审核完整化 测试
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import adminRouter from '../../src/routes/admin/index'

const app = new Hono()
app.route('/admin', adminRouter)

// ─── M12: DNS 调度深化 ────────────────────────────────────────────────────────
describe('M12 DNS调度深化', () => {
  describe('规则CRUD', () => {
    it('GET /admin/api/dns-rules 返回规则列表', async () => {
      const res = await app.request('/admin/api/dns-rules')
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(Array.isArray(data.rules)).toBe(true)
      expect(data.rules.length).toBeGreaterThan(0)
    })

    it('规则包含必要字段', async () => {
      const res = await app.request('/admin/api/dns-rules')
      const data = await res.json() as any
      const rule = data.rules[0]
      expect(rule).toHaveProperty('id')
      expect(rule).toHaveProperty('name')
      expect(rule).toHaveProperty('match')
      expect(rule).toHaveProperty('nodeGroup')
      expect(rule).toHaveProperty('weight')
      expect(rule).toHaveProperty('ttl')
      expect(rule).toHaveProperty('status')
    })

    it('POST /admin/api/dns-rules 创建规则', async () => {
      const res = await app.request('/admin/api/dns-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '测试区域', match: 'TEST', nodeGroup: '测试组', weight: 80, ttl: 60 })
      })
      expect(res.status).toBe(201)
      const data = await res.json() as any
      expect(data.id).toBeTruthy()
      expect(data.name).toBe('测试区域')
    })

    it('POST 缺name返回400', async () => {
      const res = await app.request('/admin/api/dns-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match: 'TEST', nodeGroup: '测试组' })
      })
      expect(res.status).toBe(400)
    })

    it('PUT /admin/api/dns-rules/:id 更新规则', async () => {
      const res = await app.request('/admin/api/dns-rules/d001', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: 90, ttl: 30 })
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
    })

    it('PUT 不存在的规则返回404', async () => {
      const res = await app.request('/admin/api/dns-rules/not-exist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: 90 })
      })
      expect(res.status).toBe(404)
    })

    it('PATCH /admin/api/dns-rules/:id/toggle 切换状态', async () => {
      const res = await app.request('/admin/api/dns-rules/d001/toggle', {
        method: 'PATCH'
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(['active', 'inactive']).toContain(data.status)
    })
  })

  describe('健康检查', () => {
    it('GET /admin/api/dns/health 返回健康状态', async () => {
      const res = await app.request('/admin/api/dns/health')
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(Array.isArray(data.nodes)).toBe(true)
    })

    it('健康检查数据包含节点和延迟', async () => {
      const res = await app.request('/admin/api/dns/health')
      const data = await res.json() as any
      const node = data.nodes[0]
      expect(node).toHaveProperty('name')
      expect(node).toHaveProperty('status')
      expect(node).toHaveProperty('latency')
    })
  })

  describe('DNS页面渲染', () => {
    it('GET /admin/dns 返回200', async () => {
      const res = await app.request('/admin/dns')
      expect(res.status).toBe(200)
    })

    it('DNS页面包含GSLB规则列表', async () => {
      const res = await app.request('/admin/dns')
      const html = await res.text()
      expect(html).toContain('GSLB')
      expect(html).toContain('CN-Telecom')
    })

    it('DNS页面包含健康检查状态区块', async () => {
      const res = await app.request('/admin/dns')
      const html = await res.text()
      expect(html).toContain('健康检查')
    })
  })
})

// ─── M13: 域名审核完整化 ──────────────────────────────────────────────────────
describe('M13 域名审核完整化', () => {
  describe('审核操作API', () => {
    it('GET /admin/api/domains/review 返回审核列表', async () => {
      const res = await app.request('/admin/api/domains/review')
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(Array.isArray(data.domains)).toBe(true)
      expect(data.domains.length).toBeGreaterThan(0)
    })

    it('审核记录包含必要字段', async () => {
      const res = await app.request('/admin/api/domains/review')
      const data = await res.json() as any
      const d = data.domains[0]
      expect(d).toHaveProperty('id')
      expect(d).toHaveProperty('domain')
      expect(d).toHaveProperty('customer')
      expect(d).toHaveProperty('icp')
      expect(d).toHaveProperty('status')
    })

    it('POST approve 返回approved状态', async () => {
      const res = await app.request('/admin/api/domains/review/dr001/approve', {
        method: 'POST'
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(data.status).toBe('approved')
    })

    it('POST reject 需要reason字段', async () => {
      const res = await app.request('/admin/api/domains/review/dr002/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '未提供ICP备案号' })
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(data.reason).toBe('未提供ICP备案号')
    })

    it('POST reject 缺reason返回400', async () => {
      const res = await app.request('/admin/api/domains/review/dr003/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      expect(res.status).toBe(400)
    })

    it('统计：GET /admin/api/domains/review/stats', async () => {
      const res = await app.request('/admin/api/domains/review/stats')
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data).toHaveProperty('pending')
      expect(data).toHaveProperty('approved')
      expect(data).toHaveProperty('rejected')
      expect(data).toHaveProperty('reviewing')
    })
  })

  describe('域名审核页面', () => {
    it('GET /admin/domains/review 返回200', async () => {
      const res = await app.request('/admin/domains/review')
      expect(res.status).toBe(200)
    })

    it('页面包含ICP备案标注', async () => {
      const res = await app.request('/admin/domains/review')
      const html = await res.text()
      expect(html).toMatch(/ICP|备案/)
    })

    it('页面包含审核操作按钮', async () => {
      const res = await app.request('/admin/domains/review')
      const html = await res.text()
      expect(html).toContain('approveDomain')
      expect(html).toContain('rejectDomain')
    })

    it('未备案域名有警告提示', async () => {
      const res = await app.request('/admin/domains/review')
      const html = await res.text()
      expect(html).toContain('未备案')
    })
  })
})
