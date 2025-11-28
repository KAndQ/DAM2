import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import type { RendererToMainChannels } from '../../../src/shared/ipc/types'

export type ChannelKey = keyof RendererToMainChannels

export type ChannelDescriptor<TChannel extends ChannelKey> = {
  channel: TChannel
  handler: (
    event: IpcMainInvokeEvent,
    payload: RendererToMainChannels[TChannel]['request'],
  ) =>
    | Promise<RendererToMainChannels[TChannel]['response']>
    | RendererToMainChannels[TChannel]['response']
}

const registeredHandlers = new Map<ChannelKey, (event: IpcMainInvokeEvent, payload: unknown) => unknown>()

export function registerIpcHandlers(descriptors: ReadonlyArray<ChannelDescriptor<ChannelKey>>) {
  descriptors.forEach(({ channel, handler }) => {
    if (registeredHandlers.has(channel)) {
      throw new Error(`IPC channel "${channel}" has already been registered.`)
    }

    const wrappedHandler = async (event: IpcMainInvokeEvent, payload: unknown) =>
      handler(event, payload as RendererToMainChannels[typeof channel]['request'])

    ipcMain.handle(channel, wrappedHandler)
    registeredHandlers.set(channel, wrappedHandler)
  })
}

export function unregisterAllIpcHandlers() {
  registeredHandlers.forEach((_handler, channel) => {
    ipcMain.removeHandler(channel)
  })
  registeredHandlers.clear()
}
