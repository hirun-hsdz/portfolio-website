
const GITHUB_USER = "hirun-hsdz";

const projects = [
  {
    title: "iMart Billing System",
    blurb: "Java console supermarket billing.",
    desc: "A console application that records items, calculates totals and prints a customer bill for a supermarket.",
    tech: ["Java", "OOP", "Console"]
  },
  {
    title: "Smart Park Billing System",
    blurb: "Group assignment: parking fees in Java.",
    desc: "A group project for Programming Fundamentals that calculates parking charges and produces billing output.",
    tech: ["Java", "Teamwork"]
  },
  {
    title: "Student Management System",
    blurb: "Console app to manage student records.",
    desc: "Add, search, update and delete student records from a menu-driven console program.",
    tech: ["Java", "Arrays", "Methods"]
  },
  {
    title: "Student Management GUI",
    blurb: "Swing version of the student system.",
    desc: "The same system rebuilt as a desktop application with a Java Swing interface for the OOP module.",
    tech: ["Java", "Swing", "OOP"]
  }
];

const $ = (selector) => document.querySelector(selector);

const el = (tag, cls, html) => {
  const element = document.createElement(tag);

  if (cls) {
    element.className = cls;
  }

  if (html) {
    element.innerHTML = html;
  }

  return element;
};

const esc = (text) =>
  String(text ?? "").replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[character]));

// ================================
// THEME SWITCHER
// ================================

const root = document.documentElement;
const themeBtn = $("#themeBtn");

function setTheme(theme) {
  if (!themeBtn) return;

  root.dataset.theme = theme;

  themeBtn.textContent = theme === "dark" ? "Light" : "Dark";

  themeBtn.setAttribute("aria-pressed", String(theme === "dark"));

  themeBtn.setAttribute(
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} theme`
  );

  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Storage may be unavailable.
  }
}

let savedTheme = null;

try {
  savedTheme = localStorage.getItem("theme");
} catch (error) {
  // Use the default theme if storage is unavailable.
}

const preferredTheme =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

setTheme(savedTheme || preferredTheme);

if (themeBtn) {
  themeBtn.onclick = () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  };
}

// ================================
// MOBILE NAVIGATION
// ================================

const menuBtn = $("#menuBtn");
const links = $("#navLinks");

if (menuBtn && links) {
  menuBtn.onclick = () => {
    const isOpen = links.classList.toggle("open");

    menuBtn.setAttribute("aria-expanded", String(isOpen));
  };

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      links.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// ================================
// PROJECT CARDS AND MODAL
// ================================

const modal = $("#modal");
const projectGrid = $("#projectGrid");

if (projectGrid) {
  projects.forEach((project) => {
    const card = el(
      "button",
      "card",
      `<h3>${esc(project.title)}</h3>
       <p>${esc(project.blurb)}</p>`
    );

    card.type = "button";

    card.onclick = () => {
      if (!modal) return;

      const modalTitle = $("#modalTitle");
      const modalDesc = $("#modalDesc");
      const modalTech = $("#modalTech");

      if (modalTitle) {
        modalTitle.textContent = project.title;
      }

      if (modalDesc) {
        modalDesc.textContent = project.desc;
      }

      if (modalTech) {
        modalTech.replaceChildren(
          ...project.tech.map((technology) =>
            el("li", "", esc(technology))
          )
        );
      }

      if (typeof modal.showModal === "function") {
        modal.showModal();
      }
    };

    projectGrid.append(card);
  });
}

const modalClose = $("#modalClose");

if (modalClose && modal) {
  modalClose.onclick = () => modal.close();

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });
}

// ================================
// GITHUB REPOSITORIES
// ================================

async function loadRepos() {
  const status = $("#ghStatus");
  const grid = $("#repoGrid");
  const githubLink = $("#ghLink");

  if (githubLink) {
    githubLink.href = `https://github.com/${GITHUB_USER}`;
    githubLink.textContent = `github.com/${GITHUB_USER}`;
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
  }

  if (!status || !grid) {
    return;
  }

  status.textContent = "Loading GitHub repositories...";

  // Clear old repository cards before loading.
  grid.replaceChildren();

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`
    );

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "GitHub user not found."
          : `GitHub API error: ${response.status}`
      );
    }

    const repos = await response.json();

    if (!repos.length) {
      status.textContent = "No public repositories yet.";
      return;
    }

    status.textContent =
      `Latest ${repos.length} public repositories.`;

    repos.forEach((repo) => {
      const card = el(
        "a",
        "card",
        `<h3>${esc(repo.name)}</h3>
         <p>${esc(repo.description || "No description available.")}</p>
         <small>${esc(repo.language || "Mixed")} · ${repo.stargazers_count} stars</small>`
      );

      card.href = repo.html_url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      grid.append(card);
    });
  } catch (error) {
    status.textContent =
      `Couldn't load repositories: ${error.message}`;

    console.error("GitHub repository loading error:", error);
  }
}

loadRepos();

// ================================
// ACTIVE NAVIGATION SECTION
// ================================

const navLinks = links
  ? [...links.querySelectorAll("a")]
  : [];

if ("IntersectionObserver" in window) {
  const sections = document.querySelectorAll("main section[id]");

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.hash === `#${entry.target.id}`
            );
          });
        }
      });
    },
    {
      rootMargin: "-45% 0px -50% 0px"
    }
  );

  sections.forEach((section) => {
    spy.observe(section);
  });
}

// ================================
// SKILL METER ANIMATION
// ================================

if ("IntersectionObserver" in window) {
  const fill = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const level = Number(entry.target.dataset.level);

          if (Number.isFinite(level)) {
            entry.target.style.width =
              `${Math.max(0, Math.min(100, level))}%`;
          }

          fill.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.4
    }
  );

  document.querySelectorAll(".meter i").forEach((bar) => {
    fill.observe(bar);
  });
}
