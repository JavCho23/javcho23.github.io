import "../assets/css/Process.css"
import "../assets/css/View.css"

import { Ear, Rocket, Target } from "lucide-react"

import Constellation from "../components/Constellation"

const steps = [
    {
        icon: Ear,
        tags: ["Reunión inicial", "Sin compromiso"],
        title: "Te escucho",
        description: "Entiendo qué te duele hoy y cuáles son tus necesidades reales.",
        x: 12,
        y: 50,
    },
    {
        icon: Target,
        tags: ["Alcance claro", "Presupuesto cerrado"],
        title: "Planteamos el alcance juntos",
        description:
            "Definimos la solución ideal y nos ponemos manos a la obra rápido.",
        x: 50,
        y: 50,
    },
    {
        icon: Rocket,
        tags: ["Entregas semanales", "Feedback continuo"],
        title: "Entrego valor rápido",
        description:
            "Si el proyecto es más robusto, avanzamos con entregas recurrentes desde el inicio.",
        x: 88,
        y: 50,
    },
]

function Process() {
    return (
        <section id="process" className="process view">
            <Constellation
                layout="line"
                points={steps}
                header={
                    <>
                        <span className="kicker">¿Cómo trabajo?</span>
                        <h2 className="title">Entregando valor desde el día uno</h2>
                    </>
                }
            />
        </section>
    )
}

export default Process
