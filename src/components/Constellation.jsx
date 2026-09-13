import { useCallback, useEffect, useId, useRef, useState } from "react"

import "../assets/css/Constellation.css"

// Each star sits at a different "depth": deeper stars move less with the
// scroll, closer ones move more, which is what sells the parallax.
const DEPTHS = [0.6, 1.3, 0.8, 1.5, 1.0, 0.7, 1.2]
const SIDES = [1, -1, 1, -1, 1, -1, 1]
const DRIFT_DURATIONS = [7.5, 9, 6.5, 8.2, 7, 9.5, 6.8]

// Max travel (in % of the stage) across the whole scroll range. Kept small
// so stars near the edges never drift into the header or footer slots.
const PARALLAX_Y = 9
const PARALLAX_X = 4

const BURST_COLORS = ["76, 110, 245", "202, 220, 252", "255, 255, 255", "102, 131, 255"]
const BURST_COUNT = 56

const COMPACT_QUERY = "(max-width: 899px)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

// Title, description and tags for one star. Every piece carries its own
// stagger index so the CSS can choreograph the reveal each time it mounts
// (mobile) or becomes active (desktop).
function Copy({ point, index, count }) {
    const words = point.title.split(" ")
    const tags = point.tags ?? []

    return (
        <span className="constellation__copy" style={{ "--words": words.length }}>
            <span className="constellation__copy-kicker">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <span className="constellation__copy-title">
                {words.map((word, wordIndex) => (
                    <span
                        key={`${word}-${wordIndex}`}
                        className="constellation__word"
                        style={{ "--w": wordIndex }}
                    >
                        <span>{word}</span>
                    </span>
                ))}
            </span>
            <span className="constellation__copy-description">
                {point.description}
            </span>
            {tags.length > 0 && (
                <span className="constellation__copy-tags">
                    {tags.map((tag, tagIndex) => (
                        <span
                            key={tag}
                            className="constellation__tag"
                            style={{ "--t": tagIndex }}
                        >
                            {tag}
                        </span>
                    ))}
                </span>
            )}
        </span>
    )
}

function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches
    )

    useEffect(() => {
        const media = window.matchMedia(query)
        const onChange = (event) => setMatches(event.matches)
        setMatches(media.matches)
        media.addEventListener("change", onChange)
        return () => media.removeEventListener("change", onChange)
    }, [query])

    return matches
}

// On narrow screens the hand-placed coordinates don't fit, so the stars are
// re-laid out as a zigzag across the top of the stage and the active text
// takes the space underneath.
function compactLayout(points) {
    const last = Math.max(points.length - 1, 1)
    return points.map((point, index) => ({
        ...point,
        x: points.length === 1 ? 50 : 12 + (index * 76) / last,
        y: index % 2 === 0 ? 20 : 34,
    }))
}

function Constellation({ points, layout = "scatter", header = null, footer = null }) {
    const rootRef = useRef(null)
    const stickyRef = useRef(null)
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)
    const burstRef = useRef(null)
    const positionedRef = useRef([])
    const previousActive = useRef(null)
    const gradientId = useId()

    const compact = useMediaQuery(COMPACT_QUERY)
    const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY)

    const [entered, setEntered] = useState(false)
    const [progress, setProgress] = useState(0)

    const count = points.length
    const basePoints = compact ? compactLayout(points) : points

    // Scroll progress through the tall wrapper drives which item is active
    // and how far each star has travelled.
    useEffect(() => {
        const root = rootRef.current
        const sticky = stickyRef.current
        if (!root || !sticky) return

        let ticking = false

        const update = () => {
            const rect = root.getBoundingClientRect()
            const range = rect.height - sticky.offsetHeight
            const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0
            const next = range > 0 ? clamp((stickyTop - rect.top) / range, 0, 1) : 0
            setProgress((current) =>
                Math.abs(current - next) < 0.002 ? current : next
            )
            ticking = false
        }

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(update)
                ticking = true
            }
        }

        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [])

    // The first star only lights up once the stage is actually on screen.
    useEffect(() => {
        const node = viewportRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setEntered(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.4 }
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    // Particle burst: a tiny canvas simulation that only runs while there
    // are live particles, spawned from the star that just became active.
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        let particles = []
        let frame = null

        const tick = () => {
            const dpr = window.devicePixelRatio || 1
            const width = canvas.clientWidth
            const height = canvas.clientHeight
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, width, height)

            particles = particles.filter((p) => p.life > 0)
            for (const p of particles) {
                p.life -= p.decay
                if (p.ring) {
                    p.r += p.speed
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                    ctx.strokeStyle = `rgba(76, 110, 245, ${Math.max(p.life, 0) * 0.6})`
                    ctx.lineWidth = 2 * Math.max(p.life, 0.05)
                    ctx.stroke()
                    continue
                }
                p.x += p.vx
                p.y += p.vy
                p.vx *= 0.955
                p.vy *= 0.955
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * Math.max(p.life, 0.05), 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color}, ${Math.max(p.life, 0)})`
                ctx.fill()
            }

            frame = particles.length ? requestAnimationFrame(tick) : null
        }

        burstRef.current = (xPercent, yPercent) => {
            const dpr = window.devicePixelRatio || 1
            const width = canvas.clientWidth
            const height = canvas.clientHeight
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr
                canvas.height = height * dpr
            }
            const x = (xPercent / 100) * width
            const y = (yPercent / 100) * height

            for (let i = 0; i < BURST_COUNT; i++) {
                const angle = Math.random() * Math.PI * 2
                const speed = 1.5 + Math.random() * 5
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    r: 1 + Math.random() * 2.4,
                    life: 1,
                    decay: 0.012 + Math.random() * 0.02,
                    color: BURST_COLORS[i % BURST_COLORS.length],
                })
            }
            particles.push({ ring: true, x, y, r: 12, speed: 4.5, life: 1, decay: 0.03 })

            if (frame === null) frame = requestAnimationFrame(tick)
        }

        return () => {
            if (frame !== null) cancelAnimationFrame(frame)
            burstRef.current = null
        }
    }, [])

    const scrollIndex = clamp(Math.floor(progress * count), 0, count - 1)
    const activeIndex = entered ? scrollIndex : null
    const active = activeIndex !== null ? basePoints[activeIndex] : null

    useEffect(() => {
        if (activeIndex === null || activeIndex === previousActive.current) return
        previousActive.current = activeIndex
        if (reduceMotion) return
        const star = positionedRef.current[activeIndex]
        if (star) burstRef.current?.(star.px, star.py)
    }, [activeIndex, reduceMotion])

    // Clicking a star scrolls the page to the spot where that star becomes
    // the active one, so each star doubles as an anchor.
    const scrollToIndex = useCallback(
        (index) => {
            const root = rootRef.current
            const sticky = stickyRef.current
            if (!root || !sticky) return

            const range = root.offsetHeight - sticky.offsetHeight
            const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0
            const rootTop = root.getBoundingClientRect().top + window.scrollY
            const target = rootTop - stickyTop + ((index + 0.5) / count) * range
            window.scrollTo({ top: target, behavior: "smooth" })
        },
        [count]
    )

    const centered = progress - 0.5
    const positioned = basePoints.map((point, index) => ({
        ...point,
        px: point.x + centered * SIDES[index % SIDES.length] * PARALLAX_X,
        py: point.y - centered * DEPTHS[index % DEPTHS.length] * PARALLAX_Y,
    }))
    positionedRef.current = positioned

    const linePath = positioned
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.px} ${p.py}`)
        .join(" ")

    const rootClass = [
        "constellation",
        `constellation--${layout}`,
        entered ? "is-entered" : "",
        active ? "has-active" : "",
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <div
            ref={rootRef}
            className={rootClass}
            style={{
                "--steps": count,
                "--focus-x": active ? active.x : 50,
                "--focus-y": active ? active.y : 50,
            }}
        >
            <div ref={stickyRef} className="constellation__sticky">
                {header && <div className="constellation__header">{header}</div>}

                <div ref={viewportRef} className="constellation__viewport">
                    <div className="constellation__stage">
                        <svg
                            className="constellation__lines"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <defs>
                                <linearGradient
                                    id={gradientId}
                                    x1="0"
                                    y1="0"
                                    x2="100"
                                    y2="0"
                                >
                                    <stop offset="0%" stopColor="var(--primary-color)" />
                                    <stop offset="100%" stopColor="var(--secondary-color)" />
                                </linearGradient>
                            </defs>
                            <path
                                d={linePath}
                                fill="none"
                                stroke={`url(#${gradientId})`}
                                strokeWidth="0.3"
                                strokeDasharray="1 2"
                            />
                        </svg>

                        <canvas
                            ref={canvasRef}
                            className="constellation__burst"
                            aria-hidden="true"
                        />

                        {positioned.map((point, index) => {
                            const isActive = index === activeIndex
                            const Icon = point.icon
                            // Stars low in the stage get their copy beside
                            // them (toward the stage centre) instead of above,
                            // so the text never climbs into the header slot.
                            const low = point.y > 60
                            const classes = [
                                "constellation__star",
                                !low && point.x < 25 ? "constellation__star--left" : "",
                                !low && point.x > 75 ? "constellation__star--right" : "",
                                low && point.x >= 50 ? "constellation__star--side-left" : "",
                                low && point.x < 50 ? "constellation__star--side-right" : "",
                                isActive ? "is-active" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")

                            return (
                                <button
                                    key={point.title}
                                    type="button"
                                    className={classes}
                                    style={{
                                        left: `${point.px}%`,
                                        top: `${point.py}%`,
                                        "--index": index,
                                        "--star-delay": `${index * 0.5}s`,
                                        "--drift-dur": `${
                                            DRIFT_DURATIONS[index % DRIFT_DURATIONS.length]
                                        }s`,
                                    }}
                                    onClick={() => scrollToIndex(index)}
                                    aria-current={isActive ? "true" : undefined}
                                >
                                    <span className="constellation__star-body">
                                        <span className="constellation__star-core">
                                            <Icon
                                                className="constellation__star-icon"
                                                strokeWidth={1.75}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="constellation__star-text">
                                            <span className="constellation__star-label">
                                                {point.title}
                                            </span>
                                            <Copy point={point} index={index} count={count} />
                                        </span>
                                    </span>
                                </button>
                            )
                        })}

                        {active && (
                            <div key={activeIndex} className="constellation__focus">
                                <Copy point={active} index={activeIndex} count={count} />
                            </div>
                        )}
                    </div>
                </div>

                {footer && <div className="constellation__footer">{footer}</div>}
            </div>
        </div>
    )
}

export default Constellation
