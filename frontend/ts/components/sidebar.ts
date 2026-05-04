export function renderizarSidebar(containerId: string, paginaAtiva: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <img src="./assets/Header/AUO Logo.svg" alt="Logo AUO" class="logo-img">
                <div class="logo-text">
                    <h2>A.U.O</h2>
                    <p>Portal Universitário</p>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <a href="index.html" class="menu-item ${paginaAtiva === 'dashboard' ? 'active' : ''}">
                    <i data-lucide="layout-dashboard"></i> Dashboard
                </a>
                <a href="consultar-rota.html" class="menu-item ${paginaAtiva === 'rota' ? 'active' : ''}">
                    <i data-lucide="route"></i> Consultar Rota
                </a>
                <a href="formulario-semanal.html" class="menu-item ${paginaAtiva === 'formulario' ? 'active' : ''}">
                    <i data-lucide="calendar-check"></i> Formulário Semanal
                </a>
                <a href="perfil.html" class="menu-item ${paginaAtiva === 'perfil' ? 'active' : ''}">
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

    // @ts-ignore
    if (window.lucide) { lucide.createIcons(); }
}