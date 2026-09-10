import React from "react"
import ReactDOM from "react-dom/client"
import { Analytics } from "@vercel/analytics/react"
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
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Header />
        <main>
            <Home />
            <About />
            <Work />
            <Skills />
        </main>
        <Footer />
        <Analytics />
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
