import { app } from 'electron'
import type { ChannelDescriptor } from '../registry'

export const appInfoChannel: ChannelDescriptor<'app:get-info'> = {
  channel: 'app:get-info',
  handler: async () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
  }),
}
