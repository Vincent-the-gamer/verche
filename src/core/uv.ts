import { exec } from "child_process"
import { logger } from "../utils/logger"
import { SupportedTools, Versions } from "../types"
import axios from "../utils/axios"
import { load } from "cheerio/slim"

async function getCurrentUvVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('uv --version', (err, stdout, stderr) => {
      if (err) {
        logger.error(stderr)
        reject(err)
      }
      const version = stdout.trim()
      // match uv version num
      const regex = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;
      const match = version.match(regex);
      resolve(match?.[0] as string)
    })
  })
}


export async function getUvVersions(): Promise<Versions | null> {
  const currentVersion = await getCurrentUvVersion().catch(err => {
    logger.error(err)
    return null
  });

  if (!currentVersion) {
    logger.error(`You are not using ${SupportedTools.UV}.`)
    return null
  }

  const { data } = await axios.get('https://github.com/astral-sh/uv/releases/latest');

  if (!data) {
    logger.error(`Failed to fetch ${SupportedTools.UV} official site's version data.`)
    return null
  }

  const $ = load(data);

  const titleText = $('title').text().trim();
  // match uv version num
  const regex = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;
  const match = titleText.match(regex);
  const latestVersion = match?.[0] as string;

  const versions: Versions = {
    current: currentVersion,
    latest: latestVersion,
  };

  return versions;
}