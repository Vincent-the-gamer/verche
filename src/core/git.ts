import { exec } from "child_process";
import { logger } from "../utils/logger";
import { SupportedTools, Versions } from "../types";
import axios from "axios";
import { load } from "cheerio/slim";

async function getCurrentGitVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git -v', (err, stdout, stderr) => {
      if (err) {
        logger.error(stderr)
        reject(err)
      }
      const version = stdout.trim()
      // match cargo version num
      const regex = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;
      const match = version.match(regex);
      resolve(match?.[0] as string)
    })
  })
}

export async function getGitVersions(): Promise<Versions | null> {
  const currentVersion = await getCurrentGitVersion().catch(err => {
    logger.error(err)
    return null
  });

  if (!currentVersion) {
    logger.error(`You are not using ${SupportedTools.Git}.`)
    return null
  }

  const { data } = await axios.get('https://git-scm.com/');

  if (!data) {
    logger.error(`Failed to fetch ${SupportedTools.Git} official site's version data.`)
    return null
  }

  const $ = load(data);

  const releaseInfo = $('div.release-info');

  const latestVersion = releaseInfo.find("span.version").text().trim();

  const versions: Versions = {
    current: currentVersion,
    latest: latestVersion,
  };

  return versions;
}
