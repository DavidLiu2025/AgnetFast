/**
 * M5 性能优化配置测试
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { performanceRoute } from '../../src/routes/user/performance'

const app = new Hono()
app.route('/', performanceRoute)

describe('M5 性能优化配置', () => {
  describe('页面路由', () => {
    it('GET /performance 返回200', async () => {
      const res = await app.request('/performance')
      expect(res.status).toBe(200)
    })

    it('页面包含性能优化标题', async () => {
      const res = await app.request('/performance')
      const html = await res.text()
      expect(html).toContain('性能优化')
    })

    it('页面包含Gzip压缩配置', async () => {
      const res = await app.request('/performance')
      const html = await res.text()
      expect(html).toMatch(/[Gg]zip|压缩/)
    })

    it('页面包含HTTP/2配置', async () => {
      const res = await app.request('/performance')
      const html = await res.text()
      expect(html).toMatch(/HTTP\/2|http2/)
    })

    it('页面包含缓存规则配置', async () => {
      const res = await app.request('/performance')
      const html = await res.text()
      expect(html).toMatch(/缓存规则|Cache-Control/)
    })

    it('页面包含图片优化选项', async () => {
      const res = await app.request('/performance')
      const html = await res.text()
      expect(html).toMatch(/图片优化|WebP/)
    })
  })

  describe('API - 性能配置保存', () => {
    it('POST /api/performance/config 保存成功', async () => {
      const res = await app.request('/api/performance/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: 'cdn.test.com', gzip: true, http2: true })
      })
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(data.success).toBe(true)
    })

    it('POST 缺domain返回400', async () => {
      const res = await app.request('/api/performance/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gzip: true })
      })
      expect(res.status).toBe(400)
    })

    it('GET /api/performance/config 返回配置列表', async () => {
      const res = await app.request('/api/performance/config')
      expect(res.status).toBe(200)
      const data = await res.json() as any
      expect(Array.isArray(data.configs)).toBe(true)
      expect(data.configs.length).toBeGreaterThan(0)
    })

    it('配置项包含必要字段', async () => {
      const res = await app.request('/api/performance/config')
      const data = await res.json() as any
      const config = data.configs[0]
      expect(config).toHaveProperty('domain')
      expect(config).toHaveProperty('gzip')
      expect(config).toHaveProperty('http2')
    })
  })
})
