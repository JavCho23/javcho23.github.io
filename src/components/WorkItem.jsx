function WorkItem({ work }) {
    return (
        <div id={work.name.replace(" ", "")} className="work__container">
            <div className="work__item">
                <img
                    className="work__image"
                    src={work.img}
                    alt={`Captura de pantalla del proyecto ${work.name}`}
                    loading="lazy"
                />
                <article className="work__details">
                    <header className="work__header">
                        <span className="work__subtitle">Mi trabajo</span>
                        <a href={work.link} target="_blank" rel="noreferrer">
                            <h3 className="work__title title">{work.name}</h3>
                        </a>
                    </header>
                    {work.descriptions.map((description) => description)}
                </article>
            </div>
        </div>
    )
}

export default WorkItem
