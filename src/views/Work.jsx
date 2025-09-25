import "../assets/css/Work.css"
import "../assets/css/View.css"

import React from "react"
import WorkItem from "../components/WorkItem"

import { TimelineMax } from "gsap"
import ScrollMagic from "scrollmagic"

const works = [
    {
        img: "./assets/img/work/inbox.png",
        name: "Alegra",
        link: "https://alegra.com",
        descriptions: [
            <p className="work__description">
                Alegra es una startup que ofrece distintas soluciones a las empresas para potenciar su crecimiento, les damos superpoderes.
            </p>,
            <p className="work__description">
                Actualmente <strong>pertenezco</strong> al equipo de ingeniería de Alegra, como <strong>Engineering Manager</strong> liderando a los equipos de desarrollo de los productos adicionales a la plataforma principal.
            </p>,
            <p className="work__description">
                El <strong>stack</strong> con el que trabajo en Alegra, es principalmente JavaScript, construyendo microservicios orientados a eventos con servicios de AWS como Lambda, SQS, SNS, etc.
            </p>,
        ],
    },
    {
        img: "./assets/img/work/inbox.png",
        name: "Ticker",
        link: "https://beexcc.com/conversations-v2",
        descriptions: [
            <p className="work__description">
                Ticker (ex Inbox) es una plataforma <strong>omnicanal</strong>, que facilita
                la comunicación entre empresas y sus clientes.
            </p>,
            <p className="work__description">
                Ayudé a construir funcionalidades de chatbot y de cobro de suscripciones, para que funcione como un SASS self service.
            </p>,
            <p className="work__description">
                El <strong>stack</strong> con el que trabajé en Ticker es Vue.js,
                Adonis.js, MongoDB, Socket.io y Express.js.
            </p>,
        ],
    },
    {
        img: "./assets/img/work/personal-page.png",
        name: "Personal page",
        link: "/",
        descriptions: [
            <p className="work__description">
                Mi página <strong>personal</strong> es un proyecto que ansiaba
                poner en marcha, y aún está en desarrollo, aquí es donde puedo
                mostrar mis principales trabajos y describir mis habilidades.
            </p>,
            <p className="work__description">
                Realicé esta página usando <strong>React</strong> por la gran
                curiosidad que tenía de probar esta librería y agregarla a mi
                portafolio.
            </p>,
        ],
    },
    {
        img: "./assets/img/work/buscapatas.png",
        link: "http://www.buscapatas.org",
        name: "Buscapatas",
        descriptions: [
            <p className="work__description">
                Buscapatas es una plataforma de <strong>adopción</strong> y
                donación para el banco de alimentos y mascotas del Perú.
            </p>,
            <p className="work__description">
                <strong>Lideré</strong> el equipo de backend, en donde
                desarrollamos una API Rest usando servicios de{" "}
                <strong>AWS</strong>, principalmente funciones Lambda en
                JavaScript, APIGateway y S3.
            </p>,
        ],
    },
    {
        img: "./assets/img/work/gerencia-gestar.png",
        link: "#",
        name: "GerenciaGestar",
        descriptions: [
            <p className="work__description">
                GerenciaGestar es una aplicación <strong>gerencial</strong> para
                Invitro gestar, que consume datos de su ERP para poder obtener
                reportes de su balance.
            </p>,
            <p className="work__description">
                Me encargué del <strong>backend</strong> de esta aplicación
                trabajando con vanilla PHP.
            </p>,
        ],
    },
    {
        img: "./assets/img/work/securitec-music.png",
        link: "https://securitec-music.herokuapp.com",
        name: "SecuritecMusic",
        descriptions: [
            <p className="work__description">
                Securitec music es una <strong>API Rest</strong> que administra
                Artistas, albums y canciones.
            </p>,
            <p className="work__description">
                Fue realizado como una prueba de ingreso al equipo de Inbox, en
                la cual puede demostrar mis <strong>habilidades</strong> como
                backend developer.
            </p>,
            <p className="work__description">
                Para realizar esta utilicé Express.js y MySql, basandome en una
                arquitectura <strong>hexagonal</strong>.
            </p>,
        ],
    },
]
class Work extends React.Component {
    componentDidMount() {
        this.controller = new ScrollMagic.Controller()
        const movePercent = 100 / works.length
        const wipeAnimation = new TimelineMax()
        for (let index = 1; index < works.length; index++) {
            wipeAnimation.to("#worksContainer", 1, {
                x: `-${index * movePercent}%`,
            }) // move in to first panel
        }

        // create scene to pin and link animation
        new ScrollMagic.Scene({
            triggerElement: "#work",
            triggerHook: "onLeave",
            duration: works.length + "00%",
        })
            .setPin("#work")
            .setTween(wipeAnimation)
            .addTo(this.controller)
    }
    selectWork(work) {
        this.controller.scrollTo(`#${work}`)
        console.log(this.controller)
    }

    render() {
        return (
            <section id="work" className="work view">
                <h2 className="subtitle">Mi trabajo</h2>

                <div className="works">
                    <div
                        id="worksContainer"
                        style={{ width: works.length + "00%" }}
                        className="works__container"
                    >
                        {works.map((work) => (
                            <WorkItem key={work.name} work={work} />
                        ))}
                    </div>
                </div>
                {/* <div className="works__buttons">
                    {works.map((work) => (
                        <button
                            key={work.name}
                            onClick={() => {
                                this.selectWork(work.name.replace(" ", ""))
                            }}
                            className="work__button"
                        >
                            {work.name}
                        </button>
                    ))}
                </div> */}
            </section>
        )
    }
}
export default Work
