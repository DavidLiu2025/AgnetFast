/**
 * M9 运营后台Dashboard + M10 客户管理 + M11 节点管理 测试
 * 验证API数据正确性、业务逻辑、边界条件
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import adminRouter from '../../src/routes/admin/index'

const app = new Hono()
app.route('/admin', adminRouter)

// ─── M9: Dashboard API ────────────────────────────────────────────────────────
describe('M9 运营后台Dashboard', () => {
  describe('GET /admin/api/stats - 运营指标', () => {
    it('包含6个核心指标字段', async () => {
      const res = await app.request('/admin/api/stats')
      const data = await res.json() as Record<string, unknown>
      expect(data).toHaveProperty('totalCustomers')
      expect(data).toHaveProperty('totalNodes')
      expect(data).toHaveProperty('onlineNodes')
      expect(data).toHaveProperty('totalBandwidth')
      expect(data).toHaveProperty('totalRevenue')
      expect(data).toHaveProperty('pendingTickets')
    })

    it('在线节点数 <= 总节点数', async () => {
      const res = await app.request('/admin/api/stats')
      const data = await res.json() as any
      expect(data.onlineNodes).toBeLessThanOrEqual(data.totalNodes)
    })

    it('带宽值为非负数', async () => {
      const res = await app.request('/admin/api/stats')
      const data = await res.json() as any
      expect(data.totalBandwidth).toBeGreaterThanOrEqual(0)
    })

    it('待处理工单数为非负整数', async () => {
      const res = await app.request('/admin/api/stats')
      const data = await res.json() as any
      expect(data.pendingTickets).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(data.pendingTickets)).toBe(true)
    })

    it('dashboard页面渲染KPI卡片', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      expect(html).toContain('stat-card')
      expect(html).toContain('总客户数')
      expect(html).toContain('在线节点')
      expect(html).toContain('当前总带宽')
      expect(html).toContain('本月营收')
    })

    it('dashboard页面渲染待处理事项', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      expect(html).toContain('待处理事项')
      expect(html).toContain('待回复工单')
      expect(html).toContain('待审核域名')
    })

    it('dashboard页面包含带宽图表', async () => {
      const res = await app.request('/admin/dashboard')
      const html = await res.text()
      expect(html).toContain('adminBwChart')
      expect(html).toContain('Chart')
    })
  })
})

// ─── M10: 客户管理 ─────────────────────────────────────────────────────────────
describe('M10 客户管理', () => {
  describe('GET /admin/api/customers', () => {
    it('返回200', async () => {
      const res = await app.request('/admin/api/customers')
      expect(res.status).toBe(200)
    })

    it('包含customers数组和total', async () => {
      const res = await app.request('/admin/api/customers')
      const data = await res.json() as any
      expect(Array.isArray(data.customers)).toBe(true)
      expect(typeof data.total).toBe('number')
    })

    it('客户记录包含必要字段', async () => {
      const res = await app.request('/admin/api/customers')
      const data = await res.json() as any
      const c = data.customers[0]
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('email')
      expect(c).toHaveProperty('plan')
      expect(c).toHaveProperty('status')
    })

    it('total等于customers数组长度', async () => {
      const res = await app.request('/admin/api/customers')
      const data = await res.json() as any
      expect(data.total).toBe(data.customers.length)
    })
  })

  describe('POST /admin/api/customers/:id/suspend', () => {
    it('封禁存在的客户返回success', async () => {
      const res = await app.request('/admin/api/customers/c001/suspend', {
        method: 'POST'
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(data.status).toBe('suspended')
    })

    it('封禁不存在的客户返回404', async () => {
      const res = await app.request('/admin/api/customers/not-exist/suspend', {
        method: 'POST'
      })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /admin/api/customers/:id/activate', () => {
    it('恢复存在的客户返回success', async () => {
      const res = await app.request('/admin/api/customers/c003/activate', {
        method: 'POST'
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(data.status).toBe('active')
    })

    it('恢复不存在的客户返回404', async () => {
      const res = await app.request('/admin/api/customers/not-exist/activate', {
        method: 'POST'
      })
      expect(res.status).toBe(404)
    })
  })

  describe('客户管理页面', () => {
    it('渲染客户列表表格', async () => {
      const res = await app.request('/admin/customers')
      const html = await res.text()
      expect(html).toContain('customersTable')
      expect(html).toContain('北京科技有限公司')
    })

    it('包含封禁和恢复操作按钮', async () => {
      const res = await app.request('/admin/customers')
      const html = await res.text()
      expect(html).toContain('suspendCustomer')
      expect(html).toContain('activateCustomer')
    })

    it('包含搜索过滤功能', async () => {
      const res = await app.request('/admin/customers')
      const html = await res.text()
      expect(html).toContain('filterCustomers')
    })
  })
})

// ─── M11: 节点管理 ─────────────────────────────────────────────────────────────
describe('M11 节点管理', () => {
  describe('GET /admin/api/nodes', () => {
    it('返回200', async () => {
      const res = await app.request('/admin/api/nodes')
      expect(res.status).toBe(200)
    })

    it('包含nodes数组和total', async () => {
      const res = await app.request('/admin/api/nodes')
      const data = await res.json() as any
      expect(Array.isArray(data.nodes)).toBe(true)
      expect(typeof data.total).toBe('number')
    })

    it('节点记录包含必要字段', async () => {
      const res = await app.request('/admin/api/nodes')
      const data = await res.json() as any
      const n = data.nodes[0]
      expect(n).toHaveProperty('id')
      expect(n).toHaveProperty('name')
      expect(n).toHaveProperty('ip')
      expect(n).toHaveProperty('status')
      expect(n).toHaveProperty('bandwidth')
      expect(n).toHaveProperty('cpu')
      expect(n).toHaveProperty('mem')
    })

    it('所有节点bandwidth >= 0', async () => {
      const res = await app.request('/admin/api/nodes')
      const data = await res.json() as any
      data.nodes.forEach((n: any) => {
        expect(n.bandwidth).toBeGreaterThanOrEqual(0)
      })
    })

    it('所有节点CPU在0-100范围内', async () => {
      const res = await app.request('/admin/api/nodes')
      const data = await res.json() as any
      data.nodes.forEach((n: any) => {
        expect(n.cpu).toBeGreaterThanOrEqual(0)
        expect(n.cpu).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('POST /admin/api/nodes/:id/online|offline', () => {
    it('下线节点返回success + status=offline', async () => {
      const res = await app.request('/admin/api/nodes/n001/offline', {
        method: 'POST'
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(data.status).toBe('offline')
    })

    it('上线节点返回success + status=online', async () => {
      const res = await app.request('/admin/api/nodes/n008/online', {
        method: 'POST'
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
      expect(data.status).toBe('online')
    })
  })

  describe('节点管理页面', () => {
    it('渲染节点状态表格', async () => {
      const res = await app.request('/admin/nodes')
      const html = await res.text()
      expect(html).toContain('华东-上海-01')
      expect(html).toContain('IP地址')
    })

    it('包含CPU告警颜色逻辑', async () => {
      const res = await app.request('/admin/nodes')
      const html = await res.text()
      // 高CPU节点应用红色
      expect(html).toContain('#ef4444')
    })

    it('包含上下线操作函数', async () => {
      const res = await app.request('/admin/nodes')
      const html = await res.text()
      expect(html).toContain('nodeOffline')
      expect(html).toContain('nodeOnline')
    })
  })
})
