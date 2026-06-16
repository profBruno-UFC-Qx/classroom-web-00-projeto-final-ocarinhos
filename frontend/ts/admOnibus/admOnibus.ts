import { renderizarSidebar } from "../components/sidebarADM.js";
import showTopMessage from "../utils/showMsg.js";
import { supabase } from "../supabase/supabase.js";

renderizarSidebar("sidebar-container", "onibus");

interface Onibus {
  id: number;
  nome: string;
  placa: string;
  disponivel: boolean;
}

interface OnibusFormData {
  nome: string;
  placa: string;
  disponivel: boolean;
}

const table = document.querySelector<HTMLTableElement>(".motoristasTable");
const createButton =
  document.querySelector<HTMLButtonElement>(".efetuarCadastro");
const modalOverlay = document.querySelector<HTMLDivElement>(
  ".motoristasModalOverlay"
);
const modalForm = document.querySelector<HTMLFormElement>(
  ".motoristasModalForm"
);
const modalTitle =
  document.querySelector<HTMLHeadingElement>("#onibusModalTitle");
const modalEyebrow = document.querySelector<HTMLElement>(
  ".motoristasModalEyebrow"
);
const modalDescription = document.querySelector<HTMLElement>(
  ".motoristasModalHeader p"
);
const closeButton = document.querySelector<HTMLButtonElement>(
  ".motoristasModalClose"
);
const cancelButton = document.querySelector<HTMLButtonElement>(
  ".motoristasModalCancel"
);
const nomeInput =
  modalForm?.querySelector<HTMLInputElement>('input[name="nome"]') ?? null;
const placaInput =
  modalForm?.querySelector<HTMLInputElement>('input[name="placa"]') ?? null;
const disponivelInput =
  modalForm?.querySelector<HTMLSelectElement>('select[name="disponivel"]') ??
  null;

let editingOnibusId: number | null = null;
let tableBody = table?.querySelector<HTMLTableSectionElement>("tbody") ?? null;

function ensureTableBody(): HTMLTableSectionElement | null {
  if (!table) {
    return null;
  }

  if (tableBody) {
    return tableBody;
  }

  tableBody = document.createElement("tbody");
  const tfoot = table.querySelector("tfoot");

  if (tfoot) {
    table.insertBefore(tableBody, tfoot);
  } else {
    table.appendChild(tableBody);
  }

  return tableBody;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readFormData(): OnibusFormData {
  return {
    nome: nomeInput?.value.trim() ?? "",
    placa: placaInput?.value.trim() ?? "",
    disponivel: disponivelInput?.value === "true",
  };
}

function setModalState(mode: "create" | "edit") {
  if (!modalOverlay || !modalTitle || !modalEyebrow || !modalDescription) {
    return;
  }

  modalEyebrow.textContent =
    mode === "create" ? "Cadastro de ônibus" : "Edição de ônibus";
  modalTitle.textContent =
    mode === "create" ? "Cadastrar ônibus" : "Editar ônibus";
  modalDescription.textContent =
    mode === "create"
      ? "Preencha os dados abaixo para cadastrar um novo ônibus."
      : "Atualize as informações do ônibus selecionado.";
}

function openModal(onibus?: Onibus) {
  if (
    !modalOverlay ||
    !modalForm ||
    !nomeInput ||
    !placaInput ||
    !disponivelInput
  ) {
    return;
  }

  editingOnibusId = onibus?.id ?? null;
  setModalState(onibus ? "edit" : "create");

  nomeInput.value = onibus?.nome ?? "";
  placaInput.value = onibus?.placa ?? "";
  disponivelInput.value = onibus ? String(onibus.disponivel) : "true";

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  nomeInput.focus();
}

function closeModal() {
  if (!modalOverlay || !modalForm) {
    return;
  }

  modalOverlay.hidden = true;
  document.body.style.overflow = "";
  editingOnibusId = null;
  modalForm.reset();
  setModalState("create");
}

function renderRows(onibusList: Onibus[]) {
  const body = ensureTableBody();

  if (!body) {
    showTopMessage("Tabela de ônibus não encontrada.", "error");
    return;
  }

  if (onibusList.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="tfoot-info">Nenhum ônibus cadastrado.</td>
      </tr>
    `;
    return;
  }

  onibusList.forEach((onibus) => {
    const tr = document.createElement("tr");
    tr.dataset.onibusId = String(onibus.id);

    tr.innerHTML = `
      <td class="name">
        <i class="bi bi-bus-front" aria-hidden="true"></i>
        ${escapeHtml(onibus.nome)}
      </td>
      <td>${escapeHtml(onibus.placa)}</td>
      <td>
        <span class="qtdAlunos">${onibus.disponivel ? "Disponível" : "Indisponível"}</span>
      </td>
      <td class="buttons">
        <button type="button" aria-label="Editar" class="edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" aria-label="Excluir" class="delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    body.appendChild(tr);
  });
}

async function carregarOnibus() {
  const { data, error } = await supabase
    .from("onibus")
    .select("id, nome, placa, disponivel")
    .order("id", { ascending: false });

  if (error) {
    showTopMessage("Não foi possível carregar os ônibus.", "error");
    return;
  }

  renderRows((data ?? []) as Onibus[]);
}

async function salvarOnibus(formData: OnibusFormData) {
  const payload = {
    nome: formData.nome,
    placa: formData.placa,
    disponivel: formData.disponivel,
  };

  if (editingOnibusId) {
    const { error } = await supabase
      .from("onibus")
      .update(payload)
      .eq("id", editingOnibusId)
      .select("id, nome, placa, disponivel");

    console.log("erro1: ", error);

    if (error) {
      throw error;
    }

    showTopMessage("Ônibus atualizado com sucesso.", "alert");
    closeModal();
    await carregarOnibus();
    return;
  }

  const { error } = await supabase
    .from("onibus")
    .insert(payload)
    .select("id, nome, placa, disponivel");

  console.log("erro1: ", error);

  if (error) {
    throw error;
  }

  showTopMessage("Ônibus cadastrado com sucesso.", "alert");
  closeModal();
  await carregarOnibus();
}

createButton?.addEventListener("click", () => {
  openModal();
});

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

closeButton?.addEventListener("click", closeModal);
cancelButton?.addEventListener("click", closeModal);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalOverlay?.hidden) {
    closeModal();
  }
});

modalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = readFormData();

  if (
    !formData.nome ||
    !formData.placa ||
    typeof formData.disponivel !== "boolean"
  ) {
    showTopMessage("Preencha todos os campos do ônibus.", "error");
    return;
  }

  try {
    await salvarOnibus(formData);
  } catch (error) {
    showTopMessage("Não foi possível salvar o ônibus.", "error");
  }
});

table?.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>("button");
  const row = target?.closest<HTMLTableRowElement>("tr[data-onibus-id]");

  if (!button || !row) {
    return;
  }

  const onibusId = Number(row.dataset.onibusId);
  const action = button.classList.contains("edit")
    ? "edit"
    : button.classList.contains("delete")
      ? "delete"
      : null;

  if (!action) {
    return;
  }

  const { data } = await supabase
    .from("onibus")
    .select("id, nome, placa, disponivel")
    .eq("id", onibusId)
    .maybeSingle();

  if (!data) {
    return;
  }

  if (action === "edit") {
    openModal(data as Onibus);
  }

  if (action === "delete") {
    const confirmou = window.confirm("Deseja excluir este ônibus?");

    if (!confirmou) {
      return;
    }

    const { error } = await supabase.from("onibus").delete().eq("id", onibusId);

    if (error) {
      showTopMessage("Não foi possível excluir o ônibus.", "error");
      return;
    }

    showTopMessage("Ônibus excluído com sucesso.", "alert");
    await carregarOnibus();
  }
});

void carregarOnibus();
