import { supabase } from "../supabase/supabase.js";
import { renderizarSidebar } from "../components/sidebarADM.js";
renderizarSidebar("sidebar-container", "alunos");

type AlunoStatus = "ativo" | "inativo";

interface AlunoFormState {
  nome: string;
  email: string;
  faculdade: string;
  curso: string;
  status: AlunoStatus;
}

interface AlunoResponse {
  user_id: string;
  nome: string;
  email: string;
  curso: string;
  status: boolean;
  ies?: {
    id: number;
    nome: string;
  };
}

const modalOverlay = document.querySelector<HTMLElement>(".alunosModalOverlay");
const form = document.querySelector<HTMLFormElement>(".alunosModalForm");
const nomeInput = document.querySelector<HTMLInputElement>("#alunoNome");
const emailInput = document.querySelector<HTMLInputElement>("#alunoEmail");
const faculdadeInput = document.querySelector<HTMLInputElement>("#alunoFaculdade");
const cursoInput = document.querySelector<HTMLInputElement>("#alunoCurso");
const statusInput = document.querySelector<HTMLSelectElement>("#alunoStatus");
const searchInput = document.querySelector<HTMLInputElement>(".alunosSearch input");
const faculdadeFilter = document.querySelector<HTMLSelectElement>("#filtro");

let currentRow: HTMLTableRowElement | null = null;

let alunos: AlunoResponse[] = [];
let paginaAtual = 1;

const itensPorPagina = 5;

async function carregarFaculdades() {
  const { data, error } = await supabase
    .from("faculdades")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error(error.message);
    return;
  }

  if (!faculdadeFilter) {
    return;
  }

  faculdadeFilter.innerHTML =
    '<option value="">Todas as Faculdades</option>';

  data.forEach((faculdade: any) => {
    const option = document.createElement("option");

    option.value = String(faculdade.id);

    option.textContent = faculdade.nome;

    faculdadeFilter.appendChild(option);
  });
}

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchValue(): string {
  return searchInput?.value.trim() ?? "";
}

function getFilteredAlunos(): AlunoResponse[] {
  const query = normalizeText(getSearchValue());

  const faculdadeSelecionada = faculdadeFilter?.value ?? "";

  return alunos.filter((aluno) => {
    const correspondePesquisa =
      !query ||
      normalizeText(aluno.nome).includes(query) ||
      normalizeText(aluno.email).includes(query) ||
      normalizeText(aluno.curso).includes(query);

    const correspondeFaculdade =
      !faculdadeSelecionada ||
      aluno.ies?.id ===
        Number(faculdadeSelecionada);

    return (
      correspondePesquisa &&
      correspondeFaculdade
    );
  });
}

function readRowData(row: HTMLTableRowElement): AlunoFormState {
  return {
    nome: row.dataset.alunoNome ?? "",
    email: row.dataset.alunoEmail ?? "",
    faculdade: row.dataset.alunoFaculdade ?? "",
    curso: row.dataset.alunoCurso ?? "",
    status: (row.dataset.alunoStatus as AlunoStatus) ?? "ativo",
  };
}

function writeRowData(row: HTMLTableRowElement, data: AlunoFormState) {
  row.dataset.alunoNome = data.nome;
  row.dataset.alunoEmail = data.email;
  row.dataset.alunoFaculdade = data.faculdade;
  row.dataset.alunoCurso = data.curso;
  row.dataset.alunoStatus = data.status;

  const cells = row.querySelectorAll<HTMLTableCellElement>("td");
  const statusBadge = cells[4]?.querySelector("span");

  if (cells[0]) {
    cells[0].innerHTML = `<i class="bi bi-person-circle" aria-hidden="true"></i> ${data.nome}`;
  }

  if (cells[1]) {
    cells[1].textContent = data.email;
  }

  if (cells[2]) {
    cells[2].textContent = data.faculdade;
  }

  if (cells[3]) {
    cells[3].textContent = data.curso;
  }

  if (statusBadge) {
    statusBadge.textContent = data.status === "ativo" ? "ATIVO" : "INATIVO";
    statusBadge.classList.toggle("ativo", data.status === "ativo");
    statusBadge.classList.toggle("inativo", data.status === "inativo");
  }
}

function openModal(row: HTMLTableRowElement) {
  if (
    !modalOverlay ||
    !nomeInput ||
    !emailInput ||
    !faculdadeInput ||
    !cursoInput ||
    !statusInput
  ) {
    return;
  }

  currentRow = row;
  const data = readRowData(row);

  nomeInput.value = data.nome;
  emailInput.value = data.email;
  faculdadeInput.value = data.faculdade;
  cursoInput.value = data.curso;
  statusInput.value = data.status;

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  nomeInput.focus();
}

function closeModal() {
  if (!modalOverlay) {
    return;
  }

  modalOverlay.hidden = true;
  document.body.style.overflow = "";
  currentRow = null;
}

async function renderizarAlunosSupabase() {
  const { data, error } = await supabase
    .from<"usuarios", Array<AlunoResponse>>("usuarios")
    .select(`
      user_id,
      nome,
      email,
      curso,
      status,
      ies (
        id,
        nome
      )
    `);

  if (error) {
    console.error(error.message);
    return;
  }

  alunos = data;

  renderizarPagina();
}

function renderizarPagina() {
  const tabela = document.querySelector(
    ".alunosTable"
  ) as HTMLTableElement | null;

  if (!tabela) return;

  const tfoot = tabela.querySelector("tfoot");

  if (tfoot) {
    while (tabela.rows.length > 2) {
      tabela.deleteRow(1);
    }
  }

  const alunosFiltrados = getFilteredAlunos();

  const totalPaginas = Math.max(1, Math.ceil(alunosFiltrados.length / itensPorPagina));

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
  }

  const inicio = (paginaAtual - 1) * itensPorPagina;

  const alunosPagina = alunosFiltrados.slice(inicio, inicio + itensPorPagina);

  alunosPagina.forEach((usuario) => {
    const nomeFaculdade = usuario.ies?.nome ?? "Não informado";

    const statusTexto = usuario.status ? "ativo" : "inativo";
    const statusLabel = usuario.status ? "ATIVO" : "INATIVO";

    const tr = document.createElement("tr");

    tr.dataset.alunoId = String(usuario.user_id);
    tr.dataset.alunoNome = usuario.nome;
    tr.dataset.alunoEmail = usuario.email;
    tr.dataset.alunoFaculdade = nomeFaculdade;
    tr.dataset.alunoCurso = usuario.curso;
    tr.dataset.alunoStatus = statusTexto;

    tr.innerHTML = `
      <td class="name">
        <i class="bi bi-person-circle"></i>
        ${usuario.nome}
      </td>
      <td>${usuario.email}</td>
      <td>${nomeFaculdade}</td>
      <td>${usuario.curso}</td>
      <td>
        <span class="${statusTexto}">
          ${statusLabel}
        </span>
      </td>
      <td class="buttons">
        <button type="button" aria-label="Editar" class="edit">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    `;

    tr.querySelector(".edit")?.addEventListener("click", () => {
      openModal(tr);
    });

    if (tfoot) {
      tabela.insertBefore(tr, tfoot);
    } else {
      tabela.appendChild(tr);
    }
  });

  atualizarRodape();
}

function atualizarRodape() {
  const info = document.querySelector<HTMLElement>(".tfoot-info");
  const alunosFiltrados = getFilteredAlunos();

  if (info) {
    const inicio = alunosFiltrados.length === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;

    const fim = Math.min(paginaAtual * itensPorPagina, alunosFiltrados.length);

    info.textContent = `Mostrando ${inicio} a ${fim} de ${alunosFiltrados.length} alunos`;
  }

  const totalPaginas = Math.max(1, Math.ceil(getFilteredAlunos().length / itensPorPagina));

  const container = document.querySelector(".pagination-pages");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {

    const li = document.createElement("li");

    const button = document.createElement("button");

    button.className = `page${pagina === paginaAtual ? " active" : ""}`;

    button.textContent = String(pagina);

    button.addEventListener("click", () => {
      paginaAtual = pagina;
      renderizarPagina();
    });

    li.appendChild(button);

    container.appendChild(li);
  }

  const prev = document.querySelector<HTMLButtonElement>(
    ".prev button"
  );

  prev?.replaceWith(prev.cloneNode(true));

  document.querySelector<HTMLButtonElement>(".prev button")?.addEventListener("click", () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarPagina();
    }
  });

  const next = document.querySelector<HTMLButtonElement>(".next button");

  next?.replaceWith(next.cloneNode(true));

  document.querySelector<HTMLButtonElement>(".next button")?.addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarPagina();
    }
  });
}

await Promise.all([
  renderizarAlunosSupabase(),
  carregarFaculdades(),
]);

faculdadeFilter?.addEventListener("change", () => {
    paginaAtual = 1;
    renderizarPagina();
});

searchInput?.addEventListener("input", () => {
  paginaAtual = 1;

  renderizarPagina();
});

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalOverlay?.hidden) {
    closeModal();
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!currentRow || !nomeInput || !emailInput || !faculdadeInput || !cursoInput || !statusInput) {
    return;
  }

  writeRowData(currentRow, {
    nome: nomeInput.value.trim(),
    email: emailInput.value.trim(),
    faculdade: faculdadeInput.value.trim(),
    curso: cursoInput.value.trim(),
    status: statusInput.value as AlunoStatus,
  });

  closeModal();
});

document.querySelectorAll("[aria-label='FecharEdit']").forEach((btn) => {
  btn.addEventListener("click", closeModal);
});

export {};