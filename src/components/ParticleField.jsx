import { useEffect, useRef } from "react"

const PARTICLE_COLORS = ["76, 110, 245", "202, 220, 252", "30, 39, 97"]
const LINK_DISTANCE = 130
const MOUSE_RADIUS = 160

function createParticles(width, height, count) {
    const particles = []
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: 1 + Math.random() * 1.8,
            color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        })
    }
    return particles
}

function ParticleField({ className, maxParticles = 90, density = 9000 }) {
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
        let particles = []
        let animationId = null
        let isVisible = false
        const mouse = { x: -9999, y: -9999 }

        const resize = () => {
            width = container.clientWidth
            height = container.clientHeight
            canvas.width = width
            canvas.height = height
            const count = Math.min(
                maxParticles,
                Math.floor((width * height) / density)
            )
            particles = createParticles(width, height, count)
        }

        const onMouseMove = (event) => {
            const rect = container.getBoundingClientRect()
            mouse.x = event.clientX - rect.left
            mouse.y = event.clientY - rect.top
        }

        const onMouseLeave = () => {
            mouse.x = -9999
            mouse.y = -9999
        }

        const renderFrame = () => {
            ctx.clearRect(0, 0, width, height)

            if (mouse.x > -100) {
                const glow = ctx.createRadialGradient(
                    mouse.x,
                    mouse.y,
                    0,
                    mouse.x,
                    mouse.y,
                    MOUSE_RADIUS * 1.4
                )
                glow.addColorStop(0, "rgba(76, 110, 245, 0.3)")
                glow.addColorStop(1, "rgba(76, 110, 245, 0)")
                ctx.fillStyle = glow
                ctx.beginPath()
                ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 1.4, 0, Math.PI * 2)
                ctx.fill()
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                p.x += p.vx
                p.y += p.vy

                if (p.x < 0 || p.x > width) p.vx *= -1
                if (p.y < 0 || p.y > height) p.vy *= -1

                const dx = p.x - mouse.x
                const dy = p.y - mouse.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                let radius = p.r
                let opacity = 0.5
                if (dist < MOUSE_RADIUS) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
                    radius = p.r + force * 2
                    opacity = 0.5 + force * 0.5
                    p.x += (dx / (dist || 1)) * force * 0.6
                    p.y += (dy / (dist || 1)) * force * 0.6
                }

                ctx.beginPath()
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color}, ${opacity})`
                ctx.fill()

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j]
                    const ddx = p.x - q.x
                    const ddy = p.y - q.y
                    const d = Math.sqrt(ddx * ddx + ddy * ddy)
                    if (d < LINK_DISTANCE) {
                        ctx.beginPath()
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(q.x, q.y)
                        ctx.strokeStyle = `rgba(202, 220, 252, ${
                            0.12 * (1 - d / LINK_DISTANCE)
                        })`
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                }
            }
        }

        const loop = () => {
            renderFrame()
            animationId = requestAnimationFrame(loop)
        }

        const start = () => {
            if (reduceMotion) {
                renderFrame()
                return
            }
            if (animationId) return
            animationId = requestAnimationFrame(loop)
        }

        const stop = () => {
            if (animationId) {
                cancelAnimationFrame(animationId)
                animationId = null
            }
        }

        resize()

        const visibilityObserver = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting
                if (isVisible) start()
                else stop()
            },
            { threshold: 0.05 }
        )
        visibilityObserver.observe(container)

        if (!reduceMotion) {
            container.addEventListener("mousemove", onMouseMove)
            container.addEventListener("mouseleave", onMouseLeave)
        }

        const resizeObserver = new ResizeObserver(() => {
            resize()
            if (reduceMotion || isVisible) renderFrame()
        })
        resizeObserver.observe(container)

        return () => {
            stop()
            container.removeEventListener("mousemove", onMouseMove)
            container.removeEventListener("mouseleave", onMouseLeave)
            resizeObserver.disconnect()
            visibilityObserver.disconnect()
        }
    }, [maxParticles, density])

    return <canvas ref={canvasRef} className={className} />
}

export default ParticleField
