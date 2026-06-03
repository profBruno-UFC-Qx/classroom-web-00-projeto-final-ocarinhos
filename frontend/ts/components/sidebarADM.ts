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
    <a href="dashboard.html" class="menu-item ${paginaAtiva === 'dashboard' ? 'active' : ''}">
        <i data-lucide="layout-dashboard"></i> Dashboard
    </a>
    <a href="alunos.html" class="menu-item ${paginaAtiva === 'alunos' ? 'active' : ''}">
        <i data-lucide="graduation-cap"></i> Alunos
    </a>
    <a href="faculdades.html" class="menu-item ${paginaAtiva === 'faculdades' ? 'active' : ''}">
        <i data-lucide="landmark"></i> Faculdades
    </a>
    <a href="/admin/onibus.html" class="menu-item ${paginaAtiva === 'onibus' ? 'active' : ''}">
        <i data-lucide="bus"></i> Ônibus
    </a>
    <a href="motoristas.html" class="menu-item ${paginaAtiva === 'motoristas' ? 'active' : ''}">
        <i data-lucide="user-cog"></i> Motoristas
    </a>
    <a href="rotas-complementares.html" class="menu-item ${paginaAtiva === 'rotas' ? 'active' : ''}">
        <i data-lucide="route"></i> Rotas complementares
    </a>
    <a href="/admin/frequencia.html" class="menu-item ${paginaAtiva === 'frequencia' ? 'active' : ''}">
        <i data-lucide="calendar-days"></i> Frequência
    </a>
    <a href="avisos.html" class="menu-item ${paginaAtiva === 'avisos' ? 'active' : ''}">
        <i data-lucide="megaphone"></i> Avisos
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
  if (window.lucide) {
    // @ts-ignore
    lucide.createIcons();
  }
}
