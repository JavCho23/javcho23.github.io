import homeDraw from "../assets/img/home-draw.png"
import logo from "../assets/svg/logo.svg"
import twitter from "../assets/svg/social/twitter.svg"
import github from "../assets/svg/social/github.svg"
import linkedin from "../assets/svg/social/linkedin.svg"

import arrow from "../assets/svg/arrow-down.svg"
import "../assets/css/Home.css"
import "../assets/css/View.css"
function Home() {
    return (
        <section id="home" className="home view">
            <img className="home__draw" src={homeDraw} alt="Inicio" />
            <img className="home__logo" src={logo} alt="{ Jav }" />
            <p className="home__description">
                Programador, geek, futuro emprendedor
            </p>
            <div className="home__social-media">
                <a
                    href="https://twitter.com/javcho23"
                    target="_blank"
                    rel="noreferrer"
                >
                    <img
                        className="home__social-media-item"
                        src={twitter}
                        alt="Twiiter"
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
                        alt="Linkedin"
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
                        alt="Github"
                    />
                </a>
            </div>
            <a className="home__footer" href="#work">
                <span> Mira mi trabajo</span>
                <img className="home__arrow" src={arrow} alt=""  />
            </a>
        </section>
    )
}

export default Home
