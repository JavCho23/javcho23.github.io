import { useEffect, useRef } from "react"
import logoSvg from "../assets/svg/logo.svg?raw"

const PALETTE = [
    "202, 220, 252", // secondary (claro)
    "120, 150, 255", // primary intenso
    "76, 110, 245", // primary
    "76, 110, 245",
    "150, 200, 255",
]

// Duraciones en ms de cada fase del ciclo
const GATHER_MS = 1900
const HOLD_MS = 3600
const SCATTER_MS = 1200
const MAX_SPEED = 12

// Resolucion del canvas oculto donde se dibujan las siluetas para muestrear
const SAMPLE_SIZE = 260
const OUTLINE_RATIO = 0.66 // % de particulas que van al contorno
const LINK_RATIO = 0.06 // distancia de enlace relativa al tamaño de la figura
// Desvanecimiento hacia los bordes para fundirse con el fondo
const EDGE_FADE_RATIO = 0.22 // ancho del degradado en los bordes visibles
const VIGNETTE_START = 0.55 // radio (relativo a la figura) donde empieza a apagarse
const VIGNETTE_END = 0.9 // radio donde ya no se ve

/* ------------------------------------------------------------------ */
/* Siluetas. Cada una dibuja en un espacio de 0..SAMPLE_SIZE.         */
/* `animate` recibe un punto base (0..1), el tiempo y datos de la     */
/* fase, y devuelve la posicion animada (engranajes girando, pupilas  */
/* moviendose, flecha creciendo, etc.).                               */
/* ------------------------------------------------------------------ */

function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

function circle(ctx, cx, cy, r, hole = false) {
    ctx.moveTo(cx + r, cy)
    ctx.arc(cx, cy, r, 0, Math.PI * 2, hole)
}

function polygon(ctx, points) {
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.closePath()
}

// Segmento grueso (rectangulo orientado) para dibujar trazos como relleno
function thickLine(ctx, x1, y1, x2, y2, half) {
    const nx = -(y2 - y1)
    const ny = x2 - x1
    const len = Math.hypot(nx, ny) || 1
    const ox = (nx / len) * half
    const oy = (ny / len) * half
    polygon(ctx, [
        [x1 + ox, y1 + oy],
        [x2 + ox, y2 + oy],
        [x2 - ox, y2 - oy],
        [x1 - ox, y1 - oy],
    ])
}

// Engranaje: dientes de perfil trapezoidal + agujero central.
// `phase` gira el conjunto para que los dientes encajen con el vecino.
function gearPath(ctx, cx, cy, outer, inner, teeth, hole, phase) {
    const step = (Math.PI * 2) / teeth
    for (let i = 0; i < teeth; i++) {
        const a = phase + i * step
        const profile = [
            [a - step * 0.25, inner],
            [a - step * 0.15, outer],
            [a + step * 0.15, outer],
            [a + step * 0.25, inner],
        ]
        profile.forEach(([ang, rad], j) => {
            const x = cx + Math.cos(ang) * rad
            const y = cy + Math.sin(ang) * rad
            if (i === 0 && j === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })
    }
    ctx.closePath()
    circle(ctx, cx, cy, hole, true)
}

function rotateAround(p, cx, cy, angle) {
    const dx = p.x - cx
    const dy = p.y - cy
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c }
}

function scaleFrom(p, cx, cy, k) {
    return { x: cx + (p.x - cx) * k, y: cy + (p.y - cy) * k }
}

function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
}

function smoothstep(a, b, v) {
    const t = clamp01((v - a) / (b - a))
    return t * t * (3 - 2 * t)
}

/* --- Engranajes: geometria calculada para que engranen ------------- */
const GEAR_MODULE = 0.036
const GEAR_A = { cx: 0.33, cy: 0.61, teeth: 12 }
const GEAR_B = { cx: 0, cy: 0, teeth: 8 }
const GEAR_ANGLE = -0.58 // direccion de A hacia B
for (const g of [GEAR_A, GEAR_B]) {
    g.pitch = (g.teeth * GEAR_MODULE) / 2
    g.outer = g.pitch + GEAR_MODULE * 0.65
    g.inner = g.pitch - GEAR_MODULE * 0.65
    g.hole = g.pitch * 0.34
}
GEAR_B.cx = GEAR_A.cx + Math.cos(GEAR_ANGLE) * (GEAR_A.pitch + GEAR_B.pitch)
GEAR_B.cy = GEAR_A.cy + Math.sin(GEAR_ANGLE) * (GEAR_A.pitch + GEAR_B.pitch)
// A tiene un diente apuntando a B; B tiene un hueco apuntando a A
GEAR_A.phase = GEAR_ANGLE
GEAR_B.phase = GEAR_ANGLE + Math.PI + Math.PI / GEAR_B.teeth
const GEAR_SPEED = 0.0008

/* --- Grafica: barras + flecha que se dibuja hacia adelante --------- */
const CHART_BARS = [0.76, 0.69, 0.62, 0.55].map((top, i) => ({
    x: 0.12 + i * 0.15,
    w: 0.09,
    top,
}))
const CHART_BOTTOM = 0.86
const CHART_LINE = [
    [0.07, 0.5],
    [0.28, 0.42],
    [0.44, 0.46],
    [0.815, 0.185],
]
const CHART_HEAD = [
    [0.93, 0.1],
    [0.859, 0.239],
    [0.775, 0.127],
]
const CHART_DRAW_MS = 3000

function chartYAt(x) {
    for (let i = 0; i < CHART_LINE.length - 1; i++) {
        const [x1, y1] = CHART_LINE[i]
        const [x2, y2] = CHART_LINE[i + 1]
        if (x <= x2 || i === CHART_LINE.length - 2) {
            const t = clamp01((x - x1) / (x2 - x1))
            return y1 + (y2 - y1) * t
        }
    }
    return CHART_LINE[0][1]
}

/* --- Robot ----------------------------------------------------------- */
const EYE_Y = 0.45
const EYE_DX = 0.14
const EYE_SOCKET = 0.08
const EYE_PUPIL = 0.038

/* --- Logo: paths del SVG ajustados al espacio de muestreo ---------- */
const LOGO_PATHS = [...logoSvg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])
const LOGO_VIEWBOX = { w: 244, h: 111 }
const LOGO_SCALE = (SAMPLE_SIZE * 0.92) / LOGO_VIEWBOX.w
const LOGO_OFFSET = {
    x: (SAMPLE_SIZE - LOGO_VIEWBOX.w * LOGO_SCALE) / 2,
    y: (SAMPLE_SIZE - LOGO_VIEWBOX.h * LOGO_SCALE) / 2,
}

const SHAPES = [
    {
        name: "cohete",
        draw(ctx) {
            const s = SAMPLE_SIZE
            const cx = s / 2
            // cuerpo
            ctx.moveTo(cx, s * 0.08)
            ctx.bezierCurveTo(cx + s * 0.17, s * 0.27, cx + s * 0.17, s * 0.5, cx + s * 0.14, s * 0.67)
            ctx.lineTo(cx - s * 0.14, s * 0.67)
            ctx.bezierCurveTo(cx - s * 0.17, s * 0.5, cx - s * 0.17, s * 0.27, cx, s * 0.08)
            ctx.closePath()
            // aletas
            polygon(ctx, [
                [cx - s * 0.14, s * 0.48],
                [cx - s * 0.29, s * 0.71],
                [cx - s * 0.13, s * 0.67],
            ])
            polygon(ctx, [
                [cx + s * 0.14, s * 0.48],
                [cx + s * 0.29, s * 0.71],
                [cx + s * 0.13, s * 0.67],
            ])
            // ventana (hueco)
            circle(ctx, cx, s * 0.36, s * 0.075, true)
            // llama
            ctx.moveTo(cx - s * 0.1, s * 0.71)
            ctx.quadraticCurveTo(cx, s * 0.8, cx, s * 0.95)
            ctx.quadraticCurveTo(cx, s * 0.8, cx + s * 0.1, s * 0.71)
            ctx.closePath()
        },
        animate(p, t) {
            const drift = Math.sin(t / 700) * 0.012
            const flicker = p.y > 0.73 ? Math.sin(t / 90 + p.x * 40) * 0.014 : 0
            return { x: p.x + flicker, y: p.y + drift }
        },
    },
    {
        name: "robot",
        draw(ctx) {
            const s = SAMPLE_SIZE
            const cx = s / 2
            // cabeza
            roundRect(ctx, cx - s * 0.29, s * 0.26, s * 0.58, s * 0.52, s * 0.08)
            // cuencas (huecos) y pupilas (rellenas)
            for (const side of [-1, 1]) {
                const ex = cx + side * EYE_DX * s
                circle(ctx, ex, EYE_Y * s, EYE_SOCKET * s, true)
                circle(ctx, ex, EYE_Y * s, EYE_PUPIL * s)
            }
            // boca (hueco)
            roundRect(ctx, cx - s * 0.17, s * 0.62, s * 0.34, s * 0.055, s * 0.015)
            // antena
            roundRect(ctx, cx - s * 0.02, s * 0.14, s * 0.04, s * 0.12, s * 0.01)
            circle(ctx, cx, s * 0.11, s * 0.05)
            // orejas
            roundRect(ctx, cx - s * 0.37, s * 0.42, s * 0.07, s * 0.2, s * 0.02)
            roundRect(ctx, cx + s * 0.3, s * 0.42, s * 0.07, s * 0.2, s * 0.02)
        },
        animate(p, t) {
            // pupilas: miran alrededor
            for (const side of [-1, 1]) {
                const ex = 0.5 + side * EYE_DX
                if (Math.hypot(p.x - ex, p.y - EYE_Y) < EYE_PUPIL + 0.012) {
                    const lookX = Math.sin(t / 1300) * Math.cos(t / 2900) * 0.03
                    const lookY = Math.sin(t / 1900) * 0.016
                    return { x: p.x + lookX, y: p.y + lookY }
                }
            }
            // antena pulsando
            if (p.y < 0.17) {
                const pulse = 1 + Math.sin(t / 260) * 0.12
                return scaleFrom(p, 0.5, 0.11, pulse)
            }
            return p
        },
    },
    {
        name: "engranajes",
        draw(ctx) {
            const s = SAMPLE_SIZE
            for (const g of [GEAR_A, GEAR_B]) {
                gearPath(
                    ctx,
                    g.cx * s,
                    g.cy * s,
                    g.outer * s,
                    g.inner * s,
                    g.teeth,
                    g.hole * s,
                    g.phase
                )
            }
        },
        animate(p, t) {
            const da = Math.hypot(p.x - GEAR_A.cx, p.y - GEAR_A.cy) / GEAR_A.pitch
            const db = Math.hypot(p.x - GEAR_B.cx, p.y - GEAR_B.cy) / GEAR_B.pitch
            const angle = t * GEAR_SPEED
            if (da < db) return rotateAround(p, GEAR_A.cx, GEAR_A.cy, angle)
            return rotateAround(
                p,
                GEAR_B.cx,
                GEAR_B.cy,
                -angle * (GEAR_A.teeth / GEAR_B.teeth)
            )
        },
    },
    {
        name: "crecimiento",
        draw(ctx) {
            const s = SAMPLE_SIZE
            for (const b of CHART_BARS) {
                roundRect(ctx, b.x * s, b.top * s, b.w * s, (CHART_BOTTOM - b.top) * s, s * 0.012)
            }
            for (let i = 0; i < CHART_LINE.length - 1; i++) {
                const [x1, y1] = CHART_LINE[i]
                const [x2, y2] = CHART_LINE[i + 1]
                thickLine(ctx, x1 * s, y1 * s, x2 * s, y2 * s, s * 0.022)
            }
            polygon(ctx, CHART_HEAD.map(([x, y]) => [x * s, y * s]))
        },
        animate(p, t, info) {
            // la flecha se dibuja de izquierda a derecha y las barras
            // "crecen" cuando la punta pasa por encima de ellas
            const progress = easeOutCubic(clamp01(info.shapeElapsed / CHART_DRAW_MS))
            const front = 0.05 + progress * 0.92
            const isArrow = p.y < 0.535
            if (isArrow) {
                if (p.x <= front) return p
                return { x: front, y: chartYAt(front) }
            }
            const bar = CHART_BARS.find((b) => p.x >= b.x - 0.02 && p.x <= b.x + b.w + 0.02)
            if (!bar) return p
            const grow = easeOutCubic(clamp01((front - bar.x - bar.w * 0.5) / 0.14))
            return { x: p.x, y: CHART_BOTTOM - (CHART_BOTTOM - p.y) * grow }
        },
    },
    {
        name: "idea",
        draw(ctx) {
            const s = SAMPLE_SIZE
            const cx = s / 2
            // bulbo
            circle(ctx, cx, s * 0.36, s * 0.23)
            // cuello
            polygon(ctx, [
                [cx - s * 0.1, s * 0.55],
                [cx + s * 0.1, s * 0.55],
                [cx + s * 0.08, s * 0.67],
                [cx - s * 0.08, s * 0.67],
            ])
            // base
            roundRect(ctx, cx - s * 0.09, s * 0.69, s * 0.18, s * 0.05, s * 0.015)
            roundRect(ctx, cx - s * 0.09, s * 0.76, s * 0.18, s * 0.05, s * 0.015)
            roundRect(ctx, cx - s * 0.05, s * 0.83, s * 0.1, s * 0.04, s * 0.015)
            // filamento (hueco)
            polygon(ctx, [
                [cx - s * 0.06, s * 0.51],
                [cx - s * 0.06, s * 0.4],
                [cx, s * 0.45],
                [cx + s * 0.06, s * 0.4],
                [cx + s * 0.06, s * 0.51],
                [cx + s * 0.04, s * 0.51],
                [cx + s * 0.04, s * 0.435],
                [cx, s * 0.485],
                [cx - s * 0.04, s * 0.435],
                [cx - s * 0.04, s * 0.51],
            ])
            // rayos
            const rays = [
                [-0.3, 0.36, -0.43, 0.36],
                [0.3, 0.36, 0.43, 0.36],
                [-0.23, 0.17, -0.33, 0.07],
                [0.23, 0.17, 0.33, 0.07],
                [0, 0.07, 0, -0.05],
            ]
            for (const [x1, y1, x2, y2] of rays) {
                thickLine(ctx, cx + x1 * s, y1 * s, cx + x2 * s, y2 * s, s * 0.013)
            }
        },
        animate(p, t) {
            // los rayos "respiran" hacia afuera
            const isRay = p.y < 0.14 || Math.abs(p.x - 0.5) > 0.25
            if (!isRay) return p
            return scaleFrom(p, 0.5, 0.36, 1 + Math.sin(t / 500) * 0.06)
        },
    },
    {
        name: "rayo",
        draw(ctx) {
            const s = SAMPLE_SIZE
            polygon(
                ctx,
                [
                    [0.6, 0.04],
                    [0.27, 0.56],
                    [0.46, 0.56],
                    [0.37, 0.96],
                    [0.75, 0.4],
                    [0.55, 0.4],
                    [0.68, 0.04],
                ].map(([x, y]) => [x * s, y * s])
            )
        },
        animate(p, t) {
            // vibracion electrica intermitente
            const gate = Math.max(0, Math.sin(t / 420))
            const jitter = Math.sin(t / 45 + p.y * 30) * 0.008 * gate
            const pulse = 1 + Math.sin(t / 600) * 0.025
            const q = scaleFrom(p, 0.5, 0.5, pulse)
            return { x: q.x + jitter, y: q.y }
        },
    },
    {
        name: "logo",
        render(ctx, mode) {
            ctx.save()
            ctx.translate(LOGO_OFFSET.x, LOGO_OFFSET.y)
            ctx.scale(LOGO_SCALE, LOGO_SCALE)
            for (const d of LOGO_PATHS) {
                const path = new Path2D(d)
                if (mode === "stroke") {
                    ctx.lineWidth = 3 / LOGO_SCALE
                    ctx.stroke(path)
                } else {
                    ctx.fill(path, "evenodd")
                }
            }
            ctx.restore()
        },
        animate(p, t) {
            // las llaves se abren y cierran suavemente
            const isBrace = p.x < 0.18 || p.x > 0.82
            if (!isBrace) return p
            const k = Math.sin(t / 900) * 0.02
            return { x: p.x + (p.x < 0.5 ? -k : k), y: p.y }
        },
    },
]

/* ------------------------------------------------------------------ */
/* Muestreo: dibuja la silueta en un canvas oculto y devuelve puntos   */
/* normalizados (0..1) del contorno y del relleno.                     */
/* ------------------------------------------------------------------ */

function samplePixels(ctx, size, step) {
    const data = ctx.getImageData(0, 0, size, size).data
    const points = []
    for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
            if (data[(y * size + x) * 4 + 3] > 120) {
                points.push({ x: x / size, y: y / size })
            }
        }
    }
    return points
}

function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
    }
    return list
}

function paintShape(ctx, shape, mode) {
    ctx.clearRect(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
    ctx.fillStyle = "#fff"
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    if (shape.render) {
        shape.render(ctx, mode)
        return
    }
    ctx.beginPath()
    shape.draw(ctx)
    if (mode === "stroke") ctx.stroke()
    else ctx.fill("evenodd")
}

function buildTargets(shape, count) {
    const offscreen = document.createElement("canvas")
    offscreen.width = SAMPLE_SIZE
    offscreen.height = SAMPLE_SIZE
    const ctx = offscreen.getContext("2d", { willReadFrequently: true })

    paintShape(ctx, shape, "stroke")
    const outline = shuffle(samplePixels(ctx, SAMPLE_SIZE, 2))
    paintShape(ctx, shape, "fill")
    const fill = shuffle(samplePixels(ctx, SAMPLE_SIZE, 3))

    const outlineCount = Math.min(outline.length, Math.round(count * OUTLINE_RATIO))
    const targets = []
    for (let i = 0; i < count; i++) {
        const source = i < outlineCount ? outline : fill
        const p = source.length ? source[i % source.length] : { x: 0.5, y: 0.5 }
        targets.push({
            x: p.x + (Math.random() - 0.5) * 0.006,
            y: p.y + (Math.random() - 0.5) * 0.006,
            edge: i < outlineCount,
        })
    }
    return shuffle(targets)
}

/* ------------------------------------------------------------------ */

function ParticleMorph({ className, label, maxParticles = 1000, overscan = 1.8 }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = canvas.parentElement
        const ctx = canvas.getContext("2d")
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

        let width = 0
        let height = 0
        let dpr = 1
        let scale = 0 // tamaño en px del espacio 0..1 de la silueta
        let offsetX = 0
        let offsetY = 0
        let linkDistance = 0
        // zona visible del canvas (recortada por la seccion) en coords del canvas
        const clip = { l: 0, r: 0, t: 0, b: 0, fade: 1 }
        let particles = []
        let targets = []
        let shapeIndex = 0
        let phase = "gather"
        let phaseStart = 0
        let shapeStart = 0
        let animationId = null
        let lastFrame = 0
        let isVisible = false
        const mouse = { x: -9999, y: -9999 }

        // rejilla espacial para buscar vecinos al dibujar enlaces
        let cellSize = 1
        let cols = 0
        let rows = 0
        let heads = new Int32Array(0)
        let next = new Int32Array(0)
        let linkCount = new Uint8Array(0)

        const count = () => {
            const area = container.clientWidth * container.clientHeight
            return Math.max(300, Math.min(maxParticles, Math.floor(area / 400)))
        }

        const applyOverscan = () => {
            const bleed = ((overscan - 1) / 2) * 100
            canvas.style.position = "absolute"
            canvas.style.inset = `-${bleed}%`
            canvas.style.width = `${overscan * 100}%`
            canvas.style.height = `${overscan * 100}%`
        }

        const createParticles = (n) => {
            const list = []
            for (let i = 0; i < n; i++) {
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * Math.min(width, height) * 0.5
                list.push({
                    x: width / 2 + Math.cos(angle) * radius,
                    y: height / 2 + Math.sin(angle) * radius,
                    px: 0,
                    py: 0,
                    vx: 0,
                    vy: 0,
                    speed: 0,
                    fade: 1,
                    r: 0.8 + Math.random() * 1.4,
                    color: PALETTE[i % PALETTE.length],
                    jitter: Math.random() * Math.PI * 2,
                })
            }
            return list
        }

        // expone el estado en el DOM (util para depurar o estilizar)
        const setPhase = (next, now) => {
            phase = next
            phaseStart = now
            canvas.dataset.phase = next
        }

        const setShape = (index, now) => {
            shapeIndex = index
            targets = buildTargets(SHAPES[shapeIndex], particles.length)
            shapeStart = now
            updateClip()
            canvas.dataset.shape = SHAPES[shapeIndex].name
            setPhase("gather", now)
        }

        // la seccion tiene overflow hidden: lo que quede fuera se corta,
        // asi que desvanecemos antes de llegar a ese borde
        const updateClip = () => {
            const section = canvas.closest("section") || document.body
            const sRect = section.getBoundingClientRect()
            const cRect = canvas.getBoundingClientRect()
            clip.l = Math.max(0, sRect.left - cRect.left)
            clip.r = Math.min(width, sRect.right - cRect.left)
            clip.t = Math.max(0, sRect.top - cRect.top)
            clip.b = Math.min(height, sRect.bottom - cRect.top)
            clip.fade = Math.max(1, scale * EDGE_FADE_RATIO)
        }

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = canvas.clientWidth
            height = canvas.clientHeight
            canvas.width = Math.floor(width * dpr)
            canvas.height = Math.floor(height * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            scale = Math.min(container.clientWidth, container.clientHeight)
            offsetX = (width - scale) / 2
            offsetY = (height - scale) / 2
            linkDistance = scale * LINK_RATIO

            updateClip()

            cellSize = Math.max(8, linkDistance)
            cols = Math.ceil(width / cellSize) + 1
            rows = Math.ceil(height / cellSize) + 1
            heads = new Int32Array(cols * rows)

            const n = count()
            if (particles.length !== n) {
                particles = createParticles(n)
                targets = buildTargets(SHAPES[shapeIndex], n)
            }
            if (next.length !== n) {
                next = new Int32Array(n)
                linkCount = new Uint8Array(n)
            }
        }

        const onMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = event.clientX - rect.left
            mouse.y = event.clientY - rect.top
        }

        const onMouseLeave = () => {
            mouse.x = -9999
            mouse.y = -9999
        }

        const scatter = (now) => {
            setPhase("scatter", now)
            for (const p of particles) {
                const dx = p.x - width / 2
                const dy = p.y - height / 2
                const dist = Math.hypot(dx, dy) || 1
                const speed = 4 + Math.random() * 6
                const spin = (Math.random() - 0.5) * 2.4
                p.vx = (dx / dist) * speed + (-dy / dist) * spin
                p.vy = (dy / dist) * speed + (dx / dist) * spin
            }
        }

        const fadeAt = (x, y) => {
            const edge = Math.min(x - clip.l, clip.r - x, y - clip.t, clip.b - y)
            const edgeFade = clamp01(edge / clip.fade)
            const r = Math.hypot(x - width / 2, y - height / 2) / scale
            const vignette = 1 - smoothstep(VIGNETTE_START, VIGNETTE_END, r)
            return edgeFade * vignette
        }

        const drawGlow = (intensity) => {
            const cx = width / 2
            const cy = height / 2
            const radius = scale * 0.6
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
            glow.addColorStop(0, `rgba(202, 220, 252, ${0.34 * intensity})`)
            glow.addColorStop(0.18, `rgba(120, 150, 255, ${0.22 * intensity})`)
            glow.addColorStop(0.5, `rgba(76, 110, 245, ${0.08 * intensity})`)
            glow.addColorStop(1, "rgba(76, 110, 245, 0)")
            ctx.fillStyle = glow
            ctx.fillRect(0, 0, width, height)
        }

        // Enlaces entre particulas cercanas (mismo estilo que el fondo).
        // Se agrupan por opacidad en pocos trazos para no llamar stroke()
        // miles de veces por frame.
        const LINK_BUCKETS = 5
        const FADE_BUCKETS = 3
        const MAX_LINKS = 4
        const linkPaths = Array.from(
            { length: LINK_BUCKETS * FADE_BUCKETS },
            () => new Path2D()
        )

        const drawLinks = (alphaScale) => {
            heads.fill(-1)
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                const cx = Math.floor(p.x / cellSize)
                const cy = Math.floor(p.y / cellSize)
                if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) {
                    next[i] = -2 // fuera de la rejilla
                    continue
                }
                const cell = cy * cols + cx
                next[i] = heads[cell]
                heads[cell] = i
            }

            for (let b = 0; b < linkPaths.length; b++) linkPaths[b] = new Path2D()
            linkCount.fill(0)

            const maxDist2 = linkDistance * linkDistance
            for (let i = 0; i < particles.length; i++) {
                if (next[i] === -2 || linkCount[i] >= MAX_LINKS) continue
                const p = particles[i]
                if (p.fade < 0.05) continue
                const cx = Math.floor(p.x / cellSize)
                const cy = Math.floor(p.y / cellSize)
                for (let oy = 0; oy <= 1; oy++) {
                    for (let ox = -1; ox <= 1; ox++) {
                        // solo celdas "posteriores" para no duplicar pares
                        if (oy === 0 && ox < 0) continue
                        const nx = cx + ox
                        const ny = cy + oy
                        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
                        let j = heads[ny * cols + nx]
                        while (j !== -1) {
                            if ((oy !== 0 || ox !== 0 || j < i) && linkCount[j] < MAX_LINKS) {
                                const q = particles[j]
                                const dx = p.x - q.x
                                const dy = p.y - q.y
                                const d2 = dx * dx + dy * dy
                                if (d2 < maxDist2) {
                                    const distBucket = Math.min(
                                        LINK_BUCKETS - 1,
                                        Math.floor((1 - Math.sqrt(d2) / linkDistance) * LINK_BUCKETS)
                                    )
                                    const fadeBucket = Math.min(
                                        FADE_BUCKETS - 1,
                                        Math.floor(Math.min(p.fade, q.fade) * FADE_BUCKETS)
                                    )
                                    const bucket = fadeBucket * LINK_BUCKETS + distBucket
                                    linkPaths[bucket].moveTo(p.x, p.y)
                                    linkPaths[bucket].lineTo(q.x, q.y)
                                    linkCount[i]++
                                    linkCount[j]++
                                    if (linkCount[i] >= MAX_LINKS) break
                                }
                            }
                            j = next[j]
                        }
                        if (linkCount[i] >= MAX_LINKS) break
                    }
                    if (linkCount[i] >= MAX_LINKS) break
                }
            }

            ctx.lineWidth = 1
            for (let f = 0; f < FADE_BUCKETS; f++) {
                for (let b = 0; b < LINK_BUCKETS; b++) {
                    const alpha =
                        0.18 * alphaScale * ((b + 0.5) / LINK_BUCKETS) * ((f + 0.5) / FADE_BUCKETS)
                    ctx.strokeStyle = `rgba(202, 220, 252, ${alpha})`
                    ctx.stroke(linkPaths[f * LINK_BUCKETS + b])
                }
            }
        }

        const renderFrame = (now) => {
            ctx.clearRect(0, 0, width, height)

            // factor de tiempo relativo a 60fps para que la fisica no dependa
            // de la tasa de refresco (120Hz, pestañas lentas, etc.)
            const dt = lastFrame ? Math.min(3, Math.max(0.25, (now - lastFrame) / 16.667)) : 1
            lastFrame = now

            const shape = SHAPES[shapeIndex]
            const elapsed = now - phaseStart

            if (phase === "gather" && elapsed > GATHER_MS) {
                setPhase("hold", now)
            } else if (phase === "hold" && elapsed > HOLD_MS) {
                scatter(now)
            } else if (phase === "scatter" && elapsed > SCATTER_MS) {
                setShape((shapeIndex + 1) % SHAPES.length, now)
            }

            // el nucleo brilla mas cuando las particulas estan dispersas
            const glowIntensity =
                phase === "scatter"
                    ? 0.55 + 0.45 * Math.min(1, elapsed / SCATTER_MS)
                    : phase === "gather"
                      ? 1 - 0.55 * easeOutCubic(Math.min(1, elapsed / GATHER_MS))
                      : 0.45 + Math.sin(now / 900) * 0.05
            drawGlow(glowIntensity)

            const gatherProgress =
                phase === "gather" ? easeOutCubic(Math.min(1, elapsed / GATHER_MS)) : 1
            const formed = phase !== "scatter"
            // factor de interpolacion hacia el objetivo: arranca suave y termina firme
            const follow = phase === "gather" ? 0.025 + gatherProgress * 0.13 : 0.16
            const followDt = (1 - Math.pow(1 - follow, dt)) / dt
            const drag = Math.pow(0.968, dt)
            const info = {
                phase,
                shapeElapsed: now - shapeStart,
                holdElapsed: phase === "hold" ? elapsed : 0,
            }

            ctx.lineCap = "round"

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                p.px = p.x
                p.py = p.y

                if (formed) {
                    const t = shape.animate(targets[i], now, info)
                    const wobble = phase === "hold" ? 0.0025 : 0
                    const tx =
                        offsetX + (t.x + Math.sin(now / 600 + p.jitter) * wobble) * scale
                    const ty =
                        offsetY + (t.y + Math.cos(now / 700 + p.jitter) * wobble) * scale

                    p.vx = (tx - p.x) * followDt
                    p.vy = (ty - p.y) * followDt
                } else {
                    p.vx *= drag
                    p.vy *= drag
                    // remolino suave mientras se dispersan
                    const dx = p.x - width / 2
                    const dy = p.y - height / 2
                    p.vx += -dy * 0.0006 * dt
                    p.vy += dx * 0.0006 * dt
                }

                // repulsion del cursor
                const mdx = p.x - mouse.x
                const mdy = p.y - mouse.y
                const mdist = mdx * mdx + mdy * mdy
                if (mdist < 110 * 110) {
                    const d = Math.sqrt(mdist) || 1
                    const force = (110 - d) / 110
                    p.vx += (mdx / d) * force * 1.6 * dt
                    p.vy += (mdy / d) * force * 1.6 * dt
                }

                let speed = Math.hypot(p.vx, p.vy)
                if (speed > MAX_SPEED) {
                    p.vx *= MAX_SPEED / speed
                    p.vy *= MAX_SPEED / speed
                    speed = MAX_SPEED
                }

                p.x += p.vx * dt
                p.y += p.vy * dt
                p.speed = speed
                p.fade = fadeAt(p.x, p.y)
            }

            drawLinks(formed ? 1 : 0.6)

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                if (p.fade < 0.02) continue
                const speed = p.speed
                const edge = targets[i] && targets[i].edge
                const baseAlpha = formed ? (edge ? 0.95 : 0.55) : 0.7
                const alpha = Math.min(1, baseAlpha + speed * 0.05) * p.fade

                // estela: linea desde la posicion anterior
                if (speed > 0.8) {
                    ctx.beginPath()
                    ctx.moveTo(p.px - p.vx, p.py - p.vy)
                    ctx.lineTo(p.x, p.y)
                    ctx.strokeStyle = `rgba(${p.color}, ${Math.min(0.45, speed * 0.06) * p.fade})`
                    ctx.lineWidth = p.r * 0.9
                    ctx.stroke()
                }

                // halo
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.12})`
                ctx.fill()

                // nucleo
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color}, ${alpha})`
                ctx.fill()
            }
        }

        const loop = (now) => {
            renderFrame(now)
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

        const renderStatic = () => {
            // sin animacion: coloca todo directamente sobre la silueta
            phase = "hold"
            phaseStart = 0
            shapeStart = -CHART_DRAW_MS * 2
            for (let i = 0; i < particles.length; i++) {
                const t = SHAPES[shapeIndex].animate(targets[i], 0, {
                    phase,
                    shapeElapsed: CHART_DRAW_MS * 2,
                    holdElapsed: 0,
                })
                particles[i].x = offsetX + t.x * scale
                particles[i].y = offsetY + t.y * scale
                particles[i].vx = 0
                particles[i].vy = 0
            }
            renderFrame(0)
        }

        applyOverscan()
        resize()
        canvas.dataset.shape = SHAPES[shapeIndex].name
        setPhase("gather", performance.now())
        shapeStart = phaseStart

        if (reduceMotion) {
            renderStatic()
            const resizeObserver = new ResizeObserver(() => {
                resize()
                renderStatic()
            })
            resizeObserver.observe(container)
            return () => resizeObserver.disconnect()
        }

        // dibuja un primer frame de inmediato para que el canvas nunca quede
        // en blanco si la pestaña o la seccion aun no son visibles
        renderFrame(performance.now())

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

        window.addEventListener("mousemove", onMouseMove, { passive: true })
        document.addEventListener("mouseleave", onMouseLeave)
        document.addEventListener("visibilitychange", onVisibilityChange)

        const resizeObserver = new ResizeObserver(() => resize())
        resizeObserver.observe(container)

        return () => {
            stop()
            window.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseleave", onMouseLeave)
            document.removeEventListener("visibilitychange", onVisibilityChange)
            resizeObserver.disconnect()
            visibilityObserver.disconnect()
        }
    }, [maxParticles, overscan])

    return (
        <canvas
            ref={canvasRef}
            className={className}
            role="img"
            aria-label={label}
        />
    )
}

export default ParticleMorph
