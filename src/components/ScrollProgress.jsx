import { useEffect, useRef } from "react"

function ScrollProgress() {
    const barRef = useRef(null)

    useEffect(() => {
        const bar = barRef.current
        let ticking = false

        const update = () => {
            const scrollTop = window.scrollY
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            bar.style.width = `${percent}%`
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

    return (
        <div className="scroll-progress">
            <div ref={barRef} className="scroll-progress__bar" />
        </div>
    )
}

export default ScrollProgress
