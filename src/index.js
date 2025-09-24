import React from "react"
import ReactDOM from "react-dom"
import "./assets/css/index.css"
import Header from "./components/Header"
import Home from "./views/Home"
import Work from "./views/Work"
import About from "./views/About"
import Skills from "./views/Skills"
import Footer from "./components/Footer"
import reportWebVitals from "./reportWebVitals"

import { TimelineMax, TweenMax } from "gsap"
import ScrollMagic from "scrollmagic"
import { ScrollMagicPluginGsap } from "scrollmagic-plugin-gsap"

ScrollMagicPluginGsap(ScrollMagic, TweenMax, TimelineMax)
ReactDOM.render(
    <React.StrictMode>
        <Header />
        <Home />
        <About />
        <Work />
        <Skills />
        <Footer />
    </React.StrictMode>,
    document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
