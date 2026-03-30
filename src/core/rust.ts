import { load } from "cheerio/slim";
import { exec } from "child_process";
import { Versions } from "../types";
import axios from "../utils/axios";
import { logger } from "../utils/logger";

async function getCurrentRustVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('cargo --version', (err, stdout, stderr) => {
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

export async function getRustVersions(): Promise<Versions | null> {
    logger.info("For Rust, verche is checking cargo version.")
    const currentVersion = await getCurrentRustVersion().catch(err => {
      logger.error(err)
      return null
    });

  if (!currentVersion) {
      logger.error("You are not using Rust.")
      return null
    }

    const { data } = await axios.get('https://www.rust-lang.org/');

    if (!data) {
      logger.error("Failed to fetch Rust official site's version data.")
      return null
    }

    const $ = load(data);

    const releaseLinks = $('a[href*="releases/latest"]');

    const versions: Versions = {
      current: currentVersion,
      latest: '',
    };

    releaseLinks.each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes("Version")) {
        versions.latest = text.replace("Version", "").trim();
      }
    });

    return versions;
}