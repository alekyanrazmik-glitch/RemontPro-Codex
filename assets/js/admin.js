const PROJECT_KEY = "remontpro.projects";
const VIDEO_KEY = "remontpro.videos";
const $ = (selector) => document.querySelector(selector);
const emptyProject = {
  id: "",
  title: "",
  city: "",
  area: "",
  type: "",
  duration: "",
  budget: "",
  status: "в работе",
  cover: "",
  gallery: [],
  description: "",
  task: "",
  done: [],
  youtubeUrl: "",
  before: "",
  after: "",
};
function youtubeEmbed(url = "") {
  try {
    const parsed = new URL(url);
    let id = "";
    if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1);
    if (parsed.hostname.includes("youtube.com"))
      id = parsed.searchParams.get("v") || parsed.pathname.split("/").pop();
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
}
async function defaults(path, fallback) {
  try {
    const r = await fetch(`../assets/data/${path}`);
    return r.ok ? await r.json() : fallback;
  } catch {
    return fallback;
  }
}
function get(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value, null, 2));
}
function download(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function readFile(input, cb) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => cb(JSON.parse(reader.result));
  reader.readAsText(file);
}
async function initAdmin() {
  if (!get(PROJECT_KEY).length)
    set(PROJECT_KEY, await defaults("projects.json", []));
  if (!get(VIDEO_KEY).length) set(VIDEO_KEY, await defaults("videos.json", []));
  renderDashboard();
  renderProjectList();
  renderVideoList();
  bindForms();
}
function renderDashboard() {
  const el = $("#dashboardStats");
  if (!el) return;
  el.innerHTML = `<div class="admin-card"><h2>${get(PROJECT_KEY).length}</h2><p>проектов в localStorage</p></div><div class="admin-card"><h2>${get(VIDEO_KEY).length}</h2><p>видео</p></div><div class="admin-card"><h2>JSON</h2><p>экспорт для GitHub Pages</p></div>`;
}
function renderProjectList() {
  const el = $("#projectRows");
  if (!el) return;
  el.innerHTML = get(PROJECT_KEY)
    .map(
      (p) =>
        `<tr><td>${p.title}</td><td>${p.city}</td><td>${p.status}</td><td><a class="btn btn--light" href="project-edit.html?id=${p.id}">Редактировать</a><button class="btn btn--dark" data-delete-project="${p.id}">Удалить</button></td></tr>`,
    )
    .join("");
  document.querySelectorAll("[data-delete-project]").forEach(
    (b) =>
      (b.onclick = () => {
        set(
          PROJECT_KEY,
          get(PROJECT_KEY).filter((p) => p.id !== b.dataset.deleteProject),
        );
        renderProjectList();
      }),
  );
}
function fillProjectForm() {
  const form = $("#projectForm");
  if (!form) return;
  const id = new URLSearchParams(location.search).get("id");
  const project = get(PROJECT_KEY).find((p) => p.id === id) || {
    ...emptyProject,
    id: `project-${Date.now()}`,
  };
  Object.entries(project).forEach(([k, v]) => {
    if (form[k]) form[k].value = Array.isArray(v) ? v.join("\n") : v;
  });
}
function bindForms() {
  $("#exportProjects")?.addEventListener("click", () =>
    download("projects.json", get(PROJECT_KEY)),
  );
  $("#exportVideos")?.addEventListener("click", () =>
    download("videos.json", get(VIDEO_KEY)),
  );
  $("#importProjects")?.addEventListener("change", (e) =>
    readFile(e.target, (json) => {
      set(PROJECT_KEY, json);
      renderProjectList();
      renderDashboard();
    }),
  );
  $("#importVideos")?.addEventListener("change", (e) =>
    readFile(e.target, (json) => {
      set(VIDEO_KEY, json);
      renderVideoList();
      renderDashboard();
    }),
  );
  const pf = $("#projectForm");
  if (pf) {
    fillProjectForm();
    pf.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(pf).entries());
      data.gallery = data.gallery.split("\n").filter(Boolean);
      data.done = data.done.split("\n").filter(Boolean);
      const list = get(PROJECT_KEY).filter((p) => p.id !== data.id);
      list.push(data);
      set(PROJECT_KEY, list);
      location.href = "portfolio.html";
    });
  }
  const vf = $("#videoForm");
  if (vf)
    vf.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(vf).entries());
      data.id = data.id || `video-${Date.now()}`;
      data.embed = youtubeEmbed(data.youtubeUrl);
      set(VIDEO_KEY, [...get(VIDEO_KEY), data]);
      vf.reset();
      renderVideoList();
    });
}
function renderVideoList() {
  const el = $("#videoRows");
  if (!el) return;
  el.innerHTML = get(VIDEO_KEY)
    .map(
      (v) =>
        `<tr><td>${v.title}</td><td>${v.category}</td><td>${youtubeEmbed(v.youtubeUrl)}</td><td><button class="btn btn--dark" data-delete-video="${v.id}">Удалить</button></td></tr>`,
    )
    .join("");
  document.querySelectorAll("[data-delete-video]").forEach(
    (b) =>
      (b.onclick = () => {
        set(
          VIDEO_KEY,
          get(VIDEO_KEY).filter((v) => v.id !== b.dataset.deleteVideo),
        );
        renderVideoList();
      }),
  );
}
document.addEventListener("DOMContentLoaded", initAdmin);
