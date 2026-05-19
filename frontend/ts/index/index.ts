import { supabase } from "../supabase/supabase.js";

const { data } = await supabase.auth.getSession();

interface Aviso {
  id: number;
  titulo: string;
  desc: string;
  data: string;
}

if (data) {
  const dataUser = data.session?.user.user_metadata;
  console.log(data);
  const btn = document.querySelector(".login-btn");

  if (btn instanceof HTMLAnchorElement && dataUser) {
    const hello = document.createElement("h1");
    hello.classList.add("hello-msg");

    hello.innerText = `Olá, ${dataUser.nome}`;
    btn.replaceWith(hello);
  }
}

const header = document.querySelector<HTMLElement>(".header");
const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");

if (header && menuToggle) {
  const closeMenu = () => {
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });

  const menuLinks = header.querySelectorAll<HTMLAnchorElement>(
    ".nav a, .nav-login a"
  );

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

async function carregarEstatisticas(): Promise<void> {
  try {
    const { count: totalOnibus, error: errOnibus } = await supabase
      .from("onibus")
      .select("*", { count: "exact", head: true })
      .eq("disponivel", true);

    const { count: totalAlunos, error: errAlunos } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true });

    const { count: totalMotoristas, error: errMotoristas } = await supabase
      .from("motoristas")
      .select("*", { count: "exact", head: true });

    if (errOnibus || errAlunos || errMotoristas) {
      throw errOnibus || errAlunos || errMotoristas;
    }

    const txtOnibus = document.getElementById("qtd-onibus");
    const txtAlunos = document.getElementById("qtd-alunos");
    const txtMotoristas = document.getElementById("qtd-motoristas");

    if (txtOnibus) {
      txtOnibus.innerText = `${totalOnibus ?? 0} Ônibus rodando`;
    }

    if (txtAlunos) {
      txtAlunos.innerText = `${totalAlunos ?? 0} Alunos`;
    }

    if (txtMotoristas) {
      txtMotoristas.innerText = `${totalMotoristas ?? 0} Motoristas`;
    }
  } catch (error) {
    console.error("Erro ao carregar os dados do painel:", error);

    const elementos = ["qtd-onibus", "qtd-alunos", "qtd-motoristas"];
    elementos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerText = "Erro";
    });
  }
}

function renderizarAlertasSimples(avisos: Aviso[]): void {
  const gridAlertas = document.querySelector(".alerts-grid");

  if (!gridAlertas) {
    console.error("Elemento .alerts-grid não foi encontrado no DOM.");
    return;
  }

  gridAlertas.innerHTML = "";

  if (avisos.length === 0) {
    gridAlertas.innerHTML =
      '<p style="grid-column: 1/-1; padding: 10px;">Nenhum aviso registrado no momento.</p>';
    return;
  }

  avisos.forEach((aviso) => {
    const dataObjeto = new Date(aviso.data);
    const dataFormatada = dataObjeto.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const article = document.createElement("article");
    article.className = "alert-card";

    article.innerHTML = `
      <p class="alert-type alert-type-info">
        <i class="bi bi-info-circle"></i> Informativo
      </p>
      <h4>${aviso.titulo}</h4>
      <p>${aviso.desc}</p>
      <time datetime="${aviso.data}">${dataFormatada}</time>
    `;

    gridAlertas.appendChild(article);
  });
}

async function buscarAvisosDoSupabase(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("avisos")
      .select("id, titulo, desc, data")
      .order("data", { ascending: false });

    if (error) throw error;

    if (data) {
      renderizarAlertasSimples(data as Aviso[]);
    }
  } catch (error) {
    console.error("Erro ao buscar avisos do Supabase:", error);
  }
}

buscarAvisosDoSupabase();
carregarEstatisticas();
