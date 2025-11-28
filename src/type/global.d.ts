import type { RendererIpcClient } from '@/shared/ipc/types'

declare global {
  interface Window {
    ipcRenderer: {
      on: typeof import('electron').ipcRenderer.on
      off: typeof import('electron').ipcRenderer.off
      send: typeof import('electron').ipcRenderer.send
      invoke: typeof import('electron').ipcRenderer.invoke
    }
    dam2Ipc?: RendererIpcClient
  }
}

export {}
