import "../assets/css/Skills.css"
import "../assets/css/View.css"

import { useReveal } from "../hooks/useReveal"
import { useTilt } from "../hooks/useTilt"

const skills = [
    {
        img: "js",
        name: "Fullstack development",
        descriptions: [
            "Actualmente tengo conocimientos avanzados para el frontend y backend, especialmente en JavaScript.",
            "Me especializo en construir microservicios orientados a eventos y que soportan un tráfico alto, habiéndome enfrentado a grandes desafíos en el manejo de tráfico y alta disponibilidad.",
        ],
    },
    {
        img: "mysql",
        name: "Databases",
        descriptions: [
            "En la mayoría de proyectos en los que he trabajado, me he encargado del diseño y administración de la base de datos, trabajando principalmente con MySQL.",
            "Tengo conocimientos para administrar bases de datos relacionales como MySQL y no relacionales como MongoDB, su autoescalado y alta disponibilidad.",
        ],
    },
    {
        img: "aws",
        name: "Cloud services",
        descriptions: [
            "La infraestructura a demanda y auto-escalable es el futuro. He desarrollado microservicios con infraestructura serverless usando Lambda, API Gateway y CloudFormation.",
            "Soy AWS Certified Cloud Solutions Architect, con más de 4 años de experiencia en infraestructura como código y servicios de AWS.",
        ],
    },
]

function SkillCard({ skill, index }) {
    const revealRef = useReveal(index * 0.1)
    const tiltRef = useTilt()
    const iconSrc = new URL(
        `../assets/svg/techs/${skill.img}.svg`,
        import.meta.url
    ).href

    return (
        <div ref={revealRef} className="reveal">
            <article
                ref={tiltRef}
                className="skill__card tilt-card"
                style={{ "--float-delay": `${index * 0.4}s` }}
            >
                <img
                    className="skill__watermark"
                    src={iconSrc}
                    alt=""
                    aria-hidden="true"
                />
                <div className="skill__icon-wrap">
                    <img
                        className="skill__image"
                        src={iconSrc}
                        alt={skill.name}
                        loading="lazy"
                    />
                </div>
                <h3 className="skill__title">{skill.name}</h3>
                {skill.descriptions.map((text) => (
                    <p key={text} className="skill__description">
                        {text}
                    </p>
                ))}
            </article>
        </div>
    )
}

function Skills() {
    return (
        <section id="skills" className="skill view">
            <span className="kicker">Mis habilidades</span>
            <h2 className="title">Con qué construyo</h2>

            <div className="skills">
                {skills.map((skill, index) => (
                    <SkillCard key={skill.name} skill={skill} index={index} />
                ))}
            </div>
        </section>
    )
}
export default Skills
