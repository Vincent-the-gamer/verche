/**
 * kitty version checker, works only in kitty terminal.
 */

import { exec } from "child_process"
import { logger } from "../utils/logger"
import { SupportedTools, Versions } from "../types"
import { getGitHubRepoLatestVersion } from "../utils/github"

async function getCurrentKittyVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('kitty --version', (err, stdout, stderr) => {
      if (err) {
        logger.error(stderr)
        reject(err)
      }
      const version = stdout.trim()
      const regex = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;
      const match = version.match(regex);
      resolve(match?.[0] as string)
    })
  })
}

export async function getKittyVersions(): Promise<Versions | null> {
  const currentVersion = await getCurrentKittyVersion().catch(err => {
    logger.error(err)
    return null
  });

  if (!currentVersion) {
    logger.error(`You are not using ${SupportedTools.Kitty}.`)
    return null
  }

  const latestVersion = await getGitHubRepoLatestVersion('kovidgoyal', 'kitty').catch(err => {
    logger.error(err)
    return null
  });

  if (!latestVersion) {
    return null
  }

  const versions: Versions = {
    current: currentVersion,
    latest: latestVersion,
  };

  return versions;
}
