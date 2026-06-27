import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";

export function renderizarSidebar(containerId: string, paginaAtiva: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <img src="../assets/Header/AUO Logo.svg" alt="Logo AUO" class="logo-img">
                <div class="logo-text">
                    <h2>A.U.O</h2>
                    <p>Portal Universitário</p>
                </div>
            </div>
            
<nav class="sidebar-nav">
    <a href="dashboard.html" class="menu-item ${paginaAtiva === "dashboard" ? "active" : ""}">
        <i data-lucide="layout-dashboard"></i> Dashboard
    </a>
    <a href="alunos.html" class="menu-item ${paginaAtiva === "alunos" ? "active" : ""}">
        <i data-lucide="graduation-cap"></i> Alunos
    </a>
    <a href="faculdades.html" class="menu-item ${paginaAtiva === "faculdades" ? "active" : ""}">
        <i data-lucide="landmark"></i> Faculdades
    </a>
    <a href="onibus.html" class="menu-item ${paginaAtiva === 'onibus' ? 'active' : ''}">
        <i data-lucide="bus"></i> Ônibus
    </a>
    <a href="motoristas.html" class="menu-item ${paginaAtiva === "motoristas" ? "active" : ""}">
        <i data-lucide="user-cog"></i> Motoristas
    </a>
    <a href="rotas-complementares.html" class="menu-item ${paginaAtiva === "rotas" ? "active" : ""}">
        <i data-lucide="route"></i> Rotas complementares
    </a>
    <a href="/admin/frequencia.html" class="menu-item ${paginaAtiva === "frequencia" ? "active" : ""}">
        <i data-lucide="calendar-days"></i> Frequência
    </a>
    <a href="avisos.html" class="menu-item ${paginaAtiva === "avisos" ? "active" : ""}">
        <i data-lucide="megaphone"></i> Avisos
    </a>
</nav>

            <div class="sidebar-footer">
                <a href="../aluno/login.html" class="menu-item logout">
                    <i data-lucide="log-out"></i> Sair
                </a>
            </div>
        </aside>
    `;

  const logOut = container.querySelector(".logout");
  if (logOut instanceof HTMLAnchorElement) {
    async function signOut() {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }else if (key.startsWith("auo")) {
          localStorage.removeItem(key);
        }
      });
    }

    logOut.addEventListener("click", signOut);
  }

  // @ts-ignore
  if (window.lucide) {
    // @ts-ignore
    lucide.createIcons();
  }
    const logoutBtn = document.querySelector(".logout");

    logoutBtn?.addEventListener("click", async (event) => {
        event.preventDefault();

        await supabase.auth.signOut();

        localStorage.removeItem("auo-user-name");

        window.location.href = "../../aluno/login.html";
    });

    const renderIcons = () => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            lucide.createIcons();
        }
    };

    supabase.auth.getSession().then((result: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
        const user = result.data.session?.user;

        if (!user) {
            window.location.replace("../../aluno/login.html");
            return;
        }

        const nomeUsuario = String(
            user?.user_metadata?.nome ??
                localStorage.getItem("auo-user-name") ??
                user?.email ??
                "Aluno"
        );

        document.querySelectorAll<HTMLElement>(".user-nickname").forEach((element) => {
            element.textContent = nomeUsuario;
        });

        renderIcons();
    });

    const existingLoader = document.querySelector<HTMLScriptElement>(
        'script[data-lucide-loader="true"]'
    );

    if (!existingLoader && !(window as typeof window & { lucide?: unknown }).lucide) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/lucide@latest";
        script.defer = true;
        script.dataset.lucideLoader = "true";
        script.addEventListener("load", renderIcons, { once: true });
        document.body.appendChild(script);
    }
}
