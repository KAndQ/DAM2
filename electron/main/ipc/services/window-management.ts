import { BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { ChannelDescriptor } from '../registry'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = process.env.APP_ROOT ?? path.join(__dirname, '../../..')
const preloadPath = path.join(__dirname, '../../preload/index.mjs')
const rendererDist = path.join(appRoot, 'dist')
const devServerUrl = process.env.VITE_DEV_SERVER_URL

export const openWindowChannel: ChannelDescriptor<'system:open-window'> = {
  channel: 'system:open-window',
  handler: async (_event, payload) => {
    const childWindow = new BrowserWindow({
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    if (devServerUrl) {
      const url = payload?.route ? `${devServerUrl}#${payload.route}` : devServerUrl
      await childWindow.loadURL(url)
    } else {
      await childWindow.loadFile(path.join(rendererDist, 'index.html'), {
        hash: payload?.route ?? '',
      })
    }
  },
}
