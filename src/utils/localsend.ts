import { load } from "cheerio/slim"
import axios from "./axios"

const DOWNLOAD_PAGE = "https://localsend.org/zh-CN/download?os=macos"

// The download page is client-side rendered, so the download button's href is
// stored in its JS chunks instead of the initial HTML.
const DMG_VERSION_REGEX =
  /releases\/download\/v([^/"']+)\/LocalSend-[^/"']+\.dmg/

function getScriptUrls(html: string): string[] {
  const $ = load(html)
  const urls = new Set<string>()

  $("script[src]").each((_, el) => {
    const src = $(el).attr("src")
    if (src) {
      urls.add(new URL(src, DOWNLOAD_PAGE).href)
    }
  })

  $('link[rel="modulepreload"][href]').each((_, el) => {
    const href = $(el).attr("href")
    if (href) {
      urls.add(new URL(href, DOWNLOAD_PAGE).href)
    }
  })

  return [...urls]
}

export async function getLatestLocalSendVersion(): Promise<string | null> {
  const { data } = await axios.get(DOWNLOAD_PAGE)

  if (!data) {
    return null
  }

  const scripts = await Promise.all(
    getScriptUrls(data).map(async (url) => {
      const { data: script } = await axios.get(url)
      return String(script)
    }),
  )

  for (const script of scripts) {
    const match = script.match(DMG_VERSION_REGEX)
    if (match) {
      return match[1]
    }
  }

  return null
}
