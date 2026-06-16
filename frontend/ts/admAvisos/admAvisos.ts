import { renderizarSidebar } from "../components/sidebarADM.js";
import showTopMessage from "../utils/showMsg.js";
import { supabase } from "../supabase/supabase.js";

renderizarSidebar("sidebar-container", "avisos");

interface Aviso {
  id: number;
  titulo: string;
  desc: string;
  data: string;
}

interface AvisoFormData {
  titulo: string;
  desc: string;
  data: string;
}

const pageSize = 5;
let todosAvisos: Aviso[] = [];
let currentPage = 1;
let currentSort: "desc" | "asc" = "desc";
let editingAvisoId: number | null = null;

const tableBody = document.querySelector<HTMLTableSectionElement>(".avisosTable tbody");
const searchInput = document.querySelector<HTMLInputElement>(".avisosSearchField input");
const sortButton = document.querySelector<HTMLButtonElement>("[data-sort-button]");
const createButton = document.querySelector<HTMLButtonElement>("[data-create-button]");
const exportButton = document.querySelector<HTMLButtonElement>("[data-export-button]");
const overlay = document.querySelector<HTMLDivElement>(".avisosModalOverlay");
const modalTitle = document.querySelector<HTMLElement>("[data-modal-title]");
const modalEyebrow = document.querySelector<HTMLElement>("[data-modal-eyebrow]");
const modalDescription = document.querySelector<HTMLElement>("[data-modal-description]");
const modalForm = document.querySelector<HTMLFormElement>(".avisosModalForm");
const pageRange = document.querySelector<HTMLElement>("[data-page-range]");
const totalCount = document.querySelector<HTMLElement>("[data-total-count]");
const pagination = document.querySelector<HTMLElement>("[data-pagination]");
const prevPageButton = document.querySelector<HTMLButtonElement>("[data-prev-page]");
const nextPageButton = document.querySelector<HTMLButtonElement>("[data-next-page]");
const closeModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-close-modal]");

const tituloInput = modalForm?.querySelector<HTMLInputElement>('input[name="titulo"]') ?? null;
const descInput = modalForm?.querySelector<HTMLTextAreaElement>('textarea[name="desc"]') ?? null;
const dataInput = modalForm?.querySelector<HTMLInputElement>('input[name="data"]') ?? null;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "--/--/--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function formatDateTimeLocal(dateValue: string | Date): string {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return formatDateTimeLocal(new Date());
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchValue(): string {
  return searchInput?.value.trim() ?? "";
}

function getFilteredAvisos(): Aviso[] {
  const query = normalizeText(getSearchValue());

  const filtered = todosAvisos.filter((aviso) => {
    if (!query) {
      return true;
    }

    return (
      normalizeText(aviso.titulo).includes(query) ||
      normalizeText(aviso.desc).includes(query)
    );
  });

  return [...filtered].sort((left, right) => {
    const leftDate = new Date(left.data).getTime();
    const rightDate = new Date(right.data).getTime();

    return currentSort === "desc" ? rightDate - leftDate : leftDate - rightDate;
  });
}

function getPageCount(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

function ensureCurrentPage(pageCount: number): void {
  if (currentPage > pageCount) {
    currentPage = pageCount;
  }

  if (currentPage < 1) {
    currentPage = 1;
  }
}

function renderPagination(pageCount: number): void {
  if (!pagination || !prevPageButton || !nextPageButton) {
    return;
  }

  pagination.innerHTML = "";

  const pageButtons = Array.from({ length: pageCount }, (_, index) => index + 1);
  const compactButtons = pageButtons.slice(0, 3);

  compactButtons.forEach((pageNumber) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `avisosPageButton${pageNumber === currentPage ? " active" : ""}`;
    button.textContent = String(pageNumber);
    button.setAttribute("aria-current", pageNumber === currentPage ? "page" : "false");

    button.addEventListener("click", () => {
      currentPage = pageNumber;
      renderTable();
    });

    pagination.appendChild(button);
  });

  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === pageCount;
}

function renderTable(): void {
  if (!tableBody || !pageRange || !totalCount) {
    return;
  }

  const filteredAvisos = getFilteredAvisos();
  const pageCount = getPageCount(filteredAvisos.length);

  ensureCurrentPage(pageCount);

  const startIndex = (currentPage - 1) * pageSize;
  const visibleAvisos = filteredAvisos.slice(startIndex, startIndex + pageSize);

  tableBody.innerHTML = "";

  if (visibleAvisos.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="avisosEmptyState">Nenhum aviso encontrado.</td>
      </tr>
    `;
  } else {
    visibleAvisos.forEach((aviso) => {
      const tr = document.createElement("tr");
      tr.dataset.id = String(aviso.id);

      tr.innerHTML = `
        <td>
          <div class="avisosTitleCell">
            <span class="avisosTitleIcon" aria-hidden="true">
              <i class="bi bi-megaphone"></i>
            </span>
            <span>${escapeHtml(aviso.titulo.toUpperCase())}</span>
          </div>
        </td>
        <td class="avisosDescCell">${escapeHtml(aviso.desc)}</td>
        <td>
          <span class="avisosDateChip">${formatDate(aviso.data)}</span>
        </td>
        <td class="avisosActionsCell">
          <div class="avisosRowActions">
            <button type="button" class="avisosIconButton edit" data-action="edit" aria-label="Editar aviso">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="avisosIconButton delete" data-action="delete" aria-label="Excluir aviso">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  const totalItems = filteredAvisos.length;
  const showingStart = totalItems === 0 ? 0 : startIndex + 1;
  const showingEnd = totalItems === 0 ? 0 : Math.min(startIndex + pageSize, totalItems);

  pageRange.textContent = `${showingStart}-${showingEnd}`;
  totalCount.textContent = String(totalItems);

  renderPagination(pageCount);
}

function setSortLabel(): void {
  if (!sortButton) {
    return;
  }

  sortButton.setAttribute(
    "aria-pressed",
    currentSort === "asc" ? "true" : "false"
  );
  sortButton.title = currentSort === "desc" ? "Mais recentes" : "Mais antigos";
}

function openModal(aviso?: Aviso): void {
  if (!overlay || !modalTitle || !modalEyebrow || !modalDescription || !modalForm) {
    return;
  }

  editingAvisoId = aviso?.id ?? null;

  modalEyebrow.textContent = aviso ? "Edição de aviso" : "Novo aviso";
  modalTitle.textContent = aviso ? "Editar aviso" : "Cadastrar aviso";
  modalDescription.textContent = aviso
    ? "Atualize o título, a descrição e a data do aviso selecionado."
    : "Preencha os campos abaixo para publicar um novo aviso.";

  if (tituloInput) {
    tituloInput.value = aviso?.titulo ?? "";
  }

  if (descInput) {
    descInput.value = aviso?.desc ?? "";
  }

  if (dataInput) {
    dataInput.value = aviso ? formatDateTimeLocal(aviso.data) : formatDateTimeLocal(new Date());
  }

  overlay.hidden = false;
}

function closeModal(): void {
  if (!overlay || !modalForm) {
    return;
  }

  overlay.hidden = true;
  editingAvisoId = null;
  modalForm.reset();

  if (dataInput) {
    dataInput.value = formatDateTimeLocal(new Date());
  }
}

async function carregarAvisos(): Promise<void> {
  const { data, error } = await supabase
    .from("avisos")
    .select("id, titulo, desc, data")
    .order("data", { ascending: false });

  if (error) {
    showTopMessage("Não foi possível carregar os avisos.", "error");
    return;
  }

  todosAvisos = (data ?? []) as Aviso[];
  currentPage = 1;
  renderTable();
}

async function salvarAviso(formData: AvisoFormData): Promise<void> {
  const payload = {
    titulo: formData.titulo,
    desc: formData.desc,
    data: new Date(formData.data).toISOString(),
  };

  if (editingAvisoId) {
    const { error } = await supabase
      .from("avisos")
      .update(payload)
      .eq("id", editingAvisoId);

    if (error) {
      throw error;
    }

    showTopMessage("Aviso atualizado com sucesso.", "alert");
    closeModal();
    await carregarAvisos();
    return;
  }

  const { error } = await supabase.from("avisos").insert(payload);

  if (error) {
    throw error;
  }

  showTopMessage("Aviso cadastrado com sucesso.", "alert");
  closeModal();
  await carregarAvisos();
}

async function deletarAviso(id: number): Promise<void> {
  const confirmou = window.confirm("Deseja excluir este aviso?");

  if (!confirmou) {
    return;
  }

  const { error } = await supabase.from("avisos").delete().eq("id", id);

  if (error) {
    showTopMessage("Não foi possível excluir o aviso.", "error");
    return;
  }

  showTopMessage("Aviso excluído com sucesso.", "alert");
  await carregarAvisos();
}

tableBody?.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>("button[data-action]");
  const row = target?.closest<HTMLTableRowElement>("tr[data-id]");

  if (!button || !row) {
    return;
  }

  const avisoId = Number(row.dataset.id);
  const aviso = todosAvisos.find((item) => item.id === avisoId);

  if (!aviso) {
    return;
  }

  const action = button.dataset.action;

  if (action === "edit") {
    openModal(aviso);
  }

  if (action === "delete") {
    void deletarAviso(aviso.id);
  }
});

searchInput?.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

sortButton?.addEventListener("click", () => {
  currentSort = currentSort === "desc" ? "asc" : "desc";
  setSortLabel();
  renderTable();
});

createButton?.addEventListener("click", () => openModal());

exportButton?.addEventListener("click", () => {
  showTopMessage("Exportação ainda não foi configurada.", "alert");
});

prevPageButton?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderTable();
  }
});

nextPageButton?.addEventListener("click", () => {
  const pageCount = getPageCount(getFilteredAvisos().length);

  if (currentPage < pageCount) {
    currentPage += 1;
    renderTable();
  }
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

overlay?.addEventListener("click", (event) => {
  if (event.target === overlay) {
    closeModal();
  }
});

modalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!tituloInput || !descInput || !dataInput) {
    return;
  }

  const titulo = tituloInput.value.trim();
  const desc = descInput.value.trim();
  const data = dataInput.value.trim();

  if (!titulo || !desc || !data) {
    showTopMessage("Preencha todos os campos do aviso.", "error");
    return;
  }

  try {
    await salvarAviso({ titulo, desc, data });
  } catch (error) {
    console.error("Erro ao salvar aviso:", error);
    showTopMessage("Não foi possível salvar o aviso.", "error");
  }
});

setSortLabel();

if (dataInput) {
  dataInput.value = formatDateTimeLocal(new Date());
}

void carregarAvisos();