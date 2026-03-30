# verche

verche: ***Ver***sion ***Che***cker

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Quickly check versions of your toolchains.

## Why verche?

I think I'm a little obsessive-compulsive about keeping my dev toolchains newest(or at latest LTS version), like node, uv, git and etc. I'm always checking versions from the official sites of them.

So, why not to check them together?

## Usage

No need to install, run it with npx.

See `npx verche --help` for usage.

Example:

```bash
# list all supported tools
# alias for list: ls
npx verche list

# check all supported tools.
# alias for check: chk
npx verche check

# check specific tool, -n: --name
npx verche check -n rust
```

### Use as a library

You can also use it as a library:

```bash
npm i verche
```

```ts
import { getGitVersions, getNodeVersions, getRustVersions } from "verche";

// get value: { current: 'xxx', latest: 'xxx', latestLTS(if exists): 'xxx' }
const gitVersions = await getGitVersions()
const nodeVersions = await getNodeVersions()
const rustVersions = await getRustVersions()
...
```

## License

[MIT](./LICENSE) License © 2026-PRESENT [Vincent-the-gamer](https://github.com/Vincent-the-gamer)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/verche?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/verche
[npm-downloads-src]: https://img.shields.io/npm/dm/verche?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/verche
[bundle-src]: https://img.shields.io/bundlephobia/minzip/verche?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=verche
[license-src]: https://img.shields.io/github/license/Vincent-the-gamer/verche.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Vincent-the-gamer/verche/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/verche
