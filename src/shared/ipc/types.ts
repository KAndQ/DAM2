import type { IpcRendererEvent } from 'electron'

export interface AppInfo {
  name: string
  version: string
  platform: NodeJS.Platform
  arch: string
}

export interface RendererToMainChannels {
  'app:get-info': {
    request: Record<string, never>
    response: AppInfo
  }
  'system:open-window': {
    request: {
      route?: string
    }
    response: void
  }
}

export type InvokeChannel = keyof RendererToMainChannels

export type ChannelRequest<TChannel extends InvokeChannel> = RendererToMainChannels[TChannel]['request']

export type ChannelResponse<TChannel extends InvokeChannel> = RendererToMainChannels[TChannel]['response']

export interface RendererIpcClient {
  invoke<TChannel extends InvokeChannel>(
    channel: TChannel,
    payload: ChannelRequest<TChannel>,
  ): Promise<ChannelResponse<TChannel>>
  on<TChannel extends InvokeChannel>(
    channel: TChannel,
    listener: (payload: {
      event: IpcRendererEvent
      data: ChannelResponse<TChannel>
    }) => void,
  ): () => void
}
