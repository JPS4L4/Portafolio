function createProjectCard(project) {
  const featuredBadge = project.featured
    ? `<span class="project-featured-badge">Destacado</span>`
    : "";

  const tags = (project.tags || [])
    .map(tag => `<span class="project-tag">${tag}</span>`)
    .join("");

  const demoLink = project.url
    ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Ver demo</a>`
    : "";

  const repoLink = project.repo
    ? `<a href="${project.repo}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Código →</a>`
    : "";

  return `
    <article class="project-card" data-reveal>
      ${featuredBadge}
      <div class="project-card-image">
        <img src="${project.image}" alt="Captura de ${project.name}" loading="lazy" />
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${project.name}</h3>
        <p class="project-card-desc">${project.description}</p>
        <div class="project-tags">${tags}</div>
        <div class="project-card-links">
          ${demoLink}
          ${repoLink}
        </div>
      </div>
    </article>
  `;
}

function loadProjects() {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  fetch("/static/data/projects.json")
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      const projects = Array.isArray(data.projects) ? data.projects : [];

      if (!projects.length) {
        container.innerHTML = `<p class="empty-state">Aún no hay proyectos publicados.</p>`;
        return;
      }

      // Destacados primero
      const sorted = [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      container.innerHTML = sorted.map(createProjectCard).join("");

      // Reactiva las animaciones data-reveal para las tarjetas nuevas
      if (typeof observeNewRevealElements === "function") {
        observeNewRevealElements(container);
      }
    })
    .catch(() => {
      container.innerHTML = `
        <div class="repo-error">
          <p>No se pudieron cargar los proyectos.</p>
        </div>`;
    });
}

loadProjects();