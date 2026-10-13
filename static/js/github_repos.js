const GITHUB_USER = "JPS4L4";
    const mainNav = document.getElementById("main-nav");
    const navToggle = document.getElementById("nav-toggle");
                const pageHeader = document.querySelector(".site-header");
    const desktopQuery = window.matchMedia("(min-width: 980px)");

    const repoSummaryContainer = document.getElementById("github-repos");
    const repoBrowserButton = document.getElementById("open-repo-browser");
    const repoBrowserModal = document.getElementById("repo-browser-modal");
    const repoBrowserCloseBtn = document.getElementById("repo-browser-close-btn");
    const repoBrowserPrev = document.getElementById("repo-browser-prev");
    const repoBrowserNext = document.getElementById("repo-browser-next");
    const repoBrowserPageLabel = document.getElementById("repo-browser-page-label");
    const repoBrowserList = document.getElementById("repo-browser-list");

    const repoDetailOverlay = document.getElementById("repo-detail-overlay");
    const repoDetailCloseBtn = document.getElementById("repo-detail-close-btn");
    const detailName = document.getElementById("detail-name");
    const detailDesc = document.getElementById("detail-desc");
    const detailLanguage = document.getElementById("detail-language");
    const detailStars = document.getElementById("detail-stars");
    const detailForks = document.getElementById("detail-forks");
    const detailUpdated = document.getElementById("detail-updated");
    const detailWatchers = document.getElementById("detail-watchers");
    const detailHomepage = document.getElementById("detail-homepage");
    const detailGithub = document.getElementById("detail-github");

    let githubRepos = [];
    let currentRepoPage = 1;
    const reposPerPage = 5;

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return "hoy";
        if (days === 1) return "ayer";
        if (days < 30) return `hace ${days} días`;
        const months = Math.floor(days / 30);
        return `hace ${months} mes${months > 1 ? "es" : ""}`;
    }

    function closeMobileNav() {
        if (!mainNav || !navToggle) return;
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰";
    }

    function toggleMobileNav() {
        if (!mainNav || !navToggle) return;
        const isOpen = mainNav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen.toString());
        navToggle.textContent = isOpen ? "✕" : "☰";
    }

    function updateNavMode(isHeaderVisible = true) {
        if (!mainNav) return;

        if (!desktopQuery.matches) {
            mainNav.classList.remove("open");
        }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function safeUrl(value) {
        try {
            const url = new URL(String(value ?? ""));
            return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
        } catch {
            return "";
        }
    }

    function createRepoCard(repo, cardClass) {
        return `
            <article class="repo-card ${cardClass}" data-repo-id="${escapeHtml(repo.id)}" role="button" tabindex="0">
              <div class="repo-top">
                <span class="repo-icon">⬡</span>
                <a href="${escapeHtml(safeUrl(repo.html_url))}" target="_blank" rel="noopener noreferrer" class="repo-name">${escapeHtml(repo.name)}</a>
              </div>
              <p class="repo-desc">${escapeHtml(repo.description || "Sin descripción aún.")}</p>
              <div class="repo-meta">
                ${repo.language ? `<span class="repo-lang"><span class="lang-dot"></span>${escapeHtml(repo.language)}</span>` : ""}
                <span class="repo-stars">★ ${escapeHtml(repo.stargazers_count)}</span>
                <span class="repo-updated">↻ ${timeAgo(repo.updated_at)}</span>
              </div>
            </article>
        `;
    }

    function bindRepoDetailTriggers(root, selector) {
        if (!root) return;
        root.querySelectorAll(selector).forEach(card => {
            card.addEventListener("click", (event) => {
                if (event.target.closest("a")) return;
                const repoId = card.dataset.repoId;
                openRepoDetailOverlay(repoId);
            });
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    const repoId = card.dataset.repoId;
                    openRepoDetailOverlay(repoId);
                }
            });
        });
    }

    function openRepoDetailOverlay(repoId) {
        const repo = typeof repoId === "object"
            ? repoId
            : githubRepos.find(item => String(item.id) === String(repoId));
        if (!repo || !repoDetailOverlay) return;

        detailName.textContent = repo.name;
        detailDesc.textContent = repo.description || "Sin descripción aún.";
        detailLanguage.textContent = repo.language || "No especificado";
        detailStars.textContent = repo.stargazers_count;
        detailForks.textContent = repo.forks_count;
        detailUpdated.textContent = formatDate(repo.updated_at);
        detailWatchers.textContent = repo.watchers_count;
        detailGithub.href = safeUrl(repo.html_url);

        const homepage = safeUrl(repo.homepage);
        if (homepage) {
            detailHomepage.href = homepage;
            detailHomepage.classList.remove("hidden");
        } else {
            detailHomepage.classList.add("hidden");
        }

        repoDetailOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        history.pushState({ repoId: repo.id, detail: true }, "", `#repo-${encodeURIComponent(repo.name.replace(/\s+/g, "-"))}`);
    }

    function closeRepoDetailOverlay(updateHistory = true) {
        if (!repoDetailOverlay) return;
        repoDetailOverlay.classList.add("hidden");
        document.body.style.overflow = "";
        if (updateHistory) {
            history.pushState(null, "", "#github");
        }
    }

    function renderRepoSummary(repos) {
        if (!repoSummaryContainer) return;

        if (!repos.length) {
            repoSummaryContainer.innerHTML = `<p class="empty-state">Aún no hay repositorios públicos.</p>`;
            return;
        }

        const summaryRepos = repos.slice(0, 6);
        repoSummaryContainer.innerHTML = summaryRepos.map(repo => createRepoCard(repo, "repo-summary-detail-trigger")).join("");
        bindRepoDetailTriggers(repoSummaryContainer, ".repo-summary-detail-trigger");
    }

    function getTotalPages() {
        return Math.max(1, Math.ceil(githubRepos.length / reposPerPage));
    }

    function updateRepoBrowserControls() {
        if (!repoBrowserPageLabel || !repoBrowserPrev || !repoBrowserNext) return;
        const totalPages = getTotalPages();
        currentRepoPage = Math.min(Math.max(1, currentRepoPage), totalPages);
        repoBrowserPageLabel.textContent = `Página ${currentRepoPage} de ${totalPages}`;
        repoBrowserPrev.disabled = currentRepoPage <= 1;
        repoBrowserNext.disabled = currentRepoPage >= totalPages;
    }

    function renderRepoBrowserPage(page = 1) {
        if (!repoBrowserList) return;

        currentRepoPage = Math.min(Math.max(1, page), getTotalPages());
        const start = (currentRepoPage - 1) * reposPerPage;
        const pageRepos = githubRepos.slice(start, start + reposPerPage);

        if (!pageRepos.length) {
            repoBrowserList.innerHTML = `<p class="empty-state">No hay repositorios para esta página.</p>`;
            updateRepoBrowserControls();
            return;
        }

        repoBrowserList.innerHTML = pageRepos.map(repo => createRepoCard(repo, "repo-browser-detail-trigger")).join("");
        bindRepoDetailTriggers(repoBrowserList, ".repo-browser-detail-trigger");
        updateRepoBrowserControls();
    }

    function openRepoBrowser() {
        if (!repoBrowserModal) return;
        repoBrowserModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        renderRepoBrowserPage(currentRepoPage);
    }

    function closeRepoBrowser() {
        if (!repoBrowserModal) return;
        repoBrowserModal.classList.add("hidden");
        document.body.style.overflow = "";
        history.pushState(null, "", "#github");
    }

    function handleInitialHash() {
        const hash = window.location.hash;
        if (!hash.startsWith("#repo-")) return;
        const slug = decodeURIComponent(hash.slice(6));
        const repo = githubRepos.find(item => item.name.replace(/\s+/g, "-").toLowerCase() === slug.toLowerCase());
        if (repo) {
            openRepoDetailOverlay(repo);
        }
    }

    if (navToggle) {
        navToggle.addEventListener("click", toggleMobileNav);
    }

    document.querySelectorAll(".header-nav a").forEach(link => {
        link.addEventListener("click", () => {
            if (!desktopQuery.matches) {
                closeMobileNav();
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (!desktopQuery.matches && mainNav && navToggle) {
            if (!mainNav.contains(event.target) && !navToggle.contains(event.target)) {
                closeMobileNav();
            }
        }
    });

                if (pageHeader && mainNav) {
        const headerObserver = new IntersectionObserver(
            ([entry]) => updateNavMode(entry.isIntersecting),
            { threshold: 0.05 }
        );
                headerObserver.observe(pageHeader);
    }

    window.addEventListener("resize", () => {
        const headerVisible = pageHeader ? pageHeader.getBoundingClientRect().bottom > 0 : true;
        updateNavMode(headerVisible);
    });

    if (repoBrowserButton) {
        repoBrowserButton.addEventListener("click", openRepoBrowser);
    }

    if (repoBrowserCloseBtn) {
        repoBrowserCloseBtn.addEventListener("click", closeRepoBrowser);
    }

    if (repoBrowserModal) {
        repoBrowserModal.addEventListener("click", (event) => {
            if (event.target === repoBrowserModal) {
                closeRepoBrowser();
            }
        });
    }

    if (repoBrowserPrev) {
        repoBrowserPrev.addEventListener("click", () => renderRepoBrowserPage(currentRepoPage - 1));
    }

    if (repoBrowserNext) {
        repoBrowserNext.addEventListener("click", () => renderRepoBrowserPage(currentRepoPage + 1));
    }

    if (repoDetailCloseBtn) {
        repoDetailCloseBtn.addEventListener("click", () => closeRepoDetailOverlay());
    }

    if (repoDetailOverlay) {
        repoDetailOverlay.addEventListener("click", (event) => {
            if (event.target === repoDetailOverlay) {
                closeRepoDetailOverlay();
            }
        });
    }

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (repoDetailOverlay && !repoDetailOverlay.classList.contains("hidden")) {
                closeRepoDetailOverlay();
            } else if (repoBrowserModal && !repoBrowserModal.classList.contains("hidden")) {
                closeRepoBrowser();
            }
        }
    });

    window.addEventListener("popstate", (event) => {
        if (event.state && event.state.repoId) {
            openRepoDetailOverlay(event.state.repoId);
        } else {
            closeRepoDetailOverlay(false);
            closeRepoBrowser();
        }
    });

    function loadGithubRepos() {
        const container = document.getElementById("github-repos");
        const repoCount = document.getElementById("repo-count");

        fetch("/api/github/data")
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                const repos = Array.isArray(data.repos) ? data.repos : [];
                const user = data.user || {};

                githubRepos = repos;
                renderRepoSummary(githubRepos);
                renderRepoBrowserPage(currentRepoPage);

                if (repoCount) {
                    repoCount.textContent = user.public_repos != null ? user.public_repos : githubRepos.length;
                }
                handleInitialHash();
            })
            .catch(() => {
                if (container) {
                    container.innerHTML = `
                        <div class="repo-error">
                          <p>No se pudieron cargar los repositorios.</p>
                          <a href="https://github.com/${GITHUB_USER}" target="_blank" class="btn btn-ghost">Ver en GitHub →</a>
                        </div>`;
                }
            });
    }

    loadGithubRepos();

    const cursor = document.querySelector(".t-cursor");
    if (cursor) setInterval(() => cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0", 530);