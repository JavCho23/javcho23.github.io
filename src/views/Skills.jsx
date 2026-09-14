import "../assets/css/Skills.css"
import "../assets/css/View.css"

import { useReveal } from "../hooks/useReveal"
import { useTilt } from "../hooks/useTilt"

const skills = [
    {
        img: "js",
        scene: "code",
        name: "Fullstack development",
        tags: ["Microservicios", "Event-driven", "Alta disponibilidad"],
        descriptions: [
            "Tenemos conocimientos avanzados para el frontend y backend, especialmente en JavaScript.",
            "Nos especializamos en construir microservicios orientados a eventos y que soportan un tráfico alto, habiéndonos enfrentado a grandes desafíos en el manejo de tráfico y alta disponibilidad.",
        ],
    },
    {
        img: "mysql",
        scene: "data",
        name: "Databases",
        tags: ["PostgreSQL", "MySQL", "NeonDB" , "NoSQL", "Diseño de datos"],
        descriptions: [
            "Nos hemos encargado del diseño y administración de la base de datos, trabajando principalmente con PostgreSQL y opciones en la nube.",
            "Tenemos conocimientos para administrar bases de datos relacionales como PostgreSQL y no relacionales como MongoDB, su autoescalado y alta disponibilidad.",
        ],
    },
    {
        img: "aws",
        scene: "cloud",
        name: "Cloud services",
        tags: [ "AWS Certified", "Serverless", "GCP", "Vercel"],
        descriptions: [
            "La infraestructura a demanda y auto-escalable es el futuro y estamos alineados con ello. Hemos desarrollado microservicios con infraestructura serverless usando Lambda, API Gateway y CloudFormation.",
            "Estamos certificados en AWS como Cloud Solutions Architect, con más de 4 años de experiencia en infraestructura como código y servicios en la nube.",
        ],
    },
]

const pad = (n) => String(n).padStart(2, "0")

// Fake code lines: width and indent (in % / em) plus typing delay.
const CODE_LINES = [
    { w: 62, indent: 0 },
    { w: 44, indent: 1 },
    { w: 78, indent: 1 },
    { w: 36, indent: 2 },
    { w: 56, indent: 1 },
    { w: 28, indent: 0 },
]

// Each skill gets its own backdrop so the three rows don't read as copies:
// an editor card for code, stacked cylinders on a dot grid for data, soft
// cloud blobs with drifting cubes for cloud.
function Scene({ scene }) {
    if (scene === "code") {
        return (
            <span className="skill__card">
                {CODE_LINES.map((line, index) => (
                    <i
                        key={index}
                        style={{
                            "--w": `${line.w}%`,
                            "--indent": line.indent,
                            "--d": `${index * 0.35}s`,
                        }}
                    />
                ))}
            </span>
        )
    }
    if (scene === "data") {
        return (
            <>
                <span className="skill__grid" />
                <span className="skill__cyl skill__cyl--one" />
                <span className="skill__cyl skill__cyl--two" />
                <span className="skill__cyl skill__cyl--three" />
            </>
        )
    }
    return (
        <>
            <span className="skill__cloud" />
            <span className="skill__link skill__link--one" />
            <span className="skill__link skill__link--two" />
            <span className="skill__cube skill__cube--one" />
            <span className="skill__cube skill__cube--two" />
            <span className="skill__cube skill__cube--three" />
        </>
    )
}

function SkillRow({ skill, index, count }) {
    const revealRef = useReveal(0.1)
    const tiltRef = useTilt()
    const iconSrc = new URL(
        `../assets/svg/techs/${skill.img}.svg`,
        import.meta.url
    ).href
    const number = pad(index + 1)

    return (
        <div ref={revealRef} className="reveal skill__reveal">
            <article
                ref={tiltRef}
                className={`skill__row${index % 2 ? " skill__row--flip" : ""}`}
                style={{ "--float-delay": `${index * 0.7}s` }}
            >
                <div
                    className={`skill__visual skill__visual--${skill.scene}`}
                    aria-hidden="true"
                >
                    <Scene scene={skill.scene} />
                    <span className="skill__number">{number}</span>
                    <img className="skill__image" src={iconSrc} alt="" />
                </div>

                <div className="skill__content">
                    <span className="skill__kicker">
                        {number} / {pad(count)}
                    </span>
                    <h3 className="skill__title">{skill.name}</h3>
                    {skill.descriptions.map((text) => (
                        <p key={text} className="skill__description">
                            {text}
                        </p>
                    ))}
                    <ul className="skill__tags">
                        {skill.tags.map((tag) => (
                            <li key={tag} className="skill__tag">
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            </article>
        </div>
    )
}

function Skills() {
    return (
        <section id="skills" className="skill view">
            <span className="kicker">Nuestras habilidades</span>
            <h2 className="title">Con qué construimos</h2>

            <div className="skills">
                {skills.map((skill, index) => (
                    <SkillRow
                        key={skill.name}
                        skill={skill}
                        index={index}
                        count={skills.length}
                    />
                ))}
            </div>
        </section>
    )
}
export default Skills
