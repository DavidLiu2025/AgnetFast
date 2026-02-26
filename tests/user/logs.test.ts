import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { logsRoute } from '../../src/routes/user/logs'

const app = new Hono()
app.route('/', logsRoute)

describe('M3 实时日志模块', () => {
  describe('GET /logs', () => {
    it('返回200状态码', async () => {
      const res = await app.request('/logs')
      expect(res.status).toBe(200)
    })

    it('Content-Type为text/html', async () => {
      const res = await app.request('/logs')
      expect(res.headers.get('content-type')).toContain('text/html')
    })

    it('包含"实时日志"标题', async () => {
      const res = await app.request('/logs')
      const html = await res.text()
      expect(html).toContain('实时日志')
    })

    it('包含日志列表区域', async () => {
      const res = await app.request('/logs')
      const html = await res.text()
      expect(html).toContain('日志')
    })

    it('包含域名筛选器', async () => {
      const res = await app.request('/logs')
      const html = await res.text()
      expect(html).toContain('域名')
    })

    it('包含状态码筛选', async () => {
      const res = await app.request('/logs')
      const html = await res.text()
      expect(html).toContain('状态码')
    })

    it('包含日志下载入口', async () => {
      const res = await app.request('/logs')
      const html = await res.text()
      expect(html).toContain('下载')
    })
  })

  describe('GET /api/logs', () => {
    it('返回200和JSON数组', async () => {
      const res = await app.request('/api/logs')
      expect(res.status).toBe(200)
      const json = await res.json() as any
      expect(Array.isArray(json)).toBe(true)
    })

    it('默认返回至少10条记录', async () => {
      const res = await app.request('/api/logs')
      const json = await res.json() as any
      expect(json.length).toBeGreaterThanOrEqual(10)
    })

    it('每条日志包含必要字段', async () => {
      const res = await app.request('/api/logs')
      const json = await res.json() as any
      const log = json[0]
      expect(log).toHaveProperty('time')
      expect(log).toHaveProperty('ip')
      expect(log).toHaveProperty('method')
      expect(log).toHaveProperty('url')
      expect(log).toHaveProperty('status')
      expect(log).toHaveProperty('size')
      expect(log).toHaveProperty('duration')
    })

    it('支持domain参数过滤', async () => {
      const res = await app.request('/api/logs?domain=cdn.shopxyz.cn')
      expect(res.status).toBe(200)
      const json = await res.json() as any
      expect(Array.isArray(json)).toBe(true)
    })

    it('支持status参数过滤', async () => {
      const res = await app.request('/api/logs?status=404')
      expect(res.status).toBe(200)
      const json = await res.json() as any
      // 过滤后每条status均为404
      json.forEach((log: any) => expect(log.status).toBe(404))
    })

    it('支持page分页参数', async () => {
      const res1 = await app.request('/api/logs?page=1')
      const res2 = await app.request('/api/logs?page=2')
      expect(res1.status).toBe(200)
      expect(res2.status).toBe(200)
    })

    it('limit参数限制返回数量', async () => {
      const res = await app.request('/api/logs?limit=5')
      const json = await res.json() as any
      expect(json.length).toBeLessThanOrEqual(5)
    })
  })

  describe('GET /api/logs/download', () => {
    it('返回200', async () => {
      const res = await app.request('/api/logs/download?domain=example.com&date=2026-02-26')
      expect(res.status).toBe(200)
    })

    it('返回JSON包含download_url', async () => {
      const res = await app.request('/api/logs/download?domain=example.com&date=2026-02-26')
      const json = await res.json() as any
      expect(json).toHaveProperty('download_url')
    })

    it('缺少domain参数返回400', async () => {
      const res = await app.request('/api/logs/download?date=2026-02-26')
      expect(res.status).toBe(400)
    })
  })
})
