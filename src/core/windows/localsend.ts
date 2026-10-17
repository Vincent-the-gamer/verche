import { execFile } from "node:child_process"
import { logger } from "../../utils/logger"
import { getLatestLocalSendVersion } from "../../utils/localsend"
import { SupportedTools, Versions } from "../../types"

// LocalSend's Windows installer registers an uninstall entry containing
// DisplayVersion. Portable ZIP installations are not covered.
const QUERY_VERSION_SCRIPT = `
$keys = @(
  'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
)
Get-ItemProperty $keys -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -like 'LocalSend*' } |
  Select-Object -First 1 -ExpandProperty DisplayVersion
`

async function getCurrentLocalSendVersion(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", QUERY_VERSION_SCRIPT],
      (err, stdout, stderr) => {
        if (err) {
          logger.error(stderr)
          reject(err)
          return
        }

        const version = stdout.trim()
        const regex = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/
        resolve(version.match(regex)?.[0] ?? null)
      },
    )
  })
}

export async function getLocalSendVersions(): Promise<Versions | null> {
  if (process.platform !== "win32") {
    logger.warn(`${SupportedTools.LocalSend} is only supported on Windows.`)
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
