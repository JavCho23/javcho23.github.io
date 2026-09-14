import { ArrowUpRight } from "lucide-react"

import { useReveal } from "../hooks/useReveal"
import { useTilt } from "../hooks/useTilt"

const GRADIENT_VARIANTS = ["one", "two", "three", "four"]

function WorkItem({ work, index, featured = false }) {
    const revealRef = useReveal(index * 0.1)
    const tiltRef = useTilt()
    const variant = GRADIENT_VARIANTS[index % GRADIENT_VARIANTS.length]
    const Icon = work.icon
    const isExternal = work.link !== "#"

    return (
        <div
            ref={revealRef}
            className={`reveal work__item${featured ? " work__item--featured" : ""}`}
        >
            <a
                href={work.link}
                target={isExternal ? "_blank" : undefined}
                rel="noreferrer"
                className="work__link"
            >
                <article ref={tiltRef} className="work__card tilt-card">
                    {work.image ? (
                        <div className="work__banner work__banner--image">
                            <img
                                src={work.image}
                                alt={`Captura de pantalla del proyecto ${work.name}`}
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className={`work__banner work__banner--${variant}`}>
                            <span className="work__banner-icon">
                                <Icon strokeWidth={1.5} aria-hidden="true" />
                            </span>
                        </div>
                    )}
                    <div className="work__body">
                        <header className="work__header">
                            <span className="work__tag">{work.tag}</span>
                            <h3 className="work__title">
                                {work.name}
                                {isExternal && (
                                    <ArrowUpRight
                                        className="work__title-arrow"
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                )}
                            </h3>
                        </header>
                        <p className="work__description">{work.description}</p>
                        <ul className="work__stack">
                            {work.stack.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </article>
            </a>
        </div>
    )
}

export default WorkItem
