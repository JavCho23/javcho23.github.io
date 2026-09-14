import "../assets/css/Contact.css"
import "../assets/css/View.css"

import { Handshake, Mail, MessageCircle } from "lucide-react"

import { useReveal } from "../hooks/useReveal"
import { useGlow } from "../hooks/useGlow"
import { useTilt } from "../hooks/useTilt"
import ParticleField from "../components/ParticleField"

// Contact channels laid out as signals around the core, on opposite sides of
// the outer ring (x/y are % of the stage). Social networks live in the
// footer, so only the direct channels sit here.
const channels = [
    {
        label: "WhatsApp",
        href: "https://wa.me/51989912874",
        icon: <MessageCircle />,
        x: 82,
        y: 24,
    },
    {
        label: "Correo",
        href: "mailto:me@javcho.com",
        icon: <Mail />,
        x: 18,
        y: 76,
    },
]

function Contact() {
    const revealRef = useReveal()
    const tiltRef = useTilt()
    const glowRef = useGlow()

    return (
        <section id="contact" className="contact view">
            <ParticleField className="contact__particles" />

            <div ref={revealRef} className="reveal contact__reveal">
                {/* useTilt writes --tilt-x/--tilt-y on the row; the
                    constellation reads them. */}
                <article ref={tiltRef} className="contact__row">
                    <div className="contact__content">
                        <span className="kicker">Contacto</span>
                        <h2 className="title contact__title">
                            ¿Conversamos sobre lo que podemos lograr?
                        </h2>
                        <p className="contact__subtitle">Sin compromiso ;)</p>

                        <a
                            ref={glowRef}
                            href="https://wa.me/51989912874"
                            target="_blank"
                            rel="noreferrer"
                            className="contact__cta glow-btn"
                        >
                            <MessageCircle className="contact__cta-icon" />
                            Escríbenos por WhatsApp
                        </a>
                        <p className="contact__hint">
                            O, si lo prefieres, escríbenos un correo.
                        </p>
                    </div>

                    <nav
                        className="contact__visual"
                        aria-label="Canales de contacto"
                    >
                        <span className="contact__halo" aria-hidden="true" />
                        <span
                            className="contact__orbit contact__orbit--outer"
                            aria-hidden="true"
                        >
                            <i />
                        </span>
                        <span
                            className="contact__orbit contact__orbit--inner"
                            aria-hidden="true"
                        >
                            <i />
                        </span>

                        <svg
                            className="contact__lines"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            {channels.map((channel) => (
                                <line
                                    key={channel.label}
                                    x1="50"
                                    y1="50"
                                    x2={channel.x}
                                    y2={channel.y}
                                />
                            ))}
                        </svg>

                        {/* The core is the conversation itself: a handshake
                            sending out pings, not the brand (that's already in
                            header and footer). */}
                        <span className="contact__ping" aria-hidden="true" />
                        <span
                            className="contact__ping contact__ping--late"
                            aria-hidden="true"
                        />
                        <span className="contact__core" aria-hidden="true">
                            <Handshake />
                        </span>

                        {channels.map((channel, index) => (
                            <a
                                key={channel.label}
                                href={channel.href}
                                target={
                                    channel.href.startsWith("mailto:")
                                        ? undefined
                                        : "_blank"
                                }
                                rel="noreferrer"
                                className={`contact__node${
                                    channel.primary
                                        ? " contact__node--primary"
                                        : ""
                                }`}
                                style={{
                                    "--x": `${channel.x}%`,
                                    "--y": `${channel.y}%`,
                                    "--i": index,
                                }}
                            >
                                <span className="contact__node-core">
                                    {channel.icon}
                                </span>
                                <span className="contact__node-label">
                                    {channel.label}
                                </span>
                            </a>
                        ))}
                    </nav>
                </article>
            </div>
        </section>
    )
}

export default Contact
