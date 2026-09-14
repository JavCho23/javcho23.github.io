import "../assets/css/Work.css"
import "../assets/css/View.css"

import { Building2, House, ShoppingCart  } from "lucide-react"

import WorkItem from "../components/WorkItem"

import inboxImg from "../assets/img/work/inbox.png"
import gerenciaGestarImg from "../assets/img/work/gerencia-gestar.png"
import buscapatasImg from "../assets/img/work/buscapatas.png"

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
        tag: "CTO",
        icon: House,
        link: "https://holadepa.pe",
        stack: ["Web app", "Simulador de crédito"],
        description:
            "HolaDepa evalúa departamentos en Lima con más de 20 criterios objetivos, para que inversionistas y compradores decidan con datos y no solo con intuición. Construimos y pusimos en marcha la plataforma completa, incluido el simulador de crédito hipotecario, en menos de un mes.",
    },
    {
        name: "Perlas y Diamantes",
        tag: "Tienda online",
        icon: ShoppingCart,
        link: "#",
        stack: ["Web app", "E-commerce"],
        description:
            "Perlas y Diamantes es una tienda online que ofrece una amplia selección de joyas y accesorios. Desarrollamos la plataforma completa, incluyendo el sistema de gestión de inventario y el proceso de compra con confirmación por WhatsApp.",
    },
    {
        name: "Ticker",
        tag: "Proyecto freelance",
        image: inboxImg,
        link: "https://beexcc.com/conversations-v2",
        stack: ["Chatbot", "Cobro self-service"],
        description:
            "Esta plataforma omnicanal necesitaba automatizar la atención al cliente y el cobro de suscripciones. Construimos el chatbot y el flujo de cobro self-service, eliminando la intervención manual del equipo.",
    },
    {
        name: "GerenciaGestar",
        tag: "Proyecto freelance",
        image: gerenciaGestarImg,
        link: "#",
        stack: ["Integración ERP", "Reportes"],
        description:
            "Invitro Gestar necesitaba ver el balance de su empresa sin pedir reportes manuales cada vez. Construimos la aplicación que se conecta directo a su ERP y genera los reportes automáticamente.",
    },
    {
        name: "Buscapatas",
        tag: "Proyecto anterior",
        image: buscapatasImg,
        link: "http://www.buscapatas.org",
        stack: ["AWS Lambda", "API Gateway", "S3"],
        description:
            "Plataforma de adopción y donación para el banco de alimentos y mascotas del Perú. Lideramos el equipo de backend, construyendo una API REST sobre servicios de AWS.",
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
