import process from "node:process"
import * as mac from "./mac"
import * as windows from "./windows"
import { SupportedPlatforms, SupportedTools, Versions } from "../types"

export type PlatformToolChecker = () => Promise<Versions | null>

export const platformTools: Record<
  SupportedPlatforms,
  Partial<Record<SupportedTools, PlatformToolChecker>>
> = {
  [SupportedPlatforms.MacOS]: {
    [SupportedTools.LocalSend]: mac.getLocalSendVersions,
  },
  [SupportedPlatforms.Windows]: {
    [SupportedTools.LocalSend]: windows.getLocalSendVersions,
  },
}

export function getCurrentPlatform(): SupportedPlatforms | null {
  switch (process.platform) {
    case "darwin":
      return SupportedPlatforms.MacOS
    case "win32":
      return SupportedPlatforms.Windows
    default:
      return null
  }
}
