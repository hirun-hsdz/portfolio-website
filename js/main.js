
const GITHUB_USER = "hirun-hsdz"; 

const projects = [
  { title: "iMart Billing System", blurb: "Java console supermarket billing.", desc: "A console application that records items, calculates totals and prints a customer bill for a supermarket.", tech: ["Java", "OOP", "Console"] },
  { title: "Smart Park Billing System", blurb: "Group assignment: parking fees in Java.", desc: "A group project for Programming Fundamentals that calculates parking charges and produces billing output.", tech: ["Java", "Teamwork"] },
  { title: "Student Management System", blurb: "Console app to manage student records.", desc: "Add, search, update and delete student records from a menu-driven console program.", tech: ["Java", "Arrays", "Methods"] },
  { title: "Student Management GUI", blurb: "Swing version of the student system.", desc: "The same system rebuilt as a desktop application with a Java Swing interface for the OOP module.", tech: ["Java", "Swing", "OOP"] }
];

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));


const root = document.documentElement, themeBtn = $("#themeBtn");
function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "Light" : "Dark";
  themeBtn.setAttribute("aria-pressed", t === "dark");
  themeBtn.setAttribute("aria-label", `Switch to ${t === "dark" ? "light" : "dark"} theme`);
  try { localStorage.setItem("theme", t); } catch (e) {}
}
let saved = null; try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");

const menuBtn = $("#menuBtn"), links = $("#navLinks");
menuBtn.onclick = () => menuBtn.setAttribute("aria-expanded", links.classList.toggle("open"));
links.addEventListener("click", (e) => { if (e.target.tagName === "A") { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

const modal = $("#modal");
projects.forEach((p) => {
  const card = el("button", "card", `<h3>${esc(p.title)}</h3><p>${esc(p.blurb)}</p>`);
  card.type = "button";
  card.onclick = () => {
    $("#modalTitle").textContent = p.title;
    $("#modalDesc").textContent = p.desc;
    $("#modalTech").replaceChildren(...p.tech.map((t) => el("li", "", esc(t))));
    modal.showModal();
  };
  $("#projectGrid").append(card);
});
$("#modalClose").onclick = () => modal.close();
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); }); // click backdrop

async function loadRepos() {
  const status = $("#ghStatus"), grid = $("#repoGrid");
  $("#ghLink").href = `https://github.com/hirun-hsdz${GITHUB_USER}`;
  $("#ghLink").textContent = `github.com/${GITHUB_USER}`;
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`);
    if (!res.ok) throw new Error(res.status === 404 ? "User not found" : `Error ${res.status}`);
    const repos = await res.json();
    if (!repos.length) { status.textContent = "No public repositories yet."; return; }
    status.textContent = `Latest ${repos.length} public repositories.`;
    repos.forEach((r) => {
      const a = el("a", "card", `<h3>${esc(r.name)}</h3><p>${esc(r.description || "No description.")}</p><small>${esc(r.language || "Mixed")} · ${r.stargazers_count} stars</small>`);
      a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
      grid.append(a);
    });
  } catch (err) {
    status.textContent = `Couldn't load repositories (${err.message}). Check GITHUB_USER in js/main.js.`;
  }
}
loadRepos();


const navLinks = [...links.querySelectorAll("a")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.hash === `#${en.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

const fill = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.style.width = en.target.dataset.level + "%"; fill.unobserve(en.target); }
  });
}, { threshold: 0.4 });
document.querySelectorAll(".meter i").forEach((b) => fill.observe(b));