import "../assets/css/Services.css"
import "../assets/css/View.css"

const services = [
    {
        name: "Webs y apps a medida",
        description:
            "Sitios y aplicaciones web hechas a la medida de tu negocio, rápidas, seguras y listas para crecer con vos.",
    },
    {
        name: "Automatización de procesos",
        description:
            "Si haces algo manual y repetitivo todas las semanas, probablemente se puede automatizar. Te ayudo a recuperar ese tiempo.",
    },
    {
        name: "Sistemas internos",
        description:
            "Herramientas a medida para gestionar tu operación: inventario, reportes, seguimiento de clientes, lo que tu negocio necesite.",
    },
    {
        name: "Integraciones y APIs",
        description:
            "Conecto las herramientas que ya usas (pagos, mensajería, hojas de cálculo, ERPs) para que trabajen juntas.",
    },
]

function Services() {
    return (
        <section id="services" className="services view">
            <h2 className="subtitle">Servicios</h2>
            <article className="services__intro">
                <span className="title">Software a medida para tu negocio</span>
                <p>
                    ¿Tienes una idea, un proceso manual que te quita horas, o
                    un sistema que ya no da abasto? Diseño y desarrollo
                    software a medida para negocios de cualquier tamaño y
                    rubro, desde una web simple hasta sistemas internos
                    completos.
                </p>
                <p className="services__badge">
                    Actualmente lidero equipos de producto como{" "}
                    <strong>Engineering Manager en Alegra</strong>. Traigo ese
                    mismo nivel de calidad y compromiso a proyectos freelance
                    para negocios que necesitan una solución a medida.
                </p>
            </article>

            <div className="services__grid">
                {services.map((service) => (
                    <div key={service.name} className="service__card">
                        <h3 className="service__title">{service.name}</h3>
                        <p className="service__description">
                            {service.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="services__cta">
                <a
                    href="https://t.me/javcho23"
                    target="_blank"
                    rel="noreferrer"
                    className="services__cta-button"
                >
                    Cuéntame tu proyecto
                </a>
            </div>
        </section>
    )
}

export default Services
