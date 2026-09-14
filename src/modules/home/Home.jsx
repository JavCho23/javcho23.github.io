import logo from "../../shared/assets/svg/logo.svg"
import twitter from "../../shared/assets/svg/social/twitter.svg"
import github from "../../shared/assets/svg/social/github.svg"
import linkedin from "../../shared/assets/svg/social/linkedin.svg"
import arrow from "./assets/arrow-down.svg"

import ParticleMorph from "./components/ParticleMorph"

import "./Home.css"
import "../../shared/styles/View.css"

import { useGlow } from "../../shared/hooks/useGlow"

function Home() {
    const glowRef = useGlow()

    return (
        <section id="home" className="view home">
            <div className="home__layout">
                <div className="home__draw">
                    <ParticleMorph
                        className="home__particles"
                        label="Animación de partículas que forman un cohete, un robot, engranajes, una gráfica de crecimiento, una idea, un rayo y el logo de Jav"
                    />
                </div>

                <div className="home__content">
                    <img className="home__logo" src={logo} alt="{ Jav }" />
                    <h1 className="home__title">
                        Software que impulsa tu negocio
                    </h1>

                    <div className="home__social-media">
                        <a
                            href="https://twitter.com/javcho23"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img
                                className="home__social-media-item"
                                src={twitter}
                                alt="Twitter"
                            />
                        </a>
                        <a
                            href="https://linkedin.com/in/javcho23"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img
                                className="home__social-media-item"
                                src={linkedin}
                                alt="LinkedIn"
                            />
                        </a>
                        <a
                            href="https://github.com/javcho23"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img
                                className="home__social-media-item"
                                src={github}
                                alt="GitHub"
                            />
                        </a>
                    </div>
                </div>
            </div>

            <a
                ref={glowRef}
                className="home__footer glow-btn"
                href="#services"
                aria-label="Ir a servicios"
            >
                <img className="home__arrow" src={arrow} alt="" />
            </a>
        </section>
    )
}

export default Home
