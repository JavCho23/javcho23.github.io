import { preview } from "vite"
import puppeteer from "puppeteer"
import fs from "node:fs/promises"
import path from "node:path"

const OUTPUT = path.resolve("dist/index.html")

async function prerender() {
    const server = await preview({
        preview: { port: 4173, strictPort: false, host: "127.0.0.1" },
    })
    const url = server.resolvedUrls.local[0]

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    try {
        const page = await browser.newPage()
        await page.setViewport({ width: 1440, height: 900 })
        await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 })

        // Let React mount and ScrollMagic/GSAP finish setting up pinned sections.
        await page.waitForSelector("footer", { timeout: 10000 })
        await new Promise((resolve) => setTimeout(resolve, 800))

        const html = await page.content()
        await fs.writeFile(OUTPUT, html)
        console.log(`Prerendered ${OUTPUT} (${(html.length / 1024).toFixed(1)} KB)`)
    } finally {
        await browser.close()
        await new Promise((resolve, reject) => {
            server.httpServer.close((err) => (err ? reject(err) : resolve()))
        })
    }
}

prerender().catch((error) => {
    console.warn(
        "Prerender skipped, the site will still work as a regular client-rendered SPA:",
        error.message
    )
    process.exit(0)
})
