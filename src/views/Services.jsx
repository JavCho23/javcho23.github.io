import "../assets/css/Services.css"
import "../assets/css/View.css"

import { Bot, Monitor, Plug, Workflow, Wrench } from "lucide-react"

import { useGlow } from "../hooks/useGlow"
import Constellation from "../components/Constellation"

const services = [
    {
        icon: Workflow,
        tags: ["Reportes", "Notificaciones", "Flujos con IA"],
        title: "Automatización de procesos",
        description:
            "Elimino tareas manuales y repetitivas: reportes, notificaciones, sincronización entre herramientas, flujos o funcionalidades de IA.",
        x: 12,
        y: 25,
    },
    {
        icon: Plug,
        tags: ["Pagos", "WhatsApp", "Hojas de cálculo", "ERP"],
        title: "Integraciones y APIs",
        description:
            "Conecto las herramientas que ya usas: pagos, mensajería, hojas de cálculo, ERPs.",
        x: 38,
        y: 14,
    },
    {
        icon: Monitor,
        tags: ["Paneles", "E-commerce", "SaaS"],
        title: "Webs y apps a medida",
        description:
            "Productos, paneles y sitios con lógica propia, listos para crecer con tu negocio.",
        x: 68,
        y: 20,
    },
    {
        icon: Bot,
        tags: ["Atención 24/7", "Ventas", "Soporte"],
        title: "Creación de agentes de IA",
        description:
            "Diseño y desarrollo agentes de IA a medida que automatizan conversaciones, atención al cliente y tareas operativas de tu negocio.",
        x: 85,
        y: 55,
    },
    {
        icon: Wrench,
        tags: ["Inventario", "CRM", "Operaciones"],
        title: "Sistemas internos",
        description:
            "Herramientas a medida para gestionar tu operación día a día.",
        x: 52,
        y: 76,
    },
]

function Services() {
    const glowRef = useGlow()

    return (
        <section id="services" className="services view">
            <Constellation
                layout="scatter"
                points={services}
                header={
                    <>
                        <span className="kicker">¿Cómo puedo ayudarte?</span>
                        <h2 className="title">Lo que podemos hacer juntos</h2>
                        <p className="services__lead">
                            ¿Sabías que los procesos que te quitan horas cada
                            semana se pueden reducir hasta un{" "}
                            <strong>99%</strong>? ¿Tu sistema ya no se ajusta a
                            tus objetivos? Diseño y desarrollo software y flujos
                            de IA a medida para negocios de cualquier tamaño.
                        </p>
                    </>
                }
                footer={
                    <a
                        ref={glowRef}
                        href="https://wa.me/51989912874"
                        target="_blank"
                        rel="noreferrer"
                        className="services__cta-button glow-btn"
                    >
                        Cuéntame tu proyecto
                    </a>
                }
            />
        </section>
    )
}

export default Services
