(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Loader ---------- */
  window.addEventListener("load", () => {
    const loader = $("#pageLoader");
    document.body.classList.add("is-ready");
    setTimeout(() => loader?.classList.add("is-done"), 400);
  });

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Cursor glow ---------- */
  const glow = $("#cursorGlow");
  if (glow && matchMedia("(hover: hover)").matches) {
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Header / Nav ---------- */
  const header = $("#header");
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  const navLinks = $$(".nav__link");

  const onScrollHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
    document.body.style.overflow = open ? "" : "hidden";
  });

  const closeNav = () => {
    navToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  $$(".nav a").forEach((a) => a.addEventListener("click", closeNav));

  /* Active section spy */
  const sections = ["inicio", "sobre", "projetos", "clientes", "tecnologias"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const spy = () => {
    const y = window.scrollY + 120;
    let current = "inicio";
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec.id;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === current);
    });
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* ---------- Scroll hint ---------- */
  $("#scrollHint")?.addEventListener("click", () => {
    $("#sobre")?.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  $$(".hero .reveal").forEach((el) => el.classList.add("is-visible"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Hero wave canvas ---------- */
  const canvas = $("#heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let raf = 0;
    const waves = [
      { amp: 28, len: 0.004, speed: 0.018, color: "rgba(0,194,203,0.35)", y: 0.72 },
      { amp: 36, len: 0.0032, speed: 0.012, color: "rgba(43,143,217,0.28)", y: 0.78 },
      { amp: 22, len: 0.005, speed: 0.022, color: "rgba(126,240,245,0.22)", y: 0.85 },
    ];
    let t = 0;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
          const y =
            h * wave.y +
            Math.sin(x * wave.len + t * wave.speed + i) * wave.amp +
            Math.sin(x * wave.len * 0.5 + t * 0.01) * (wave.amp * 0.35);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      // circuit nodes
      for (let i = 0; i < 14; i++) {
        const nx = ((i * 97 + t * 8) % (w + 40)) - 20;
        const ny = h * 0.55 + Math.sin(i + t * 0.02) * 40;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 226, 234, ${0.25 + (i % 3) * 0.15})`;
        ctx.fill();
      }

      t += 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* ---------- Essência tabs ---------- */
  const tabs = $$(".essencia__tab");
  const panels = $$(".essencia__panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.panel;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => {
        const match = panel.dataset.panel === id;
        panel.hidden = !match;
        panel.classList.toggle("is-active", match);
      });
    });
  });

  /* ---------- Valores click ---------- */
  const valores = $$(".valor");
  valores.forEach((btn) => {
    btn.addEventListener("click", () => {
      const was = btn.classList.contains("is-active");
      valores.forEach((v) => v.classList.remove("is-active"));
      if (!was) btn.classList.add("is-active");
    });
  });

  /* ---------- Projetos filter + modal ---------- */
  const filters = $$(".filter");
  const projetos = $$(".projeto");
  const modal = $("#projetoModal");
  const modalImg = $("#modalImg");
  const modalTag = $("#modalTag");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filters.forEach((f) => f.classList.toggle("is-active", f === btn));
      projetos.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          card.classList.remove("is-visible");
          requestAnimationFrame(() => card.classList.add("is-visible"));
        }
      });
    });
  });

  const openModal = (card) => {
    if (!modal) return;
    const img = card.querySelector("img");
    const tag = card.querySelector(".projeto__tag");
    const title = card.querySelector("h3");
    const desc = card.querySelector("p");
    modalImg.src = img?.src || "";
    modalImg.alt = title?.textContent || "";
    modalTag.textContent = tag?.textContent || "";
    modalTitle.textContent = title?.textContent || "";
    modalDesc.textContent = desc?.textContent || "";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  projetos.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  modal?.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- Tecnologias ---------- */
  const catLabels = {
    linguagens: "Linguagens",
    banco: "Banco de Dados",
    versionamento: "Versionamento",
    ecommerce: "E-Commerce",
  };

  const techInfo = {
    ruby: {
      title: "Ruby",
      cat: "linguagens",
      desc: "Aplicações robustas e elegantes, com alta produtividade para produtos digitais e APIs.",
    },
    nodejs: {
      title: "Node.js",
      cat: "linguagens",
      desc: "Backends e APIs rápidas, ideais para sistemas em tempo real e integrações.",
    },
    php: {
      title: "PHP",
      cat: "linguagens",
      desc: "Soluções web maduras, portais e sistemas corporativos com entrega eficiente.",
    },
    angular: {
      title: "Angular",
      cat: "linguagens",
      desc: "Front-ends estruturados para aplicações empresariais complexas e escaláveis.",
    },
    react: {
      title: "React",
      cat: "linguagens",
      desc: "Interfaces modernas e performáticas — o ritmo visual do seu produto digital.",
    },
    vue: {
      title: "Vue",
      cat: "linguagens",
      desc: "UIs ágeis e progressivas, com curva suave e ótimo custo-benefício.",
    },
    ionic: {
      title: "Ionic",
      cat: "linguagens",
      desc: "Apps híbridos com visual nativo, acelerando o lançamento em múltiplas plataformas.",
    },
    wordpress: {
      title: "WordPress",
      cat: "linguagens",
      desc: "Sites, blogs e portais gerenciáveis, com personalização sob medida.",
    },
    android: {
      title: "Android",
      cat: "linguagens",
      desc: "Aplicativos nativos Android alinhados à experiência e performance do usuário.",
    },
    iphone: {
      title: "iPhone",
      cat: "linguagens",
      desc: "Apps iOS com qualidade nativa, design fluido e integração ao ecossistema Apple.",
    },
    oracle: {
      title: "Oracle",
      cat: "banco",
      desc: "Bancos corporativos de alta disponibilidade para operações críticas.",
    },
    mysql: {
      title: "MySQL",
      cat: "banco",
      desc: "Dados confiáveis e performáticos para aplicações web e sistemas de gestão.",
    },
    postgresql: {
      title: "PostgreSQL",
      cat: "banco",
      desc: "Base relacional avançada, segura e pronta para escala e analytics.",
    },
    sqlserver: {
      title: "SQL Server",
      cat: "banco",
      desc: "Ambientes Microsoft com integração sólida a sistemas empresariais.",
    },
    mariadb: {
      title: "MariaDB",
      cat: "banco",
      desc: "Alternativa open source ágil e estável para aplicações modernas.",
    },
    github: {
      title: "GitHub",
      cat: "versionamento",
      desc: "Colaboração, code review e CI/CD para evoluir o produto com segurança.",
    },
    gitlab: {
      title: "GitLab",
      cat: "versionamento",
      desc: "DevOps integrado: repositório, pipelines e entrega contínua em um só fluxo.",
    },
    bitbucket: {
      title: "Bitbucket",
      cat: "versionamento",
      desc: "Versionamento alinhado ao ecossistema Atlassian e times ágeis.",
    },
    teamsystem: {
      title: "Team System",
      cat: "versionamento",
      desc: "Gestão de código e projetos no ambiente Microsoft Azure DevOps / TFS.",
    },
    ecommerce: {
      title: "E-Commerce",
      cat: "ecommerce",
      desc: "Lojas digitais, catálogos, pagamentos e jornadas de compra sob medida.",
    },
  };

  const techCats = $$(".tech-cat");
  const techChips = $$(".tech-chip");
  const techDetail = $("#techDetail");
  const techDetailCat = $("#techDetailCat");
  const techDetailTitle = $("#techDetailTitle");
  const techDetailDesc = $("#techDetailDesc");

  const showTech = (key) => {
    const info = techInfo[key];
    if (!info || !techDetail) return;

    techChips.forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.tech === key);
    });

    techDetail.classList.add("is-switching");
    setTimeout(() => {
      if (techDetailCat) techDetailCat.textContent = catLabels[info.cat] || "";
      if (techDetailTitle) techDetailTitle.textContent = info.title;
      if (techDetailDesc) techDetailDesc.textContent = info.desc;
      techDetail.classList.remove("is-switching");
    }, 180);
  };

  techCats.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      techCats.forEach((c) => {
        const active = c === btn;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
      });

      techChips.forEach((chip) => {
        const show = cat === "all" || chip.dataset.cat === cat;
        chip.classList.toggle("is-hidden", !show);
      });

      const firstVisible = techChips.find(
        (chip) => !chip.classList.contains("is-hidden")
      );
      if (firstVisible) showTech(firstVisible.dataset.tech);
    });
  });

  techChips.forEach((chip) => {
    chip.addEventListener("click", () => showTech(chip.dataset.tech));
  });

  /* ---------- Soft tilt on missão/visão ---------- */
  $$("[data-tilt]").forEach((el) => {
    if (!matchMedia("(hover: hover)").matches) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });

})();
