const PHONE = "PHONE_PLACEHOLDER";
const DEMO_PROJECTS = [
  {
    id: "demo",
    title: "Демо-проект",
    city: "Геленджик",
    area: "70 м²",
    type: "Ремонт под ключ",
    duration: "80 дней",
    budget: "2,2 млн ₽",
    status: "завершён",
    cover: "assets/images/project-coast.svg",
    gallery: ["assets/images/project-coast.svg"],
    description: "Демо-данные для локального просмотра.",
    task: "Показать работу платформы.",
    done: ["смета", "контроль", "отчёт"],
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
    before: "assets/images/before.svg",
    after: "assets/images/after.svg",
  },
];
const DEMO_VIDEOS = [
  {
    id: "demo-video",
    title: "Демо-видео",
    description: "Fallback видео для локального просмотра.",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
    preview: "assets/images/video-preview-1.svg",
    category: "Процесс",
  },
];

function basePrefix() {
  return document.body.dataset.root || "";
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(`${basePrefix()}${path}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Fallback data for ${path}`, error);
    return fallback;
  }
}

function youtubeEmbed(url = "") {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    let id = "";
    if (parsed.hostname.includes("youtu.be"))
      id = parsed.pathname.replace("/", "");
    if (parsed.hostname.includes("youtube.com"))
      id = parsed.searchParams.get("v") || parsed.pathname.split("/").pop();
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch (_) {
    return "";
  }
}

function imgSrc(src = "") {
  if (!src || src.startsWith("http") || src.startsWith("../")) return src;
  return `${basePrefix()}${src}`;
}

function projectCard(project) {
  return `
    <article class="project-card">
      <img class="project-card__image" src="${imgSrc(project.cover)}" alt="${project.title}">
      <div class="project-card__body">
        <p class="meta"><span class="pill status">${project.status}</span><span>${project.city}</span><span>${project.area}</span></p>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p class="meta"><span>${project.type}</span><span>${project.duration}</span><span>${project.budget}</span></p>
        <a class="btn btn--dark" href="${basePrefix()}portfolio/project-template.html?id=${project.id}">Смотреть проект</a>
      </div>
    </article>`;
}

function videoCard(video) {
  const embed = youtubeEmbed(video.youtubeUrl);
  return `
    <article class="video-card">
      <div class="video-frame">
        ${embed ? `<iframe loading="lazy" src="${embed}" title="${video.title}" allowfullscreen></iframe>` : `<img class="video-card__preview" src="${imgSrc(video.preview)}" alt="${video.title}">`}
      </div>
      <div class="video-card__body">
        <p class="meta"><span class="pill">${video.category}</span></p>
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      </div>
    </article>`;
}

async function renderProjects() {
  const nodes = document.querySelectorAll("[data-projects]");
  if (!nodes.length) return;
  const limit = Number(
    document.querySelector("[data-projects-limit]")?.dataset.projectsLimit || 0,
  );
  const projects = await loadJson("assets/data/projects.json", DEMO_PROJECTS);
  nodes.forEach((node) => {
    const list = limit ? projects.slice(0, limit) : projects;
    node.innerHTML = list.map(projectCard).join("");
  });
}

async function renderVideos() {
  const nodes = document.querySelectorAll("[data-videos]");
  if (!nodes.length) return;
  const limit = Number(
    document.querySelector("[data-videos-limit]")?.dataset.videosLimit || 0,
  );
  const videos = await loadJson("assets/data/videos.json", DEMO_VIDEOS);
  nodes.forEach((node) => {
    const list = limit ? videos.slice(0, limit) : videos;
    node.innerHTML = list.map(videoCard).join("");
  });
}

async function renderProjectDetail() {
  const root = document.querySelector("[data-project-detail]");
  if (!root) return;
  const id = new URLSearchParams(window.location.search).get("id");
  const projects = await loadJson("assets/data/projects.json", DEMO_PROJECTS);
  const project = projects.find((item) => item.id === id) || projects[0];
  const embed = youtubeEmbed(project.youtubeUrl);
  root.innerHTML = `
    <section class="subhero"><div class="container"><p class="breadcrumbs"><a href="../index.html">Главная</a> / <a href="index.html">Портфолио</a> / ${project.title}</p><h1>${project.title}</h1><p class="lead">${project.description}</p></div></section>
    <section class="content"><div class="container detail-grid"><div><img src="${imgSrc(project.cover)}" alt="${project.title}" style="border-radius:32px"><h2>Задача</h2><p>${project.task}</p><h2>Что сделали</h2><ul>${(project.done || []).map((item) => `<li>${item}</li>`).join("")}</ul></div><aside class="specs"><div><b>Город</b><span>${project.city}</span></div><div><b>Площадь</b><span>${project.area}</span></div><div><b>Срок</b><span>${project.duration}</span></div><div><b>Бюджет</b><span>${project.budget}</span></div><div><b>Статус</b><span>${project.status}</span></div><a class="btn btn--accent" href="https://wa.me/${PHONE}?text=${encodeURIComponent("Хочу такой ремонт: " + project.title)}" data-whatsapp-link>Хочу такой ремонт</a></aside></div></section>
    <section class="section section--sand"><div class="container"><div class="section__head"><h2>Галерея проекта</h2></div><div class="gallery">${(project.gallery || []).map((src) => `<img src="${imgSrc(src)}" alt="${project.title}">`).join("")}</div></div></section>
    ${embed ? `<section class="section"><div class="container"><div class="section__head"><h2>Видео объекта</h2></div><div class="video-frame"><iframe loading="lazy" src="${embed}" title="${project.title}" allowfullscreen></iframe></div></div></section>` : ""}
    <section class="section section--dark"><div class="container"><div class="section__head"><h2>До / После</h2></div>${beforeAfter(imgSrc(project.before), imgSrc(project.after), project.title)}</div></section>`;
  initBeforeAfter();
}

function beforeAfter(before, after, alt) {
  return `<div class="before-after"><span class="before-after__label before-after__label--before">До</span><span class="before-after__label before-after__label--after">После</span><img src="${before}" alt="${alt} до ремонта"><img class="before-after__after" src="${after}" alt="${alt} после ремонта"><input type="range" min="0" max="100" value="50" aria-label="Сравнить до и после"></div>`;
}

function initBeforeAfter() {
  document.querySelectorAll(".before-after").forEach((slider) => {
    const after = slider.querySelector(".before-after__after");
    const input = slider.querySelector("input");
    if (!after || !input) return;
    input.addEventListener("input", () => {
      after.style.clipPath = `inset(0 0 0 ${input.value}%)`;
    });
  });
}

function initUi() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  document
    .querySelectorAll(".faq-question")
    .forEach((button) =>
      button.addEventListener("click", () =>
        button.closest(".faq-item").classList.toggle("is-open"),
      ),
    );
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = `https://wa.me/${PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу рассчитать стоимость ремонта.")}`;
  });
  document.querySelectorAll("[data-lead-form]").forEach((form) =>
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.location.href = `https://wa.me/${PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу рассчитать стоимость ремонта.")}`;
    }),
  );
  initBeforeAfter();
}

document.addEventListener("DOMContentLoaded", () => {
  initUi();
  renderProjects();
  renderVideos();
  renderProjectDetail();
});
