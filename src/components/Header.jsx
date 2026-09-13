import logo from "../assets/svg/logo.svg"

import "../assets/css/Header.css"

import { useGlow } from "../hooks/useGlow"

function Header() {
    const glowRef = useGlow()

    return (
        <header className="header">
            <a href="#home">
                <img className="header__logo" src={logo} alt="{ Jav }" />
            </a>

            <nav className="header__items">
                <a href="#services" className="header__item">
                    Servicios
                </a>
                <a href="#work" className="header__item">
                    Proyectos
                </a>
                <a href="#about" className="header__item">
                    Sobre mí
                </a>
            </nav>

            <a ref={glowRef} href="#contact" className="header__cta glow-btn">
                Hablemos
            </a>
        </header>
    )
}

export default Header
