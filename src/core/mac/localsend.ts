import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { parse } from "plist"
import { logger } from "../../utils/logger"
import { getLatestLocalSendVersion } from "../../utils/localsend"
import { SupportedTools, Versions } from "../../types"

function findLocalSendApp(): string | null {
  const candidates = [
    "/Applications/LocalSend.app",
    join(homedir(), "Applications/LocalSend.app"),
  ]

  return candidates.find(existsSync) ?? null
}

async function getCurrentLocalSendVersion(): Promise<string | null> {
  const appPath = findLocalSendApp()

  if (!appPath) {
    return null
  }

  const plistPath = join(appPath, "Contents", "Info.plist")
  const raw = await readFile(plistPath)
  const info = (
    raw.subarray(0, 6).toString("utf8") === "bplist"
      ? parse(raw)
      : parse(raw.toString("utf8"))
  ) as Record<string, unknown>

  const version = info.CFBundleShortVersionString

  if (typeof version !== "string") {
    return null
  }

  return version.trim()
}

export async function getLocalSendVersions(): Promise<Versions | null> {
  if (process.platform !== "darwin") {
    logger.warn(`${SupportedTools.LocalSend} is only supported on macOS.`)
    return null
  }

  const currentVersion = await getCurrentLocalSendVersion().catch((err) => {
    logger.error(err)
    return null
  })

  if (!currentVersion) {
    logger.error(`You are not using ${SupportedTools.LocalSend}.`)
    return null
  }

  const latestVersion = await getLatestLocalSendVersion().catch((err) => {
    logger.error(err)
    return null
  })

  if (!latestVersion) {
    logger.error(
      `Failed to fetch ${SupportedTools.LocalSend} official site's version data.`,
    )
    return null
  }

  const versions: Versions = {
    current: currentVersion,
    latest: latestVersion,
  }

  return versions
}
