const createJobCard = job => {
    return `
        <article class="job-card">
            <header class="job-card__header">
                <div class="job-card__info">
                    <h3 class="job-card__charge">${job.charge}</h3>
                    <p class="job-card__company">${job.company}</p>
                </div>
                <span class="job-card__period">${job.period}</span>
            </header>
            <div class="job-card__location">
                ${job.location}
            </div>
            <div class="job-card__body">
                <h4 class="job-card__subtitle">Logros</h4>
                <ul class="job-card__achievements">
                    ${job.achievements
                        .map(item => `<li class="job-card__achievement">${item}</li>`)
                        .join("")}
                </ul>
            </div>
        </article>
    `;
};

const loadJobExperience = () => {
    const container = document.getElementById("job-grid");
    if (!container) return;
    
    fetch("/static/data/jobExperience.json")
        .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .then(data => {
            const jobs = Array.isArray(data.jobs) ? data.jobs : [];
            if (!jobs.length) {
                container.innerHTML = `<p class="empty-state">Aún no hay proyectos publicados.</p>`;
                return;
            }
            const jobCardsHTML = jobs.map(job => createJobCard(job)).join("");
            container.innerHTML = jobCardsHTML;
        })
        .catch(error => {
            console.error("Error al cargar la experiencia laboral:", error);
            container.innerHTML = `<p class="error-message">Hubo un problema al cargar la información. Por favor, intenta de nuevo más tarde.</p>`;
        });
};

loadJobExperience();