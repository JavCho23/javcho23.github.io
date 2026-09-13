import "../assets/css/About.css"
import "../assets/css/View.css"

import { useReveal } from "../hooks/useReveal"

import jsIcon from "../assets/svg/techs/js.svg"
import awsIcon from "../assets/svg/techs/aws.svg"
import mysqlIcon from "../assets/svg/techs/mysql.svg"

function About() {
    const revealRef = useReveal()

    return (
        <section id="about" className="about view">
            <span className="about__bracket" aria-hidden="true">
                {"{ }"}
            </span>

            <img
                className="about__badge about__badge--one"
                src={jsIcon}
                alt=""
                aria-hidden="true"
            />
            <img
                className="about__badge about__badge--two"
                src={awsIcon}
                alt=""
                aria-hidden="true"
            />
            <img
                className="about__badge about__badge--three"
                src={mysqlIcon}
                alt=""
                aria-hidden="true"
            />

            <span className="kicker">Sobre mí</span>
            <article ref={revealRef} className="about__container reveal">
                <h2 className="title about__title">Javier Chávez</h2>
                <p className="about__description">
                    Soy un desarrollador de <strong>software</strong> peruano,
                    autodidacta y con una fuerte habilidad de pensamiento
                    lógico. He liderado equipos de desarrollo construyendo
                    productos de alta calidad, disponibles y escalables que
                    soportan la demanda de negocios reales.
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
                    como <strong>Engineering Manager</strong>, liderando los
                    productos adicionales a la plataforma principal, y soy{" "}
                    <strong>AWS Certified Cloud Solutions Architect</strong>.
                    Traigo ese mismo nivel de exigencia a cada proyecto
                    freelance: además de mis conocimientos técnicos, tengo una
                    fuerte habilidad para la gestión de proyectos y la toma de
                    decisiones.
                </p>
                <p className="about__description">
                    Si quieres conocer más sobre mí puedes seguirme en{" "}
                    <a
                        href="https://linkedin.com/in/javcho23"
                        className="about__link"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <strong>LinkedIn</strong>
                    </a>{" "}
                    y para encontrar todos mis proyectos puedes visitar mi{" "}
                    <a
                        href="https://github.com/javcho23"
                        className="about__link"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <strong>GitHub</strong>
                    </a>
                </p>
            </article>
        </section>
    )
}
export default About
