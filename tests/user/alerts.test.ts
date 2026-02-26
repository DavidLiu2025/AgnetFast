import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { alertsRoute } from '../../src/routes/user/alerts'

const app = new Hono()
app.route('/', alertsRoute)

describe('M2 告警配置模块', () => {
  describe('GET /alerts', () => {
    it('返回200状态码', async () => {
      const res = await app.request('/alerts')
      expect(res.status).toBe(200)
    })

    it('Content-Type为text/html', async () => {
      const res = await app.request('/alerts')
      expect(res.headers.get('content-type')).toContain('text/html')
    })

    it('包含"告警配置"标题', async () => {
      const res = await app.request('/alerts')
      const html = await res.text()
      expect(html).toContain('告警配置')
    })

    it('包含告警规则列表', async () => {
      const res = await app.request('/alerts')
      const html = await res.text()
      expect(html).toContain('告警规则')
    })

    it('包含带宽阈值配置', async () => {
      const res = await app.request('/alerts')
      const html = await res.text()
      expect(html).toContain('带宽')
    })

    it('包含错误率告警', async () => {
      const res = await app.request('/alerts')
      const html = await res.text()
      expect(html).toContain('错误率')
    })

    it('包含通知渠道配置', async () => {
      const res = await app.request('/alerts')
      const html = await res.text()
      expect(html).toContain('通知')
    })

    it('包含告警历史记录', async () => {
      const res = await app.request('/alerts')
      const html = await res.text()
      expect(html).toContain('告警历史')
    })
  })

  describe('POST /api/alerts/rules', () => {
    it('有效请求返回201', async () => {
      const res = await app.request('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '带宽超限告警',
          metric: 'bandwidth',
          threshold: 500,
          operator: 'gt',
          domain: 'all',
          channels: ['email'],
        }),
      })
      expect(res.status).toBe(201)
    })

    it('缺少name字段返回400', async () => {
      const res = await app.request('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'bandwidth', threshold: 500 }),
      })
      expect(res.status).toBe(400)
    })

    it('缺少threshold字段返回400', async () => {
      const res = await app.request('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '测试', metric: 'bandwidth' }),
      })
      expect(res.status).toBe(400)
    })

    it('返回JSON包含id和name', async () => {
      const res = await app.request('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '测试告警', metric: 'error_rate', threshold: 5, operator: 'gt', domain: 'all', channels: ['email'] }),
      })
      const json = await res.json() as any
      expect(json).toHaveProperty('id')
      expect(json).toHaveProperty('name', '测试告警')
    })
  })

  describe('PUT /api/alerts/rules/:id/toggle', () => {
    it('切换启用状态返回200', async () => {
      const res = await app.request('/api/alerts/rules/rule-001/toggle', {
        method: 'PUT',
      })
      expect(res.status).toBe(200)
    })

    it('返回JSON包含enabled字段', async () => {
      const res = await app.request('/api/alerts/rules/rule-001/toggle', {
        method: 'PUT',
      })
      const json = await res.json() as any
      expect(json).toHaveProperty('enabled')
    })
  })

  describe('DELETE /api/alerts/rules/:id', () => {
    it('删除告警规则返回200', async () => {
      const res = await app.request('/api/alerts/rules/rule-001', {
        method: 'DELETE',
      })
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/alerts/history', () => {
    it('返回200和JSON数组', async () => {
      const res = await app.request('/api/alerts/history')
      expect(res.status).toBe(200)
      const json = await res.json() as any
      expect(Array.isArray(json)).toBe(true)
    })

    it('按domain参数过滤', async () => {
      const res = await app.request('/api/alerts/history?domain=example.com')
      expect(res.status).toBe(200)
    })

    it('每条记录包含必要字段', async () => {
      const res = await app.request('/api/alerts/history')
      const json = await res.json() as any
      if (json.length > 0) {
        expect(json[0]).toHaveProperty('id')
        expect(json[0]).toHaveProperty('level')
        expect(json[0]).toHaveProperty('message')
        expect(json[0]).toHaveProperty('time')
      }
    })
  })
})
