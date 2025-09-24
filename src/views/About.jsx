import "../assets/css/About.css"
import "../assets/css/View.css"
import me from "../assets/img/me-2025.png"
function About() {
    return (
        <section id="about" className="about view">
            <h2 className="subtitle">Sobre mí</h2>
            <article className="about__container">
                <header className="about__header">
                    <img className="about__image" src={me} alt="" />
                </header>
                <div className="about__content">
                    <span className="about__title title">Sobre mí</span>
                    <p className="about__description about__current">
                        Actualmente estoy trabajando como{" "}
                        <a
                            href="https://www.alegra.com/"
                            className="about__link"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Alegra
                        </a>{" "}
                        como <strong>Engineering Manager</strong>, liderando los productos adicionales a la plataforma principal.
                    </p>
                    <p className="about__description">
                        ¿Qué tal amigos? ¿Como están?. Mi nombre es{" "}
                        <strong>Javier Chávez</strong>, soy un desarrollador de{" "}
                        <strong>software</strong> peruano. Me considero una
                        persona autodidactica y con una fuerte habilidad de
                        pensamiento lógico
                    </p>
                    <p className="about__description">
                        He liderado y lidero equipos de desarrollo de software en donde he trabajado con diferentes tecnologías construyendo productos de alta calidad, disponibles y escalables que soporten la demanda de nuestros clientes, además de mis conocimientos técnicos, tengo una fuerte habilidad para la gestión de proyectos y la toma de decisiones.
                    </p>
                    <p className="about__description">
                        Si quieres conocer más sobre mí puedes seguirme en {" "}
                        <a
                            href="https://linkedin.com/in/javcho23"
                            className="about__link"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <strong>Linkedin</strong>
                        </a>{" "}
                        y para encontrar todos mis proyectos puedes visitar mi
                        visitar mi{" "}
                        <a
                            href="https://github.com/javcho23"
                            className="about__link"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <strong>GitHub</strong>
                        </a>
                    </p>
                </div>
            </article>
        </section>
    )
}
export default About
