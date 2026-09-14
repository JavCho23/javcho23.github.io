import React from "react"
import ReactDOM from "react-dom/client"
import { Analytics } from "@vercel/analytics/react"
import "./shared/styles/index.css"
import Header from "./shared/components/Header"
import ScrollProgress from "./shared/components/ScrollProgress"
import GlobalParticles from "./shared/components/GlobalParticles"
import Home from "./modules/home"
import Services from "./modules/services"
import Process from "./modules/process"
import Work from "./modules/work"
import About from "./modules/about"
import Skills from "./modules/skills"
import Contact from "./modules/contact"
import Footer from "./shared/components/Footer"
import reportWebVitals from "./reportWebVitals"

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GlobalParticles />
        <ScrollProgress />
        <Header />
        <main>
            <Home />
            <Services />
            <Process />
            <Work />
            <Skills />
            <About />
            <Contact />
        </main>
        <Footer />
        <Analytics />
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
