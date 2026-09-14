import "../assets/css/About.css"
import "../assets/css/View.css"

import { useReveal } from "../hooks/useReveal"
import GravityField from "../components/GravityField"

import photo from "../assets/img/me-2025-cutout.webp"
import linkedinIcon from "../assets/svg/social/linkedin.svg"
import githubIcon from "../assets/svg/social/github.svg"

// Photo inset inside the stage; GravityField's innerRadius must match
// (1 - 2 * inset) so orbits start just outside the photo.
const PHOTO_INSET = 0.06

const highlights = [
    "Gerente de Ingeniería",
    "AWS Certified",
    "Líder de equipos",
    "Autodidacta",
]

function About() {
    const revealRef = useReveal()

    return (
        <section id="about" className="about view">
            <span className="kicker">Sobre mí</span>
            <h2 className="title">Quién está detrás</h2>

            <div ref={revealRef} className="reveal about__reveal">
                <article className="about__row">
                    {/* Particles orbit the photo like a gravity field (the
                        back half hides behind it) while the logo braces,
                        also made of particles, frame it: { foto }. */}
                    <div
                        className="about__stage"
                        style={{ "--inset": `${PHOTO_INSET * 100}%` }}
                    >
                        <GravityField
                            className="about__particles"
                            label="Partículas orbitando alrededor de la foto de Javier Chávez, enmarcada por las llaves del logo"
                            innerRadius={1 - PHOTO_INSET * 2}
                        />
                        <div className="about__photo-wrap">
                            <img
                                className="about__photo"
                                src={photo}
                                alt="Javier Chávez"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <div className="about__content">
                        <span className="about__kicker">Javier Chávez</span>
                        <h3 className="about__title">
                            Al frente del proyecto · Gerente de Ingeniería
                        </h3>

                        <ul className="about__tags">
                            {highlights.map((tag) => (
                                <li key={tag} className="about__tag">
                                    {tag}
                                </li>
                            ))}
                        </ul>

                        <p className="about__description">
                            Soy Javier y estoy al frente de este proyecto.
                            Desarrollador de <strong>software</strong> peruano,
                            autodidacta y con una fuerte habilidad de
                            pensamiento lógico. He liderado equipos de
                            desarrollo construyendo productos de alta calidad,
                            disponibles y escalables que soportan la demanda de
                            negocios reales.
                        </p>
                        <p className="about__description">
                            Actualmente trabajo con{" "}
                            <a
                                href="https://www.alegra.com/"
                                className="about__link"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Alegra
                            </a>{" "}
                            como <strong>Gerente de Ingeniería</strong>, liderando
                            los productos adicionales a la plataforma principal,
                            y soy{" "}
                            <strong>
                                AWS Certified Cloud Solutions Architect
                            </strong>
                            . Traigo ese mismo nivel de exigencia a cada
                            proyecto que entregamos: defino la dirección técnica,
                            superviso cada entrega y, además de mis
                            conocimientos técnicos, aporto una fuerte habilidad
                            para la gestión de proyectos y la toma de
                            decisiones.
                        </p>

                        <div className="about__social">
                            <a
                                href="https://linkedin.com/in/javcho23"
                                className="about__social-link"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img src={linkedinIcon} alt="" />
                                Conóceme en LinkedIn
                            </a>
                            <a
                                href="https://github.com/javcho23"
                                className="about__social-link"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img src={githubIcon} alt="" />
                                Mis proyectos en GitHub
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    )
}
export default About
