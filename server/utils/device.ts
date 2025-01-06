import type { H3Event } from 'h3'
import { nanoid } from 'nanoid'
import { UAParser } from 'ua-parser-js'

import type { DeviceInfo } from '../database/schema/token'

export const getDeviceInfo = (event: H3Event): DeviceInfo => {
  const userAgent = getRequestHeader(event, 'user-agent') || ''
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const ip =
    getRequestHeader(event, 'x-forwarded-for') ||
    getRequestHeader(event, 'x-real-ip') ||
    event.node.req.socket.remoteAddress

  return {
    deviceId: nanoid(),
    deviceName: `${os.name || 'Unknown'} - ${browser.name || 'Unknown'}`,
    browser: browser.name,
    os: os.name,
    ip: typeof ip === 'string' ? ip : ip?.[0],
  }
}
