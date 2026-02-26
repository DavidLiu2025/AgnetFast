/**
 * M6 API文档页面测试
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { apiDocsRoute } from '../../src/routes/user/api-docs'

const app = new Hono()
app.route('/', apiDocsRoute)

describe('M6 API文档页面', () => {
  it('GET /api-docs 返回200', async () => {
    const res = await app.request('/api-docs')
    expect(res.status).toBe(200)
  })

  it('页面包含API文档标题', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toContain('API 文档')
  })

  it('页面包含鉴权说明', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toMatch(/API.?Key|鉴权|认证|Authorization/)
  })

  it('页面包含域名管理API端点', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toMatch(/domain|域名/)
  })

  it('页面包含缓存刷新API端点', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toMatch(/cache|purge|缓存/)
  })

  it('页面包含流量统计API端点', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toMatch(/traffic|statistics|流量/)
  })

  it('包含代码示例', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toMatch(/curl|fetch|示例|example/i)
  })

  it('包含SDK或语言选项', async () => {
    const res = await app.request('/api-docs')
    const html = await res.text()
    expect(html).toMatch(/curl|Python|Node\.js|Go/i)
  })

  // API Key 生成端点
  it('POST /api/apikeys 生成API Key', async () => {
    const res = await app.request('/api/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试Key', permissions: ['read'] })
    })
    expect(res.status).toBe(201)
    const data = await res.json() as any
    expect(data.key).toBeTruthy()
    expect(data.name).toBe('测试Key')
  })

  it('API Key格式正确（af_前缀）', async () => {
    const res = await app.request('/api/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    })
    const data = await res.json() as any
    expect(data.key).toMatch(/^af_/)
  })

  it('POST /api/apikeys 缺name返回400', async () => {
    const res = await app.request('/api/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    expect(res.status).toBe(400)
  })
})
