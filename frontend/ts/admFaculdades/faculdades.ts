import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";
import { renderizarSidebar } from "../components/sidebarADM.js";

renderizarSidebar("sidebar-container", "faculdades");

let atualPage = 0;
const pageSize = 5;

function validarFaculdade(
  objFaculdade: Record<string, string | number>
): boolean {
  for (const valor of Object.values(objFaculdade)) {
    if (typeof valor === "string" && valor.trim() === "") {
      return false;
    }

    if (typeof valor === "number" && valor < 0) {
      return false;
    }
  }

  return true;
}

interface faculdadesInterface {
  id: number;
  nome: string;
  bairro: string;
  qtdAlunos?: number;
}

const textoBusca = document.getElementById("textoBusca") as HTMLFormElement | null;
if (textoBusca) {
  async function query(e: SubmitEvent) {
    e.preventDefault();
    const input = textoBusca?.querySelector("input");

    if (input && input.value.trim() !== "") {
      const { data, error } = await supabase
        .from("faculdades")
        .select("id, nome, bairro")
        .or(`nome.ilike.%${input.value}%,bairro.ilike.%${input.value}%`)
        .range(atualPage * pageSize, atualPage * pageSize + pageSize - 1);

      if (error) {
        showTopMessage(
          "Não foi possível realizar essa pesquisa por texto",
          "error"
        );
        return;
      }

      inserirFaculdades(data);
    } else {
      atualPage = 0;
      await fetchFaculdades();
      await preencherFooterTable();
    }
  }

  textoBusca.addEventListener("submit", query);
}

async function fetchFaculdades() {
  const { data, error } = (await supabase
    .from("faculdades")
    .select("id, nome, bairro")
    .order('id', { ascending: false })
    .range(atualPage * pageSize, atualPage * pageSize + pageSize - 1)) as {
    data: faculdadesInterface[] | null;
    error: any;
  };

  if (error) {
    showTopMessage("Não foi possível fazer o fetch das faculdades.", "error");
  }

  if (data) {
    const faculdades = await Promise.all(
      data.map(async (faculdade) => {
        const { count } = await supabase
          .from("usuarios")
          .select("*", { count: "exact", head: true })
          .eq("ies", faculdade.id);

        return {
          ...faculdade,
          qtdAlunos: count ?? 0,
        };
      })
    );

    inserirFaculdades(faculdades);
  }
}

async function excluirFaculdade(id: number) {
  const { data, error } = await supabase
    .from("faculdades")
    .delete()
    .eq("id", id);

  if (error) {
    showTopMessage("Erro ao excluir faculdade", "error");
    return error;
  }

  await fetchFaculdades();
  await preencherFooterTable();
  return data;
}

async function editarFaculdade(id: number) {
  const { data, error } = await supabase
    .from("faculdades")
    .select()
    .eq("id", id);

  if (error) {
    return error;
  }

  const modal = document.getElementById("editar");
  modal?.removeAttribute("hidden");

  const closeEdit = document.querySelectorAll("[aria-label='FecharEdit']");
  closeEdit.forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      modal?.setAttribute("hidden", "");
    });
  });

  const form = modal?.querySelector("form");
  if (form instanceof HTMLFormElement) {
    const formData = new FormData(form);

    formData.entries().forEach((el) => {
      const input = form.elements.namedItem(el[0]);

      if (
        input instanceof HTMLInputElement ||
        input instanceof HTMLSelectElement
      ) {
        input.value = data[0][el[0]];
      }
    });

    // Clona o formulário para remover event listeners antigos e evitar múltiplos envios
    const newFormClone = form.cloneNode(true) as HTMLFormElement;
    form.parentNode?.replaceChild(newFormClone, form);

    newFormClone.addEventListener("submit", async function (e) {
      e.preventDefault();
      const newForm = new FormData(newFormClone);
      const objFaculdade: Record<string, string | number> = {};

      newForm.forEach((valor, atributo) => {
        if (typeof valor == "string" || typeof valor == "number") {
          objFaculdade[atributo] = valor;
        }
      });

      const { error } = await supabase
        .from("faculdades")
        .update(objFaculdade)
        .eq("id", id);

      if (error) {
        showTopMessage("Nao foi possivel atualizar a faculdade", "error");
        return;
      }

      showTopMessage("Faculdade atualizada", "alert");
      await fetchFaculdades();
      modal?.setAttribute("hidden", "");
    });
  }
}

const btnCadastroGeral = document.querySelectorAll(".efetuarCadastro");
btnCadastroGeral.forEach((btn) => {
  btn.addEventListener("click", cadastrarFaculdade);
});

async function cadastrarFaculdade() {
  const modal = document.getElementById("cadastrar");
  modal?.removeAttribute("hidden");

  const closeEdit = document.querySelectorAll("[aria-label='FecharCadastro']");
  closeEdit.forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      modal?.setAttribute("hidden", "");
    });
  });

  const form = modal?.querySelector("form");

  if (form instanceof HTMLFormElement) {
    // Clona o formulário para remover event listeners antigos e evitar múltiplos envios
    const newFormClone = form.cloneNode(true) as HTMLFormElement;
    form.parentNode?.replaceChild(newFormClone, form);

    newFormClone.addEventListener("submit", async function (e) {
      e.preventDefault();
      const newForm = new FormData(newFormClone);
      const objFaculdade: Record<string, string | number> = {};

      newForm.forEach((valor, atributo) => {
        if (typeof valor == "string" || typeof valor == "number") {
          objFaculdade[atributo] = valor;
        }
      });

      // Se a quantidade de alunos vier vazia do HTML, define como 0
      if (!objFaculdade.hasOwnProperty('qtdAlunos') || objFaculdade['qtdAlunos'] === "") {
        objFaculdade['qtdAlunos'] = 0;
      }

      if (!validarFaculdade(objFaculdade)) {
        showTopMessage(
          "Algum campo esta com valores negativos ou vazio",
          "error"
        );
        return;
      }

      const { error } = await supabase.from("faculdades").insert(objFaculdade);

      if (error) {
        showTopMessage("Nao foi possivel efetuar o cadastro", "error");
        return;
      }

      showTopMessage("Cadastro efetuado", "alert");
      newFormClone.reset();
      await fetchFaculdades();
      await preencherFooterTable();
      modal?.setAttribute("hidden", "");
    });
  }
}

function inserirFaculdades(listaFaculdades: Array<faculdadesInterface>) {
  const table = document.querySelector(".faculdadesTable") as HTMLTableElement;
  if (!table) return;

  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    const thead = table.querySelector(".thead") || table.rows[0];
    if (thead && thead.parentNode) {
      thead.parentNode.insertBefore(tbody, thead.nextSibling);
    } else {
      table.appendChild(tbody);
    }
  }

  // Remove as linhas antigas antes de renderizar as novas (ignorando thead e tfoot)
  Array.from(table.rows).forEach((row) => {
    if (!row.classList.contains("thead") && !row.closest("tfoot") && row.parentNode === table) {
      row.remove();
    }
  });

  tbody.innerHTML = "";

  listaFaculdades.forEach((faculdade) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td class='name'>
    <i class='bi bi-mortarboard' aria-hidden='true'></i>
    ${faculdade.nome}
  </td>

  <td>${faculdade.bairro}</td>

  <td>
    <span class='qtdAlunos'>${faculdade.qtdAlunos} alunos</span>
  </td>

  <td class='buttons'>
    <button type='button' aria-label='Editar' class='edit' id='${faculdade.id}'>
      <i class='bi bi-pencil'></i>
    </button>

    <button type='button' aria-label='Excluir' class='delete' id='${faculdade.id}'>
      <i class='bi bi-trash'></i>
    </button>
  </td>`;

    const btnExcluir = tr.querySelector("[aria-label='Excluir']");
    if (btnExcluir instanceof HTMLButtonElement) {
      btnExcluir.addEventListener("click", function () {
        excluirFaculdade(Number(this.getAttribute("id")));
      });
    }

    const btnEditar = tr.querySelector("[aria-label='Editar']");
    if (btnEditar instanceof HTMLButtonElement) {
      btnEditar.addEventListener("click", function () {
        editarFaculdade(Number(this.getAttribute("id")));
      });
    }

    tbody.appendChild(tr);
  });
}

function preencherQTDFaculdades(totalFaculdade: number) {
  const tfootInfo = document.querySelector(".tfoot-info");

  if (tfootInfo && totalFaculdade !== null) {
    const start = totalFaculdade === 0 ? 0 : (atualPage * pageSize) + 1;
    const end = Math.min((atualPage + 1) * pageSize, totalFaculdade);
    tfootInfo.innerHTML = `Mostrando ${start}-${end} de ${totalFaculdade} faculdades`;
  }
}

async function skipPage(totalFaculdade: number, page: number) {
  if (page < 0) {
    page = 0;
  }

  if (page >= Math.ceil(totalFaculdade / pageSize)) {
    page = Math.ceil(totalFaculdade / pageSize) - 1;
  }

  if (page < 0) page = 0;

  atualPage = page;

  await fetchFaculdades();
  await inserirPaginas(totalFaculdade);
  preencherQTDFaculdades(totalFaculdade);
}

async function inserirPaginas(totalFaculdade: number) {
  const navList = document.querySelector(".faculdadesFooter-pagination ul");
  if (!navList) return;

  const lis = navList.querySelectorAll("li:not(.prev):not(.next)");
  lis.forEach((li) => li.remove());

  const nextBtn = navList.querySelector(".next");

  for (let index = 0; index < Math.ceil(totalFaculdade / pageSize); index++) {
    const li = document.createElement("li");
    li.innerHTML = `<button id="page-${index}" class="page ${
      atualPage == index ? "active" : ""
    }" aria-current="page">${index + 1}</button>`;

    const btn = li.querySelector("button") as HTMLButtonElement;
    btn.addEventListener("click", async function () {
      await skipPage(totalFaculdade, index);
    });

    if (nextBtn) {
      navList.insertBefore(li, nextBtn);
    } else {
      navList.appendChild(li);
    }
  }
}

async function preencherFooterTable() {
  const { count: totalFaculdade, error: errfaculdade } = await supabase
    .from("faculdades")
    .select("*", { count: "exact", head: true });

  if (errfaculdade) {
    showTopMessage(
      "Não foi possível fazer o fetch da quantidade de faculdades.",
      "error"
    );
  } else if (totalFaculdade !== null) {
    preencherQTDFaculdades(totalFaculdade);
    await inserirPaginas(totalFaculdade);
    actionButtons(totalFaculdade);
  }
}

function actionButtons(totalFaculdade: number) {
  const prev = document.querySelector(".prev button");
  const next = document.querySelector(".next button");

  const newPrev = prev?.cloneNode(true);
  const newNext = next?.cloneNode(true);

  if (prev && newPrev) prev.parentNode?.replaceChild(newPrev, prev);
  if (next && newNext) next.parentNode?.replaceChild(newNext, next);

  newPrev?.addEventListener("click", function () {
    skipPage(totalFaculdade, atualPage - 1);
  });

  newNext?.addEventListener("click", function () {
    skipPage(totalFaculdade, atualPage + 1);
  });
}

await fetchFaculdades();
await preencherFooterTable();