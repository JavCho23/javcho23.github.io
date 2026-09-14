import "../assets/css/Work.css"
import "../assets/css/View.css"

import { Building2, House } from "lucide-react"

import WorkItem from "../components/WorkItem"

const works = [
    {
        name: "Alegra",
        tag: "Rol actual",
        icon: Building2,
        featured: true,
        link: "https://alegra.com",
        stack: ["JavaScript", "AWS Lambda", "SQS", "SNS"],
        description:
            "En Alegra, Javier lidera como Gerente de Ingeniería la construcción de productos independientes, cubriendo todo el ciclo de vida del usuario, incluido el cobro recurrente.",
    },
    {
        name: "HolaDepa",
        tag: "Proyecto freelance",
        icon: House,
        link: "#",
        stack: ["Web app", "Simulador de crédito"],
        description:
            "HolaDepa evalúa departamentos en Lima con más de 20 criterios objetivos, para que inversionistas y compradores decidan con datos y no solo con intuición. Construimos y pusimos en marcha la plataforma completa, incluido el simulador de crédito hipotecario, en menos de un mes.",
    },
    {
        name: "Ticker",
        tag: "Proyecto freelance",
        image: "/assets/img/work/inbox.png",
        link: "https://beexcc.com/conversations-v2",
        stack: ["Chatbot", "Cobro self-service"],
        description:
            "Esta plataforma omnicanal necesitaba automatizar la atención al cliente y el cobro de suscripciones. Construimos el chatbot y el flujo de cobro self-service, eliminando la intervención manual del equipo.",
    },
    {
        name: "GerenciaGestar",
        tag: "Proyecto freelance",
        image: "/assets/img/work/gerencia-gestar.png",
        link: "#",
        stack: ["Integración ERP", "Reportes"],
        description:
            "Invitro Gestar necesitaba ver el balance de su empresa sin pedir reportes manuales cada vez. Construimos la aplicación que se conecta directo a su ERP y genera los reportes automáticamente.",
    },
    {
        name: "Buscapatas",
        tag: "Proyecto anterior",
        image: "/assets/img/work/buscapatas.png",
        link: "http://www.buscapatas.org",
        stack: ["AWS Lambda", "API Gateway", "S3"],
        description:
            "Plataforma de adopción y donación para el banco de alimentos y mascotas del Perú. Lideramos el equipo de backend, construyendo una API REST sobre servicios de AWS.",
    },
    {
        name: "SecuritecMusic",
        tag: "Proyecto anterior",
        image: "/assets/img/work/securitec-music.png",
        link: "https://securitec-music.herokuapp.com",
        stack: ["Express.js", "MySQL", "Arquitectura hexagonal"],
        description:
            "API REST para administrar artistas, álbumes y canciones, con una arquitectura hexagonal sobre Express.js y MySQL.",
    },
]

function Work() {
    return (
        <section id="work" className="work view">
            <span className="kicker">Trayectoria</span>
            <h2 className="title">Algunos proyectos en los que hemos trabajado</h2>

            <div className="works">
                {works.map((work, index) => (
                    <WorkItem
                        key={work.name}
                        work={work}
                        index={index}
                        featured={Boolean(work.featured)}
                    />
                ))}
            </div>
        </section>
    )
}

export default Work
