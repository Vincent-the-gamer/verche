export interface Versions {
  current: string
  latest: string
  latestLTS?: string
}

export enum SupportedTools {
  Node = 'node',
  Git = 'git',
  Rust = 'rust',
  UV = 'uv',
  Brew = 'brew',
  LocalSend = 'localsend',
  Kitty = 'kitty'
}

export enum SupportedPlatforms {
  MacOS = 'macos',
  Windows = 'windows'
}