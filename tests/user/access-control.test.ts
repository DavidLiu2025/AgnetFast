import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { accessControlRoute } from '../../src/routes/user/access-control'

// 挂载路由
const app = new Hono()
app.route('/', accessControlRoute)

describe('M1 访问控制模块', () => {
  describe('GET /access-control', () => {
    it('返回200状态码', async () => {
      const res = await app.request('/access-control')
      expect(res.status).toBe(200)
    })

    it('Content-Type为text/html', async () => {
      const res = await app.request('/access-control')
      expect(res.headers.get('content-type')).toContain('text/html')
    })

    it('包含"访问控制"标题', async () => {
      const res = await app.request('/access-control')
      const html = await res.text()
      expect(html).toContain('访问控制')
    })

    it('包含IP黑白名单区域', async () => {
      const res = await app.request('/access-control')
      const html = await res.text()
      expect(html).toContain('IP 黑白名单')
    })

    it('包含防盗链配置区域', async () => {
      const res = await app.request('/access-control')
      const html = await res.text()
      expect(html).toContain('防盗链')
    })

    it('包含Referer规则区域', async () => {
      const res = await app.request('/access-control')
      const html = await res.text()
      expect(html).toContain('Referer')
    })

    it('包含UA过滤区域', async () => {
      const res = await app.request('/access-control')
      const html = await res.text()
      expect(html).toContain('User-Agent')
    })

    it('侧边栏access-control项为active', async () => {
      const res = await app.request('/access-control')
      const html = await res.text()
      // 侧边栏nav-item包含active class，且href含access-control
      expect(html).toMatch(/nav-item[^>]*active[^>]*>[^<]*<\/a>|href="\/access-control"[^>]*class="[^"]*active/)
    })
  })

  describe('POST /api/access-control/ip-rules', () => {
    it('有效请求返回201', async () => {
      const res = await app.request('/api/access-control/ip-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: '192.168.1.1', type: 'blacklist', domain: 'example.com' }),
      })
      expect(res.status).toBe(201)
    })

    it('缺少ip字段返回400', async () => {
      const res = await app.request('/api/access-control/ip-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'blacklist' }),
      })
      expect(res.status).toBe(400)
    })

    it('缺少type字段返回400', async () => {
      const res = await app.request('/api/access-control/ip-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: '10.0.0.1' }),
      })
      expect(res.status).toBe(400)
    })

    it('返回JSON包含id字段', async () => {
      const res = await app.request('/api/access-control/ip-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: '1.2.3.4', type: 'whitelist', domain: 'test.com' }),
      })
      const json = await res.json() as any
      expect(json).toHaveProperty('id')
    })
  })

  describe('DELETE /api/access-control/ip-rules/:id', () => {
    it('有效ID返回200', async () => {
      const res = await app.request('/api/access-control/ip-rules/rule-001', {
        method: 'DELETE',
      })
      expect(res.status).toBe(200)
    })

    it('返回JSON包含success字段', async () => {
      const res = await app.request('/api/access-control/ip-rules/rule-001', {
        method: 'DELETE',
      })
      const json = await res.json() as any
      expect(json).toHaveProperty('success', true)
    })
  })

  describe('POST /api/access-control/referer-rules', () => {
    it('有效请求返回201', async () => {
      const res = await app.request('/api/access-control/referer-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whitelist', values: ['example.com'], domain: 'cdn.example.com' }),
      })
      expect(res.status).toBe(201)
    })

    it('缺少values字段返回400', async () => {
      const res = await app.request('/api/access-control/referer-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whitelist' }),
      })
      expect(res.status).toBe(400)
    })
  })
})
