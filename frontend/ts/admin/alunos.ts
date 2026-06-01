import { supabase } from "../supabase/supabase.js";
import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");

type AlunoStatus = "ativo" | "inativo";

interface AlunoFormState {
  nome: string;
  email: string;
  faculdade: string;
  curso: string;
  status: AlunoStatus;
}

interface AlunoResponse {
  user_id: number;
  nome: string;
  email: string;
  faculdade: string;
  curso: string;
  status: AlunoStatus;
}

const modalOverlay = document.querySelector<HTMLElement>(".alunosModalOverlay");
const form = document.querySelector<HTMLFormElement>(".alunosModalForm");
const nomeInput = document.querySelector<HTMLInputElement>("#alunoNome");
const emailInput = document.querySelector<HTMLInputElement>("#alunoEmail");
const faculdadeInput =
  document.querySelector<HTMLInputElement>("#alunoFaculdade");
const cursoInput = document.querySelector<HTMLInputElement>("#alunoCurso");
const statusInput = document.querySelector<HTMLSelectElement>("#alunoStatus");

let currentRow: HTMLTableRowElement | null = null;

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
  const { data, error } = await supabase.from<"usuarios", Array<AlunoResponse>>(
    "usuarios"
  ).select(`
      user_id,
      nome,
      email,
      curso,
      status,
      ies
    `);

  if (error) {
    console.error("Erro ao buscar dados do Supabase:", error.message);
    return;
  }

  const tabela = document.querySelector(
    ".alunosTable"
  ) as HTMLTableElement | null;
  if (!tabela) {
    console.error("Tabela .alunosTable não encontrada.");
    return;
  }

  const tfoot = tabela.querySelector("tfoot");

  data.forEach((usuario) => {
    const nomeFaculdade = usuario.ies?.nome_faculdade || "Não informada";
    const statusTexto = usuario.status ? "ativo" : "inativo";
    const statusLabel = usuario.status ? "ATIVO" : "INATIVO";

    const tr = document.createElement("tr");

    tr.setAttribute("data-aluno-id", usuario.user_id);
    tr.setAttribute("data-aluno-nome", usuario.nome);
    tr.setAttribute("data-aluno-email", usuario.email);
    tr.setAttribute("data-aluno-faculdade", nomeFaculdade);
    tr.setAttribute("data-aluno-curso", usuario.curso);
    tr.setAttribute("data-aluno-status", statusTexto);

    tr.innerHTML = `
      <td class="name">
        <i class="bi bi-person-circle" aria-hidden="true"></i> ${usuario.nome}
      </td>
      <td>${usuario.email}</td>
      <td>${nomeFaculdade}</td>
      <td>${usuario.curso}</td>
      <td><span class="${statusTexto}">${statusLabel}</span></td>
      <td class="buttons">
        <button type="button" aria-label="Editar" class="edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" aria-label="Excluir" class="delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    const editButon = tr.querySelector(
      "[aria-label='Editar']"
    ) as HTMLButtonElement;
    editButon.addEventListener("click", function () {
      openModal(tr);
    });

    if (tfoot) {
      tabela.insertBefore(tr, tfoot);
    } else {
      tabela.appendChild(tr);
    }
  });
}

await renderizarAlunosSupabase();

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

  if (
    !currentRow ||
    !nomeInput ||
    !emailInput ||
    !faculdadeInput ||
    !cursoInput ||
    !statusInput
  ) {
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

export {};
