// Utilidades compartidas (se carga antes que el resto de scripts).

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
