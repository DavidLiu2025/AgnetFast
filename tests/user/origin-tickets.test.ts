/**
 * M4 回源配置 + M7 工单入口测试
 */
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { originConfigRoute, ticketsUserRoute } from '../../src/routes/user/origin-tickets'

const app = new Hono()
app.route('/', originConfigRoute)
app.route('/', ticketsUserRoute)

describe('M4 回源配置', () => {
  it('GET /origin-config 返回200', async () => {
    const res = await app.request('/origin-config')
    expect(res.status).toBe(200)
  })

  it('页面包含回源配置列表', async () => {
    const res = await app.request('/origin-config')
    const html = await res.text()
    expect(html).toContain('回源配置')
    expect(html).toContain('源站地址')
  })

  it('POST /api/origin-config 创建成功', async () => {
    const res = await app.request('/api/origin-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'cdn.test.com', originUrl: 'https://origin.test.com' })
    })
    expect(res.status).toBe(201)
    const data = await res.json() as any
    expect(data.domain).toBe('cdn.test.com')
    expect(data.originUrl).toBe('https://origin.test.com')
  })

  it('POST /api/origin-config 缺domain返回400', async () => {
    const res = await app.request('/api/origin-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originUrl: 'https://origin.test.com' })
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/origin-config 缺originUrl返回400', async () => {
    const res = await app.request('/api/origin-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'cdn.test.com' })
    })
    expect(res.status).toBe(400)
  })
})

describe('M7 工单入口（用户前台）', () => {
  it('GET /tickets 返回200', async () => {
    const res = await app.request('/tickets')
    expect(res.status).toBe(200)
  })

  it('页面包含工单列表', async () => {
    const res = await app.request('/tickets')
    const html = await res.text()
    expect(html).toContain('我的工单')
    expect(html).toContain('T-202601')
  })

  it('页面包含常见问题', async () => {
    const res = await app.request('/tickets')
    const html = await res.text()
    expect(html).toContain('常见问题')
  })

  it('页面包含提交工单入口', async () => {
    const res = await app.request('/tickets')
    const html = await res.text()
    expect(html).toContain('submitTicket')
  })

  it('POST /api/tickets 创建成功', async () => {
    const res = await app.request('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: '测试问题', content: '这是详细描述' })
    })
    expect(res.status).toBe(201)
    const data = await res.json() as any
    expect(data.id).toBeTruthy()
    expect(data.status).toBe('open')
  })

  it('POST /api/tickets 缺subject返回400', async () => {
    const res = await app.request('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '描述' })
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/tickets 缺content返回400', async () => {
    const res = await app.request('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: '标题' })
    })
    expect(res.status).toBe(400)
  })

  it('工单ID格式包含T-前缀', async () => {
    const res = await app.request('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: '测试', content: '测试内容' })
    })
    const data = await res.json() as any
    expect(data.id).toMatch(/^T-\d+$/)
  })
})
