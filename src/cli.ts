import cac, { CAC } from "cac";
import pkgJson from '../package.json'
import restoreCursor from 'restore-cursor'
import { logger } from "./utils/logger";
import { SupportedTools, Versions } from "./types";
import { getNodeVersions, getRustVersions, getUvVersions } from "./core";
import { compareVersions } from "./utils/compare";
import { getGitVersions } from "./core/git";

const cli: CAC = cac("verche")

const { version } = pkgJson

const nameMap: Record<SupportedTools, string> = {
  node: "Node.js",
  rust: "Rust",
  git: "Git",
  uv: "uv"
}

async function generateLogs(name: SupportedTools, versions: Versions) {
  if (versions.latestLTS) {
    logger.success(`[${nameMap[name]}] Current Version: ${versions.current}\nLatest Version: ${versions.latest}\nLatest LTS: ${versions.latestLTS}`)
  } else {
    logger.success(`[${nameMap[name]}] Current Version: ${versions.current}\nLatest Version: ${versions.latest}`)
  }

  const isLatest = compareVersions(versions.current, versions.latest) === 0
  const isLTS = versions.latestLTS && compareVersions(versions.current, versions.latestLTS) === 0
  const lessThanLatest = compareVersions(versions.current, versions.latest) === -1
  const lessThanLTS = versions.latestLTS && compareVersions(versions.current, versions.latestLTS) === -1

  if (isLTS) {
    logger.success(`You are using the latest LTS version of ${nameMap[name]}: ${versions.current}`)
  } else if (isLatest) {
    logger.success(`You are using the latest version of ${nameMap[name]}: ${versions.current}`)
  } else if (lessThanLTS) {
    logger.warn(`You are using an outdated version of ${nameMap[name]}: ${versions.current}. Latest LTS version: ${versions.latestLTS}`)
  } else if (!versions.latestLTS && lessThanLatest) {
    logger.warn(`You are using an outdated version of ${nameMap[name]}: ${versions.current}. Latest version: ${versions.latest}`)
  } else {
    logger.success(`You are using the version of ${nameMap[name]}: ${versions.current}`)
  }

  logger.log("\n")
}

async function checkNodeVersions() {
  const versions = await getNodeVersions()
  if (versions) {
    await generateLogs(SupportedTools.Node, versions)
  } else {
    logger.warn("Node version checked failed, skipping.")
  }
}

async function checkRustVersions() {
  const versions = await getRustVersions()
  if (versions) {
    await generateLogs(SupportedTools.Rust, versions)
  } else {
    logger.warn("Node version checked failed, skipping.")
  }
}

async function checkGitVersions() {
  const versions = await getGitVersions()
  if (versions) {
    await generateLogs(SupportedTools.Git, versions)
  } else {
    logger.warn("Node version checked failed, skipping.")
  }
}

async function checkUvVersions() {
  const versions = await getUvVersions()
  if (versions) {
    await generateLogs(SupportedTools.UV, versions)
  } else {
    logger.warn("uv version checked failed, skipping.")
  }
}

async function checkSpecificTool(name: SupportedTools) {
  if(!Object.values(SupportedTools).includes(name)) {
    logger.error(`Unsupported tool: ${name}`)
    return
  }

  switch(name) {
    case SupportedTools.Node:
      await checkNodeVersions()
      break
    case SupportedTools.Rust:
      await checkRustVersions()
      break
    case SupportedTools.Git:
      await checkGitVersions()
      break
    case SupportedTools.UV:
      await checkUvVersions()
      break
    default:
      logger.error(`Not matched: ${name}`)
      break
  }
}

async function checkAllTools() {
  for (const tool of Object.values(SupportedTools)) {
    await checkSpecificTool(tool)
  }
}

cli.command("check", "check for versions.")
  .alias("chk")
  .option("--name, -n <name>", "check for versions of a specific tool.")
  .action(async (options) => {
    const { name } = options

    if (name) {
      await checkSpecificTool(name as SupportedTools)
    } else {
      await checkAllTools()
    }
  })


cli.command("list", "list all supported tools.")
  .alias("ls")
  .action(() => {
    logger.success(`Supported tools: ${Object.values(SupportedTools).join(", ")}`)
  })

cli.help()
cli.version(version)
cli.parse()

restoreCursor()