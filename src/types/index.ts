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
}