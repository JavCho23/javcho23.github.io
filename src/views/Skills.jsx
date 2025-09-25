import "../assets/css/Skills.css"
import "../assets/css/View.css"

import React from "react"
import { TimelineMax } from "gsap"
import ScrollMagic from "scrollmagic"

const skills = [
    {
        img: "./assets/svg/techs/js.svg",
        name: "Fullstack development",
        descriptions: [
            {
                text:
                    "Actualmente tengo conocimientos avanzados para el frontend y backend, especialmente en JavaScript.",
            },
            {
                text:
                    "Me especializo en construir microservicios orientados a eventos y que soporten un trafico alto, habiendome enfrentado a grandes desafios en el manejo de trafico y alta disponibilidad.",
            },
        ],
    },
    {
        img: "./assets/svg/techs/mysql.svg",
        name: "Databases",
        descriptions: [
            {
                text:
                    "En la mayoría de proyectos que he trabajado, me he encargado del diseño y administración de la base de datos, trabajando principalmente con MySql.",
            },
            {
                text:
                    "Tengo conocimientos para administrar bases de datos relacionales como MySql y no relacionales como MongoDB, su autoescalado y alta disponibilidad.",
            },
        ],
    },
    {
        img: "./assets/svg/techs/aws.svg",
        name: "Cloud services",
        descriptions: [
            {
                text:
                    "La infraestructura a demanda, y auto-escalable es el futuro, y decidí aprender a administrarla. He desarrollado microservicios con una infraestructura serveless usando Lambda, APIGateway y CloudFormation, Teniendo así más tiempo para mejorar la calidad de mi código.",
            },
            {
                text:
                    "Soy un Asociate Cloud Solutions Architect certificado por AWS, y tengo más de 4 años de experiencia en el manejo de infraestructura como codigo y el uso de servicios de AWS.",
            },
        ],
    },
]
class Skills extends React.Component {
    componentDidMount() {
        const controller = new ScrollMagic.Controller()
        const movePercent = 100 / skills.length
        const wipeAnimation = new TimelineMax()
        for (let index = 1; index < skills.length; index++) {
            wipeAnimation.to("#skillsContainer", 1, {
                x: `-${index * movePercent}%`,
            }) // move in to first panel
        }

        // create scene to pin and link animation
        new ScrollMagic.Scene({
            triggerElement: "#skills",
            triggerHook: "onLeave",
            duration: skills.length + "00%",
        })
            .setPin("#skills")
            .setTween(wipeAnimation)
            .addTo(controller)
    }

    render() {
        return (
            <section id="skills" className="skill view">
                <h2 className="subtitle">Mis habilid</h2>

                <div className="skills">
                    <div
                        id="skillsContainer"
                        style={{ width: skills.length + "00%" }}
                        className="skills__container"
                    >
                        {skills.map((skill) => (
                            <div key={skill.name} className="skill__container">
                                <div className="skill__item">
                                    <img
                                        className="skill__image"
                                        src={skill.img}
                                        alt=""
                                    />
                                    <article className="skill__details">
                                        <header className="skill__header">
                                            <span className="skill__subtitle">
                                                Mis habilidades
                                            </span>
                                            <h3 className="skill__title title">
                                                {skill.name}
                                            </h3>
                                        </header>
                                        {skill.descriptions.map(
                                            (description) => (
                                                <p
                                                    key={description.text}
                                                    className={
                                                        "skill__description " +
                                                        description.class
                                                    }
                                                >
                                                    {description.text}
                                                </p>
                                            )
                                        )}
                                    </article>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }
}
export default Skills
