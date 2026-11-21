import cac, { CAC } from "cac";
import pkgJson from '../package.json'
import restoreCursor from 'restore-cursor'
import { logger, setSilent } from "./utils/logger";
import { SupportedPlatforms, SupportedTools, Versions } from "./types";
import {
  getNodeVersions,
  getRustVersions,
  getUvVersions,
  getGitVersions,
  getBrewVersions,
  getKittyVersions,
  platformTools,
  getCurrentPlatform,
  PlatformToolChecker,
} from "./core";
import { compareVersions } from "./utils/compare";

const cli: CAC = cac("verche")

const { version } = pkgJson

const generalTools: Partial<Record<SupportedTools, PlatformToolChecker>> = {
  [SupportedTools.Node]: getNodeVersions,
  [SupportedTools.Rust]: getRustVersions,
  [SupportedTools.Git]: getGitVersions,
  [SupportedTools.UV]: getUvVersions,
  [SupportedTools.Brew]: getBrewVersions,
  [SupportedTools.Kitty]: getKittyVersions,
}

const generalToolNames = Object.keys(generalTools) as SupportedTools[]
const platformNames = Object.values(SupportedPlatforms)

async function generateLogs(tool: SupportedTools, versions: Versions) {
  if (versions.latestLTS) {
    logger.success(`[${tool}] Current Version: ${versions.current}\nLatest Version: ${versions.latest}\nLatest LTS: ${versions.latestLTS}`)
  } else {
    logger.success(`[${tool}] Current Version: ${versions.current}\nLatest Version: ${versions.latest}`)
  }

  const isLatest = compareVersions(versions.current, versions.latest) === 0
  const isLTS = versions.latestLTS && compareVersions(versions.current, versions.latestLTS) === 0
  const lessThanLatest = compareVersions(versions.current, versions.latest) === -1
  const lessThanLTS = versions.latestLTS && compareVersions(versions.current, versions.latestLTS) === -1

  if (isLTS) {
    logger.success(`You are using the latest LTS version of ${tool}: ${versions.current}`)
  } else if (isLatest) {
    logger.success(`You are using the latest version of ${tool}: ${versions.current}`)
  } else if (lessThanLTS) {
    logger.warn(`You are using an outdated version of ${tool}: ${versions.current}. Latest LTS version: ${versions.latestLTS}`)
  } else if (!versions.latestLTS && lessThanLatest) {
    logger.warn(`You are using an outdated version of ${tool}: ${versions.current}. Latest version: ${versions.latest}`)
  } else {
    logger.success(`You are using the version of ${tool}: ${versions.current}`)
  }

  logger.log("\n")
}

function isSupportedPlatform(value: string): value is SupportedPlatforms {
  return (platformNames as string[]).includes(value)
}

function parsePlatformOption(value?: string): {
  platform: SupportedPlatforms | null
  valid: boolean
} {
  if (!value) {
    return { platform: getCurrentPlatform(), valid: true }
  }

  if (isSupportedPlatform(value)) {
    return { platform: value, valid: true }
  }

  return { platform: null, valid: false }
}

function logInvalidPlatform(value: string) {
  logger.error(`Unsupported platform: ${value}. Supported platforms: ${platformNames.join(", ")}`)
}

async function checkTool(name: SupportedTools, checker: PlatformToolChecker) {
  const versions = await checker()

  if (versions) {
    await generateLogs(name, versions)
  } else {
    logger.warn(`${name} version checked failed, skipping.`)
  }
}

async function checkSpecificTool(name: SupportedTools, platform: SupportedPlatforms | null) {
  if (!Object.values(SupportedTools).includes(name)) {
    logger.error(`Unsupported tool: ${name}`)
    return
  }

  const generalChecker = generalTools[name]

  if (generalChecker) {
    await checkTool(name, generalChecker)
    return
  }

  if (!platform) {
    logger.error(`Cannot check ${name}: no platform-specific tools for the current platform.`)
    return
  }

  const platformChecker = platformTools[platform][name]

  if (!platformChecker) {
    logger.error(`${name} is not supported on ${platform}.`)
    return
  }

  await checkTool(name, platformChecker)
}

async function checkAllTools(platform: SupportedPlatforms | null) {
  for (const tool of generalToolNames) {
    await checkSpecificTool(tool, platform)
  }

  if (!platform) {
    return
  }

  for (const tool of Object.keys(platformTools[platform]) as SupportedTools[]) {
    await checkSpecificTool(tool, platform)
  }
}

const platformOption = `--platform, -p <platform>`
const platformOptionDescription = `check tools for a specific platform (${platformNames.join(", ")}). Defaults to the current platform.`

cli.option("--silent", "only print errors, suppress the rest of the output.")

cli.command("check", "check for versions.")
  .alias("chk")
  .option("--name, -n <name>", "check for versions of a specific tool.")
  .option(platformOption, platformOptionDescription)
  .action(async (options) => {
    setSilent(Boolean(options.silent))

    const { platform, valid } = parsePlatformOption(options.platform)

    if (!valid) {
      logInvalidPlatform(options.platform)
      return
    }

    const { name } = options

    if (name) {
      await checkSpecificTool(name as SupportedTools, platform)
    } else {
      await checkAllTools(platform)
    }
  })


cli.command("list", "list all supported tools.")
  .alias("ls")
  .option(platformOption, platformOptionDescription)
  .action((options) => {
    setSilent(Boolean(options.silent))

    const { platform, valid } = parsePlatformOption(options.platform)

    if (!valid) {
      logInvalidPlatform(options.platform)
      return
    }

    logger.success(`Supported tools: ${generalToolNames.join(", ")}`)

    if (platform) {
      const platformToolNames = Object.keys(platformTools[platform])
      logger.success(`Supported ${platform} tools: ${platformToolNames.join(", ") || "none"}`)
    } else {
      logger.info(`No platform-specific tools for the current platform.`)
    }
  })

cli.help()
cli.version(version)
cli.parse()

restoreCursor()
