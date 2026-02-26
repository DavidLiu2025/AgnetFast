import { describe, it, expect } from 'vitest'
import {
  seededRandom,
  gen24hBandwidth,
  genHourLabels,
  statusBadge,
  MOCK_CUSTOMERS,
  MOCK_NODES,
  MOCK_DNS_RULES,
  MOCK_PENDING_DOMAINS,
  MOCK_TICKETS,
} from '../../src/lib/mock'

describe('seededRandom', () => {
  it('返回0到1之间的数', () => {
    for (let i = 0; i < 10; i++) {
      const v = seededRandom(i)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('相同seed返回相同结果（可复现）', () => {
    expect(seededRandom(42)).toBe(seededRandom(42))
    expect(seededRandom(100)).toBe(seededRandom(100))
  })
})

describe('gen24hBandwidth', () => {
  it('返回24个数据点', () => {
    expect(gen24hBandwidth()).toHaveLength(24)
  })

  it('所有值为整数', () => {
    gen24hBandwidth().forEach(v => expect(Number.isInteger(v)).toBe(true))
  })

  it('所有值大于0', () => {
    gen24hBandwidth(100, 50).forEach(v => expect(v).toBeGreaterThan(0))
  })
})

describe('genHourLabels', () => {
  it('返回24个标签', () => {
    expect(genHourLabels()).toHaveLength(24)
  })

  it('第一个标签为0:00', () => {
    expect(genHourLabels()[0]).toBe('0:00')
  })

  it('最后一个标签为23:00', () => {
    expect(genHourLabels()[23]).toBe('23:00')
  })
})

describe('statusBadge', () => {
  it('active状态返回success badge', () => {
    expect(statusBadge('active')).toContain('badge-success')
    expect(statusBadge('active')).toContain('正常')
  })

  it('suspended状态返回danger badge', () => {
    expect(statusBadge('suspended')).toContain('badge-danger')
    expect(statusBadge('suspended')).toContain('已封禁')
  })

  it('未知状态返回gray badge', () => {
    expect(statusBadge('unknown_status')).toContain('badge-gray')
  })

  it('所有状态都返回包含dot的HTML', () => {
    const statuses = ['active', 'online', 'suspended', 'offline', 'warning', 'pending', 'open', 'resolved']
    statuses.forEach(s => expect(statusBadge(s)).toContain('dot'))
  })
})

describe('MOCK_CUSTOMERS', () => {
  it('包含至少5条记录', () => {
    expect(MOCK_CUSTOMERS.length).toBeGreaterThanOrEqual(5)
  })

  it('每条记录包含必要字段', () => {
    MOCK_CUSTOMERS.forEach(c => {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('email')
      expect(c).toHaveProperty('plan')
      expect(c).toHaveProperty('status')
    })
  })
})

describe('MOCK_NODES', () => {
  it('包含至少5个节点', () => {
    expect(MOCK_NODES.length).toBeGreaterThanOrEqual(5)
  })

  it('每个节点包含必要字段', () => {
    MOCK_NODES.forEach(n => {
      expect(n).toHaveProperty('id')
      expect(n).toHaveProperty('ip')
      expect(n).toHaveProperty('region')
      expect(n).toHaveProperty('status')
      expect(n).toHaveProperty('bandwidth')
    })
  })

  it('bandwidth不为负数', () => {
    MOCK_NODES.forEach(n => expect(n.bandwidth).toBeGreaterThanOrEqual(0))
  })
})

describe('MOCK_DNS_RULES', () => {
  it('包含至少4条规则', () => {
    expect(MOCK_DNS_RULES.length).toBeGreaterThanOrEqual(4)
  })

  it('ttl值合法（大于0）', () => {
    MOCK_DNS_RULES.forEach(r => expect(r.ttl).toBeGreaterThan(0))
  })

  it('weight在0-100范围内', () => {
    MOCK_DNS_RULES.forEach(r => {
      expect(r.weight).toBeGreaterThanOrEqual(0)
      expect(r.weight).toBeLessThanOrEqual(100)
    })
  })
})

describe('MOCK_PENDING_DOMAINS', () => {
  it('包含至少3条待审核域名', () => {
    expect(MOCK_PENDING_DOMAINS.length).toBeGreaterThanOrEqual(3)
  })

  it('每条记录包含domain和status字段', () => {
    MOCK_PENDING_DOMAINS.forEach(d => {
      expect(d).toHaveProperty('domain')
      expect(d).toHaveProperty('status')
      expect(d).toHaveProperty('icp')
    })
  })
})

describe('MOCK_TICKETS', () => {
  it('包含不同优先级的工单', () => {
    const priorities = new Set(MOCK_TICKETS.map(t => t.priority))
    expect(priorities.size).toBeGreaterThanOrEqual(2)
  })
})
