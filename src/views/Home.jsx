import logo from "../assets/svg/logo.svg"
import twitter from "../assets/svg/social/twitter.svg"
import github from "../assets/svg/social/github.svg"
import linkedin from "../assets/svg/social/linkedin.svg"
import arrow from "../assets/svg/arrow-down.svg"

import ParticleMorph from "../components/ParticleMorph"

import "../assets/css/Home.css"
import "../assets/css/View.css"

import { useGlow } from "../hooks/useGlow"

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

            <a ref={glowRef} className="home__footer glow-btn" href="#services">
                <img className="home__arrow" src={arrow} alt="" />
            </a>
        </section>
    )
}

export default Home
