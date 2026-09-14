import { useEffect, useRef } from "react"
import logoSvg from "../../../shared/assets/svg/logo.svg?raw"

const PALETTE = [
    "202, 220, 252", // secondary (claro)
    "120, 150, 255", // primary intenso
    "76, 110, 245", // primary
    "150, 200, 255",
]

// Todo en unidades de "half" = mitad del lado del contenedor (la foto ocupa
// hasta ~0.88 con el inset del 6%).
const ORBIT_MIN = 1.0
const ORBIT_MAX = 1.36
// Velocidad angular base (rad/frame a 60fps) para R = 1; escala kepleriana
const BASE_SPEED = 0.006
const DEPTH_SCALE = 0.3
const LINK_RATIO = 0.17
const MAX_LINKS = 3
// Captura: cada cierto tiempo una particula cae en espiral hacia la foto
const CAPTURE_EVERY_MS = 1900
const CAPTURE_FALL_MS = 1800
// Cursor: las particulas se apartan y vuelven a su sitio con un resorte,
// igual que en el resto de la pagina
const MOUSE_RADIUS = 120
const MOUSE_FORCE = 1.4
const SPRING = 0.045
const SPRING_DAMPING = 0.82

// Llaves del logo: alto y separacion respecto al borde de la foto
const BRACE_HEIGHT = 1.7
const BRACE_GAP = 1.04
// los puntos de las llaves se enlazan entre si a mayor distancia para que
// el trazo se lea continuo
const BRACE_LINK_RATIO = 0.085
const BRACE_MAX_LINKS = 2
const BRACE_SETTLE_MS = 1800
const LOGO_PATHS = [...logoSvg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])
const LOGO_H = 111
const BRACES = [LOGO_PATHS[0], LOGO_PATHS[LOGO_PATHS.length - 1]]

function randomUnit() {
    const z = Math.random() * 2 - 1
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(1 - z * z)
    return { x: r * Math.cos(a), y: r * Math.sin(a), z }
}

function cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    }
}

function normalize(v) {
    const len = Math.hypot(v.x, v.y, v.z) || 1
    return { x: v.x / len, y: v.y / len, z: v.z / len }
}

function easeInCubic(t) {
    return t * t * t
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
}

function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
    }
    return list
}

// Muestrea una llave del logo y devuelve puntos normalizados a su propio
// bounding box (x, y en 0..1) mas la relacion de aspecto ancho/alto. La
// mayoria de puntos van al contorno para que el trazo se lea limpio.
const BRACE_OUTLINE_RATIO = 0.8

function sampleBrace(d, perBrace) {
    const scale = 220 / LOGO_H
    const canvas = document.createElement("canvas")
    canvas.width = Math.ceil(244 * scale)
    canvas.height = Math.ceil(LOGO_H * scale)
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    ctx.scale(scale, scale)
    ctx.fillStyle = "#fff"
    ctx.fill(new Path2D(d))

    const W = canvas.width
    const H = canvas.height
    const data = ctx.getImageData(0, 0, W, H).data
    const opaque = (x, y) =>
        x >= 0 && y >= 0 && x < W && y < H && data[(y * W + x) * 4 + 3] > 120

    const outline = []
    const fill = []
    let minX = Infinity
    let maxX = -Infinity
    const band = 3
    for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
            if (!opaque(x, y)) continue
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            const edge =
                !opaque(x - band, y) ||
                !opaque(x + band, y) ||
                !opaque(x, y - band) ||
                !opaque(x, y + band)
            ;(edge ? outline : fill).push({ x, y })
        }
    }
    const w = maxX - minX || 1
    const outlineCount = Math.min(outline.length, Math.round(perBrace * BRACE_OUTLINE_RATIO))
    const picked = shuffle(outline)
        .slice(0, outlineCount)
        .concat(shuffle(fill).slice(0, perBrace - outlineCount))
    const points = picked.map((p) => ({ x: (p.x - minX) / w, y: p.y / H }))
    return { points, aspect: w / H }
}

// Plano orbital: normal aleatoria con sesgo hacia el eje X, asi las orbitas
// proyectan elipses "de pie" y despejan los lados donde van las llaves.
function createOrbiter(i, radius) {
    const normal = normalize({
        x: (0.55 + Math.random() * 0.45) * (Math.random() < 0.5 ? -1 : 1),
        y: (Math.random() - 0.5) * 0.9,
        z: (Math.random() - 0.5) * 1.2,
    })
    const seed = Math.abs(normal.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 }
    const u = normalize(cross(normal, seed))
    const v = normalize(cross(normal, u))
    const R = radius ?? ORBIT_MIN + Math.random() * (ORBIT_MAX - ORBIT_MIN)
    return {
        kind: "orbit",
        u,
        v,
        R,
        baseR: R,
        theta: Math.random() * Math.PI * 2,
        dir: Math.random() < 0.5 ? -1 : 1,
        r: 0.7 + Math.random() * 1.3,
        color: PALETTE[i % PALETTE.length],
        wobble: Math.random() * Math.PI * 2,
        falling: 0, // timestamp de inicio de la caida, 0 si orbita normal
        x: 0,
        y: 0,
        z: 0,
        px: 0,
        py: 0,
        // desplazamiento por el cursor y su velocidad (resorte hacia 0)
        ox: 0,
        oy: 0,
        ovx: 0,
        ovy: 0,
    }
}

// Particula anclada a un punto de una llave. Nace en una orbita exterior
// y se asienta en su sitio al arrancar.
function createAnchored(i, anchor, side) {
    const start = randomUnit()
    return {
        kind: "brace",
        anchor,
        side, // -1 izquierda, 1 derecha
        start: { x: start.x * 1.4, y: start.y * 1.4 },
        r: 0.7 + Math.random() * 0.5,
        color: i % 4 === 0 ? PALETTE[1] : PALETTE[0],
        wobble: Math.random() * Math.PI * 2,
        z: 0.35,
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        ox: 0,
        oy: 0,
        ovx: 0,
        ovy: 0,
    }
}

// Enjambre gravitando alrededor del contenedor (la foto), enmarcado por las
// llaves del logo. Dos canvas: lo que pasa por detras se dibuja debajo del
// contenido y lo que pasa por delante (y las llaves), encima.
function GravityField({
    className,
    label,
    orbiters = 100,
    bracePoints = 230,
    innerRadius = 0.88,
    overscan = 1.9,
}) {
    const backRef = useRef(null)
    const frontRef = useRef(null)

    useEffect(() => {
        const back = backRef.current
        const front = frontRef.current
        const container = back.parentElement
        const backCtx = back.getContext("2d")
        const frontCtx = front.getContext("2d")
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

        let width = 0
        let height = 0
        let half = 0
        let linkDistance = 0
        let particles = []
        let braceAspect = 0.26
        let animationId = null
        let lastFrame = 0
        let lastCapture = 0
        let settleStart = 0
        let isVisible = false
        const mouse = { x: -9999, y: -9999 }

        const build = () => {
            const list = []
            for (let i = 0; i < orbiters; i++) list.push(createOrbiter(i))
            BRACES.forEach((d, b) => {
                const { points, aspect } = sampleBrace(d, bracePoints)
                braceAspect = aspect
                points.forEach((anchor, i) =>
                    list.push(createAnchored(i, anchor, b === 0 ? -1 : 1))
                )
            })
            particles = list
        }

        const applyOverscan = (canvas) => {
            const bleed = ((overscan - 1) / 2) * 100
            canvas.style.position = "absolute"
            canvas.style.inset = `-${bleed}%`
            canvas.style.width = `${overscan * 100}%`
            canvas.style.height = `${overscan * 100}%`
        }

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = back.clientWidth
            height = back.clientHeight
            for (const [canvas, ctx] of [
                [back, backCtx],
                [front, frontCtx],
            ]) {
                canvas.width = Math.floor(width * dpr)
                canvas.height = Math.floor(height * dpr)
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            }
            half = Math.min(container.clientWidth, container.clientHeight) / 2
            linkDistance = half * LINK_RATIO
            if (!particles.length) build()
        }

        const projectOrbit = (p) => {
            const c = Math.cos(p.theta)
            const s = Math.sin(p.theta)
            const R = p.R * half
            p.x = width / 2 + (c * p.u.x + s * p.v.x) * R
            p.y = height / 2 + (c * p.u.y + s * p.v.y) * R
            p.z = c * p.u.z + s * p.v.z // -1..1
        }

        const braceTarget = (p, now) => {
            const h = BRACE_HEIGHT * half
            const w = h * braceAspect
            // las llaves respiran: se abren y cierran suavemente
            const breathe = Math.sin(now / 1100) * 0.025 * half
            const edge = (BRACE_GAP * half + breathe) * p.side
            const x0 = p.side < 0 ? edge - w : edge
            return {
                x: width / 2 + x0 + p.anchor.x * w,
                y: height / 2 - h / 2 + p.anchor.y * h,
            }
        }

        const placeBrace = (p, now, settle) => {
            const target = braceTarget(p, now)
            const jitterX = Math.sin(now / 700 + p.wobble) * 0.6
            const jitterY = Math.cos(now / 800 + p.wobble) * 0.6
            const sx = width / 2 + p.start.x * half
            const sy = height / 2 + p.start.y * half
            p.x = sx + (target.x + jitterX - sx) * settle
            p.y = sy + (target.y + jitterY - sy) * settle
        }

        // Empuja la particula lejos del cursor y la deja volver con un
        // resorte amortiguado; se suma a su posicion analitica.
        const nudge = (p, dt) => {
            const mdx = p.x + p.ox - mouse.x
            const mdy = p.y + p.oy - mouse.y
            const d2 = mdx * mdx + mdy * mdy
            if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
                const d = Math.sqrt(d2) || 1
                const force = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE
                p.ovx += (mdx / d) * force * dt
                p.ovy += (mdy / d) * force * dt
            }
            p.ovx = (p.ovx - p.ox * SPRING * dt) * Math.pow(SPRING_DAMPING, dt)
            p.ovy = (p.ovy - p.oy * SPRING * dt) * Math.pow(SPRING_DAMPING, dt)
            p.ox += p.ovx * dt
            p.oy += p.ovy * dt
            p.x += p.ox
            p.y += p.oy
        }

        const step = (now, dt) => {
            if (!settleStart) settleStart = now
            const settle = easeOutCubic(Math.min(1, (now - settleStart) / BRACE_SETTLE_MS))

            // una particula nueva empieza a caer cada cierto tiempo
            if (now - lastCapture > CAPTURE_EVERY_MS) {
                const candidate = particles[Math.floor(Math.random() * orbiters)]
                if (candidate && !candidate.falling) {
                    candidate.falling = now
                    lastCapture = now
                }
            }

            for (const p of particles) {
                p.px = p.x
                p.py = p.y

                if (p.kind === "brace") {
                    placeBrace(p, now, settle)
                    nudge(p, dt)
                    continue
                }

                if (p.falling) {
                    const t = Math.min(1, (now - p.falling) / CAPTURE_FALL_MS)
                    // cae en espiral acelerando
                    p.R = p.baseR + (innerRadius - p.baseR) * easeInCubic(t)
                    p.theta += p.dir * ((BASE_SPEED * 3) / Math.pow(p.R, 1.5)) * dt
                    if (t >= 1) {
                        // renace en una orbita exterior nueva
                        const fresh = createOrbiter(0, ORBIT_MAX - Math.random() * 0.12)
                        Object.assign(p, fresh, { color: p.color })
                    }
                } else {
                    p.theta += p.dir * (BASE_SPEED / Math.pow(p.R, 1.5)) * dt
                    // respiracion radial muy leve
                    p.R = p.baseR + Math.sin(now / 1400 + p.wobble) * 0.012
                }
                projectOrbit(p)
                nudge(p, dt)
            }
        }

        const drawGlow = (ctx) => {
            const cx = width / 2
            const cy = height / 2
            const glow = ctx.createRadialGradient(cx, cy, half * 0.5, cx, cy, half * 1.5)
            glow.addColorStop(0, "rgba(76, 110, 245, 0.3)")
            glow.addColorStop(0.5, "rgba(76, 110, 245, 0.08)")
            glow.addColorStop(1, "rgba(76, 110, 245, 0)")
            ctx.fillStyle = glow
            ctx.fillRect(0, 0, width, height)
        }

        const drawLayer = (ctx, list, behind) => {
            // enlaces entre vecinos del mismo lado
            ctx.lineWidth = 1
            const braceLink = half * BRACE_LINK_RATIO
            const linkCount = new Uint8Array(list.length)
            for (let i = 0; i < list.length; i++) {
                const p = list[i]
                const cap = p.kind === "brace" ? BRACE_MAX_LINKS : MAX_LINKS
                if (linkCount[i] >= cap) continue
                for (let j = i + 1; j < list.length; j++) {
                    if (linkCount[j] >= cap) continue
                    const q = list[j]
                    // las llaves solo se enlazan entre si (y con su misma
                    // llave), las orbitas entre si
                    if (p.kind !== q.kind) continue
                    const brace = p.kind === "brace"
                    if (brace && p.side !== q.side) continue
                    const reach = brace ? braceLink : linkDistance
                    const dx = p.x - q.x
                    const dy = p.y - q.y
                    const d2 = dx * dx + dy * dy
                    if (d2 >= reach * reach) continue
                    const strength = 1 - Math.sqrt(d2) / reach
                    const depth = ((p.z + q.z) / 2 + 1) / 2
                    const alpha = behind
                        ? 0.1 * strength
                        : (brace ? 0.5 : 0.2) * strength * (brace ? 1 : 0.4 + depth * 0.6)
                    ctx.strokeStyle = `rgba(202, 220, 252, ${alpha})`
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(q.x, q.y)
                    ctx.stroke()
                    linkCount[i]++
                    linkCount[j]++
                    if (linkCount[i] >= cap) break
                }
            }

            for (const p of list) {
                const depth = (p.z + 1) / 2 // 0 atras .. 1 delante
                const size = p.r * (1 + (depth - 0.5) * 2 * DEPTH_SCALE)
                let alpha = behind ? 0.3 + depth * 0.25 : 0.45 + depth * 0.45
                if (p.kind === "brace") alpha = 0.95
                // por delante de la foto: mas discreta para no tapar la cara
                const inside =
                    Math.hypot(p.x - width / 2, p.y - height / 2) < half * innerRadius
                if (!behind && inside && p.kind !== "brace") alpha *= 0.5
                if (p.falling) alpha = Math.min(1, alpha + 0.3)

                // estela cuando cae
                if (p.falling) {
                    ctx.beginPath()
                    ctx.moveTo(p.px, p.py)
                    ctx.lineTo(p.x, p.y)
                    ctx.strokeStyle = `rgba(${p.color}, ${alpha * 0.6})`
                    ctx.lineWidth = size
                    ctx.lineCap = "round"
                    ctx.stroke()
                }

                if (p.kind !== "brace") {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.14})`
                    ctx.fill()
                }

                ctx.beginPath()
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color}, ${alpha})`
                ctx.fill()
            }
        }

        const render = () => {
            backCtx.clearRect(0, 0, width, height)
            frontCtx.clearRect(0, 0, width, height)
            drawGlow(backCtx)

            const behind = []
            const ahead = []
            for (const p of particles) (p.z < 0 ? behind : ahead).push(p)
            behind.sort((a, b) => a.z - b.z)
            ahead.sort((a, b) => a.z - b.z)
            drawLayer(backCtx, behind, true)
            drawLayer(frontCtx, ahead, false)
        }

        const frame = (now) => {
            const dt = lastFrame ? Math.min(3, Math.max(0.25, (now - lastFrame) / 16.667)) : 1
            lastFrame = now
            step(now, dt)
            render()
        }

        const loop = (now) => {
            frame(now)
            animationId = requestAnimationFrame(loop)
        }

        const start = () => {
            if (animationId) return
            lastFrame = 0
            animationId = requestAnimationFrame(loop)
        }

        const stop = () => {
            if (animationId) {
                cancelAnimationFrame(animationId)
                animationId = null
            }
        }

        // sin animacion: llaves ya asentadas y orbitas congeladas
        const renderStatic = () => {
            settleStart = -BRACE_SETTLE_MS * 2
            step(0, 0)
            render()
        }

        applyOverscan(back)
        applyOverscan(front)
        resize()

        const resizeObserver = new ResizeObserver(() => {
            resize()
            if (reduceMotion) renderStatic()
            else if (!animationId) {
                step(lastFrame, 0)
                render()
            }
        })
        resizeObserver.observe(container)

        if (reduceMotion) {
            renderStatic()
            return () => resizeObserver.disconnect()
        }

        // primer frame inmediato (llaves aun dispersas: se asientan al
        // entrar en pantalla) para que el canvas nunca quede vacio
        step(0, 0)
        render()

        const visibilityObserver = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting
                if (isVisible && !document.hidden) start()
                else stop()
            },
            { threshold: 0.05 }
        )
        visibilityObserver.observe(container)

        const onVisibilityChange = () => {
            if (document.hidden) stop()
            else if (isVisible) start()
        }
        const onMouseMove = (event) => {
            const rect = front.getBoundingClientRect()
            mouse.x = event.clientX - rect.left
            mouse.y = event.clientY - rect.top
        }
        const onMouseLeave = () => {
            mouse.x = -9999
            mouse.y = -9999
        }
        document.addEventListener("visibilitychange", onVisibilityChange)
        window.addEventListener("mousemove", onMouseMove, { passive: true })
        document.addEventListener("mouseleave", onMouseLeave)

        return () => {
            stop()
            document.removeEventListener("visibilitychange", onVisibilityChange)
            window.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseleave", onMouseLeave)
            resizeObserver.disconnect()
            visibilityObserver.disconnect()
        }
    }, [orbiters, bracePoints, innerRadius, overscan])

    return (
        <>
            <canvas
                ref={backRef}
                className={`${className} ${className}--back`}
                aria-hidden="true"
            />
            <canvas
                ref={frontRef}
                className={`${className} ${className}--front`}
                role="img"
                aria-label={label}
            />
        </>
    )
}

export default GravityField
