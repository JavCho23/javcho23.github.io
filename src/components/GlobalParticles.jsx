import { useEffect, useRef } from "react"

const PARTICLE_COLORS = ["76, 110, 245", "202, 220, 252", "30, 39, 97"]
const LINK_DISTANCE = 130
const MOUSE_RADIUS = 160
const MAX_PARTICLES = 220
const DENSITY = 6000

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

function GlobalParticles() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

        let width = 0
        let height = 0
        let particles = []
        let animationId = null
        const mouse = { x: -9999, y: -9999 }

        // En movil, ocultar/mostrar la barra del navegador al hacer scroll
        // dispara "resize" constantemente. En vez de recrear las particulas
        // (lo que se ve como un reinicio del fondo), se conservan y se
        // reescalan a las nuevas dimensiones.
        const resize = () => {
            const prevWidth = width
            const prevHeight = height
            width = canvas.clientWidth || window.innerWidth
            height = canvas.clientHeight || window.innerHeight
            canvas.width = width
            canvas.height = height
            const count = Math.min(
                MAX_PARTICLES,
                Math.floor((width * height) / DENSITY)
            )

            if (!particles.length || !prevWidth || !prevHeight) {
                particles = createParticles(width, height, count)
                return
            }

            const sx = width / prevWidth
            const sy = height / prevHeight
            for (const p of particles) {
                p.x *= sx
                p.y *= sy
            }
            if (particles.length > count) {
                particles.length = count
            } else if (particles.length < count) {
                particles.push(
                    ...createParticles(width, height, count - particles.length)
                )
            }
        }

        const onMouseMove = (event) => {
            mouse.x = event.clientX
            mouse.y = event.clientY
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

        const onVisibilityChange = () => {
            if (document.hidden) stop()
            else start()
        }

        resize()
        start()

        if (!reduceMotion) {
            window.addEventListener("mousemove", onMouseMove)
            window.addEventListener("mouseleave", onMouseLeave)
        }
        window.addEventListener("resize", resize)
        document.addEventListener("visibilitychange", onVisibilityChange)

        return () => {
            stop()
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseleave", onMouseLeave)
            window.removeEventListener("resize", resize)
            document.removeEventListener("visibilitychange", onVisibilityChange)
        }
    }, [])

    return <canvas ref={canvasRef} className="global-particles" />
}

export default GlobalParticles
