/**
 * M8 运营后台框架测试
 * 验证：后台路由可访问、导航结构、布局渲染
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import adminRouter from '../../src/routes/admin/index'

const app = new Hono()
app.route('/admin', adminRouter)

describe('M8 运营后台框架', () => {
  describe('路由可达性', () => {
    it('GET /admin 重定向或返回后台首页', async () => {
      const res = await app.request('/admin')
      expect([200, 301, 302]).toContain(res.status)
    })

    it('GET /admin/dashboard 返回200', async () => {
      const res = await app.request('/admin/dashboard')
      expect(res.status).toBe(200)
    })

    it('GET /admin/customers 返回200', async () => {
      const res = await app.request('/admin/customers')
      expect(res.status).toBe(200)
    })

    it('GET /admin/nodes 返回200', async () => {
      const res = await app.request('/admin/nodes')
      expect(res.status).toBe(200)
    })

    it('GET /admin/dns 返回200', async () => {
      const res = await app.request('/admin/dns')
      expect(res.status).toBe(200)
    })

    it('GET /admin/scheduling 返回200', async () => {
      const res = await app.request('/admin/scheduling')
      expect(res.status).toBe(200)
    })

    it('GET /admin/domains/review 返回200', async () => {
      const res = await app.request('/admin/domains/review')
      expect(res.status).toBe(200)
    })

    it('GET /admin/finance 返回200', async () => {
      const res = await app.request('/admin/finance')
      expect(res.status).toBe(200)
    })

    it('GET /admin/security 返回200', async () => {
      const res = await app.request('/admin/security')
      expect(res.status).toBe(200)
    })

    it('GET /admin/packages 返回200', async () => {
      const res = await app.request('/admin/packages')
      expect(res.status).toBe(200)
    })

    it('GET /admin/tickets 返回200', async () => {
      const res = await app.request('/admin/tickets')
      expect(res.status).toBe(200)
    })

    it('GET /admin/audit-logs 返回200', async () => {
      const res = await app.request('/admin/audit-logs')
      expect(res.status).toBe(200)
    })

    it('GET /admin/settings 返回200', async () => {
      const res = await app.request('/admin/settings')
      expect(res.status).toBe(200)
    })
  })

  describe('后台布局结构', () => {
    it('dashboard页包含后台导航侧边栏', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      expect(html).toContain('admin-sidebar')
    })

    it('dashboard页包含顶部导航栏', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      expect(html).toContain('admin-topbar')
    })

    it('侧边栏包含所有核心导航项', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      // 核心导航项
      expect(html).toContain('/admin/dashboard')
      expect(html).toContain('/admin/customers')
      expect(html).toContain('/admin/nodes')
      expect(html).toContain('/admin/dns')
      expect(html).toContain('/admin/finance')
      expect(html).toContain('/admin/security')
    })

    it('页面标题包含AgentFast运营后台', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      expect(html).toContain('AgentFast')
      expect(html).toMatch(/运营后台|Admin|后台管理/)
    })

    it('dashboard导航项有active样式', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      // 当前页导航项应标记为active: <a href="/admin/dashboard" class="nav-item active">
      expect(html).toMatch(/href="\/admin\/dashboard"[^>]*class="[^"]*active/)
    })
  })

  describe('后台API端点', () => {
    it('GET /admin/api/stats 返回运营统计数据', async () => {
      const res = await app.request('/admin/api/stats')
      expect(res.status).toBe(200)
      const data = await res.json() as Record<string, unknown>
      expect(data).toHaveProperty('totalCustomers')
      expect(data).toHaveProperty('totalNodes')
      expect(data).toHaveProperty('totalBandwidth')
      expect(data).toHaveProperty('totalRevenue')
    })

    it('stats数据格式正确', async () => {
      const res = await app.request('/admin/api/stats')
      const data = await res.json() as Record<string, unknown>
      expect(typeof data.totalCustomers).toBe('number')
      expect(typeof data.totalNodes).toBe('number')
      expect((data.totalCustomers as number)).toBeGreaterThan(0)
      expect((data.totalNodes as number)).toBeGreaterThan(0)
    })
  })
})
