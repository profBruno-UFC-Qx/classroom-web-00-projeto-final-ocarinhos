import { supabase } from "../supabase/supabase.js";

export function renderizarSidebar(containerId: string, paginaAtiva: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <aside class="sidebar">
            <div class="sidebar-header" onclick="window.location.href='index.html'" style="cursor: pointer;">
                <img src="../assets/Header/AUO Logo.svg" alt="Logo AUO" class="logo-img">
                <div class="logo-text">
                    <h2>A.U.O</h2>
                    <p>Portal Universitário</p>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <a href="dashBoardAluno.html" class="menu-item ${paginaAtiva === 'dashboard' ? 'active' : ''}">
                    <i data-lucide="layout-dashboard"></i> Dashboard
                </a>
                <a href="consultar-rota.html" class="menu-item ${paginaAtiva === 'rota' ? 'active' : ''}">
                    <i data-lucide="route"></i> Consultar Rota
                </a>
                <a href="formulario-semanal.html" class="menu-item ${paginaAtiva === 'formulario' ? 'active' : ''}">
                    <i data-lucide="calendar-check"></i> Formulário Semanal
                </a>
                <a href="perfilAluno.html" class="menu-item ${paginaAtiva === 'perfil' ? 'active' : ''}">
                    <i data-lucide="user"></i> Perfil
                </a>
            </nav>

            <div class="sidebar-footer">
                <a href="login.html" class="menu-item logout">
                    <i data-lucide="log-out"></i> Sair
                </a>
            </div>
        </aside>
    `;

    
    const renderIcons = () => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            lucide.createIcons();
        }
    };
    
    const logoutBtn = document.querySelector(".logout");
    logoutBtn?.addEventListener("click", async (event) => {
        event.preventDefault();

        await supabase.auth.signOut();

        localStorage.removeItem("auo-user-name");

        window.location.href = "/frontend/aluno/login.html";
    });
    
    supabase.auth.getSession().then((result: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
        const user = result.data.session?.user;

        if (!user) {
            window.location.replace("login.html");
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