export interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/** Mini app context from Farcaster SDK; re-exported for layout/UI. */
export type MiniAppPlatformType = 'web' | 'mobile'

export type MiniAppContext = {
  user: {
    fid: number
    username?: string
    displayName?: string
    pfpUrl?: string
  }
  location?: unknown
  client: {
    platformType?: MiniAppPlatformType
    clientFid: number
    added: boolean
    safeAreaInsets?: SafeAreaInsets
    notificationDetails?: unknown
  }
  features?: {
    haptics: boolean
    cameraAndMicrophoneAccess?: boolean
  }
}
