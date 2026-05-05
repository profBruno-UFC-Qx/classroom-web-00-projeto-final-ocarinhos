type AlunoStatus = "ativo" | "inativo";

interface AlunoFormState {
  nome: string;
  email: string;
  faculdade: string;
  curso: string;
  status: AlunoStatus;
}

const editButtons = document.querySelectorAll<HTMLButtonElement>(".edit");
const modalOverlay = document.querySelector<HTMLElement>(".alunosModalOverlay");
const closeButton = document.querySelector<HTMLButtonElement>(".alunosModalClose");
const cancelButton = document.querySelector<HTMLButtonElement>(".alunosModalCancel");
const form = document.querySelector<HTMLFormElement>(".alunosModalForm");
const nomeInput = document.querySelector<HTMLInputElement>("#alunoNome");
const emailInput = document.querySelector<HTMLInputElement>("#alunoEmail");
const faculdadeInput = document.querySelector<HTMLInputElement>("#alunoFaculdade");
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
  if (!modalOverlay || !nomeInput || !emailInput || !faculdadeInput || !cursoInput || !statusInput) {
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

editButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest("tr");

    if (row instanceof HTMLTableRowElement) {
      openModal(row);
    }
  });
});

closeButton?.addEventListener("click", closeModal);
cancelButton?.addEventListener("click", closeModal);

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

export {};