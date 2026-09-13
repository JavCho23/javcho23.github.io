import React from "react"
import ReactDOM from "react-dom/client"
import { Analytics } from "@vercel/analytics/react"
import "./assets/css/index.css"
import Header from "./components/Header"
import ScrollProgress from "./components/ScrollProgress"
import GlobalParticles from "./components/GlobalParticles"
import Home from "./views/Home"
import Services from "./views/Services"
import Process from "./views/Process"
import Work from "./views/Work"
import About from "./views/About"
import Skills from "./views/Skills"
import Contact from "./views/Contact"
import Footer from "./components/Footer"
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
