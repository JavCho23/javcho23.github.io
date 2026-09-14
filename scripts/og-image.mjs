import puppeteer from "puppeteer"
import fs from "node:fs/promises"
import path from "node:path"

// Genera public/og-image.jpg (1200x630) a partir de scripts/og-image.html,
// inyectando el logo real del sitio para que siempre coincida con la marca.
const TEMPLATE = path.resolve("scripts/og-image.html")
const LOGO = path.resolve("src/assets/svg/logo.svg")
const OUTPUT = path.resolve("public/og-image.jpg")

const logo = (await fs.readFile(LOGO, "utf8"))
    .replace(/\n/g, "")
    .replace('<svg width="244" height="111"', '<svg width="212" height="96"')
const html = (await fs.readFile(TEMPLATE, "utf8")).replace("<!-- LOGO -->", logo)

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: "networkidle0" })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: OUTPUT, type: "jpeg", quality: 90 })
    console.log(`Generated ${OUTPUT}`)
} finally {
    await browser.close()
}
