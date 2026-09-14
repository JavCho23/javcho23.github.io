import { useEffect, useRef } from "react"

export function useReveal(delay = 0) {
    const ref = useRef(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        node.style.setProperty("--reveal-delay", `${delay}s`)

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            node.classList.add("is-visible")
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    node.classList.add("is-visible")
                    observer.disconnect()
                }
            },
            { threshold: 0.15 }
        )
        observer.observe(node)

        return () => observer.disconnect()
    }, [delay])

    return ref
}
