import { useReveal } from "../hooks/useReveal"
import { useTilt } from "../hooks/useTilt"

const GRADIENT_VARIANTS = ["one", "two", "three", "four"]

function WorkItem({ work, index }) {
    const revealRef = useReveal(index * 0.1)
    const tiltRef = useTilt()
    const variant = GRADIENT_VARIANTS[index % GRADIENT_VARIANTS.length]

    return (
        <div ref={revealRef} className="reveal">
            <a
                href={work.link}
                target={work.link === "#" ? undefined : "_blank"}
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
                            <span className="work__banner-icon">{work.icon}</span>
                        </div>
                    )}
                    <div className="work__body">
                        <header className="work__header">
                            <span className="work__tag">{work.tag}</span>
                            <h3 className="work__title">{work.name}</h3>
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
