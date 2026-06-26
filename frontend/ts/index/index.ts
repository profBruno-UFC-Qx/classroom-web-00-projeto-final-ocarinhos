import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";

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

async function fetchEstatisticas() {
  const { count: totalMotorista, error: errMotorista } = await supabase
    .from("motoristas")
    .select("*", { count: "exact", head: true });

  inserirTotalMotoristas(totalMotorista);

  const { count: totalAlunos, error: errAlunos } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true });

  inserirTotalAlunos(totalAlunos);

  const { count: totalOnibus, error: errOnibus } = await supabase
    .from("onibus")
    .select("*", { count: "exact", head: true });

  inserirTotalOnibus(totalOnibus);
}

function inserirTotalMotoristas(totalMotorista: number) {
  const cell = document.querySelector(".qtd-motoristas") as HTMLSpanElement;

  cell.innerText = String(totalMotorista);
}

function inserirTotalAlunos(totalAlunos: number) {
  const cell = document.querySelector(".qtd-alunos") as HTMLSpanElement;

  cell.innerText = String(totalAlunos);
}

function inserirTotalOnibus(totalOnibus: number) {
  const cell = document.querySelector(".qtd-onibus") as HTMLSpanElement;

  cell.innerText = String(totalOnibus);
}

fetchEstatisticas();

async function fetchAvisos() {
  const { data, error } = (await supabase
  .from("avisos")
  .select("*")
  .order("data", { ascending: false })) as {
    data: Array<Aviso>;
    error: any;
  };

  if (error) {
    showTopMessage("Não foi possível fazer o fetch dos avisos", "error");
    return;
  }

  inserirAvisos(data);
}

function inserirAvisos(avisos: Array<Aviso>) {
  const painel = document.querySelector(".alerts-grid");

  if (painel instanceof HTMLDivElement) {
    avisos.forEach((aviso) => {
      const uniqueAviso = document.createElement("article");
      uniqueAviso.classList.add("alert-card");
      const data = new Date(aviso.data);
      uniqueAviso.innerHTML = `
      <p class="alert-type alert-type-info">
                <i class="bi bi-info-circle"></i> Informativo
              </p>
              <h4>${aviso.titulo}</h4>
              <p>
                ${aviso.desc}
              </p>
              <time>${data.toLocaleDateString()}</time>`;

      painel.appendChild(uniqueAviso);
    });
  }
}

fetchAvisos();
