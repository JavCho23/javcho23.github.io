import logo from "../assets/svg/logo.svg"

import "../assets/css/Header.css"

function Header() {
    return (
        <header className="header">
            <a href="#home">
                <img className="header__logo" src={logo} alt="{ Jav }" />
            </a>

            <div className="header__items">
                <a href="#skills" className="header__item">
                    Habilidades
                </a>
                <a href="#work" className="header__item">
                    Trabajo
                </a>
                <a href="mailto:me@javcho.com" className="header__item">
                    Contacto
                </a>
            </div>
        </header>
    )
}

export default Header
