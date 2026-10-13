function createProjectCard(project) {
  const featuredBadge = project.featured
    ? `<span class="project-featured-badge">Destacado</span>`
    : "";

  const tags = (project.tags || [])
    .map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`)
    .join("");

  const demoUrl = safeUrl(project.url);
  const demoLink = demoUrl
    ? `<a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Ver demo</a>`
    : "";

  const repoUrl = safeUrl(project.repo);
  const repoLink = repoUrl
    ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Código →</a>`
    : "";

  return `
    <article class="project-card${project.featured ? " is-featured" : ""}" data-reveal>
      <div class="project-card-image">
        ${featuredBadge}
        <img src="${escapeHtml(project.image)}" alt="Captura de ${escapeHtml(project.name)}" loading="lazy" />
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${escapeHtml(project.name)}</h3>
        <p class="project-card-desc">${escapeHtml(project.description)}</p>
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
