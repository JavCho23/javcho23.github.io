import "../assets/css/Contact.css"
import "../assets/css/View.css"

import { Mail } from "lucide-react"

import { useReveal } from "../hooks/useReveal"
import { useGlow } from "../hooks/useGlow"
import ParticleField from "../components/ParticleField"

function Contact() {
    const revealRef = useReveal()
    const primaryGlowRef = useGlow()
    const secondaryGlowRef = useGlow()
    const emailGlowRef = useGlow()

    return (
        <section id="contact" className="contact view">
            <ParticleField className="contact__particles" />
            <div ref={revealRef} className="reveal contact__content">
                <h2 className="title">
                    ¿Conversamos sobre lo que podemos lograr?
                </h2>
                <p className="contact__subtitle">Sin compromiso ;)</p>

                <div className="contact__cta-group">
                    <a
                        ref={primaryGlowRef}
                        href="https://wa.me/51989912874"
                        target="_blank"
                        rel="noreferrer"
                        className="contact__cta contact__cta--primary glow-btn"
                    >
                        Escríbeme por WhatsApp
                    </a>
                    <a
                        ref={secondaryGlowRef}
                        href="https://linkedin.com/in/javcho23"
                        target="_blank"
                        rel="noreferrer"
                        className="contact__cta contact__cta--secondary glow-btn"
                    >
                        LinkedIn
                    </a>
                    <a
                        ref={emailGlowRef}
                        href="mailto:me@javcho.com"
                        className="contact__cta contact__cta--secondary glow-btn"
                    >
                        <Mail className="contact__cta-icon" />
                        Correo
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Contact
