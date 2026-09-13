import { useEffect, useRef } from "react"

const MAX_TILT = 6

export function useTilt() {
    const ref = useRef(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const onMove = (event) => {
            const rect = node.getBoundingClientRect()
            const x = (event.clientX - rect.left) / rect.width - 0.5
            const y = (event.clientY - rect.top) / rect.height - 0.5
            node.style.setProperty("--tilt-y", `${x * MAX_TILT * 2}deg`)
            node.style.setProperty("--tilt-x", `${y * -MAX_TILT * 2}deg`)
        }

        const onLeave = () => {
            node.style.setProperty("--tilt-x", "0deg")
            node.style.setProperty("--tilt-y", "0deg")
        }

        node.addEventListener("mousemove", onMove)
        node.addEventListener("mouseleave", onLeave)
        return () => {
            node.removeEventListener("mousemove", onMove)
            node.removeEventListener("mouseleave", onLeave)
        }
    }, [])

    return ref
}
