import { useEffect, useRef } from "react"

export function useGlow() {
    const ref = useRef(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        const onMove = (event) => {
            const rect = node.getBoundingClientRect()
            node.style.setProperty("--mx", `${event.clientX - rect.left}px`)
            node.style.setProperty("--my", `${event.clientY - rect.top}px`)
        }

        node.addEventListener("mousemove", onMove)
        return () => node.removeEventListener("mousemove", onMove)
    }, [])

    return ref
}
