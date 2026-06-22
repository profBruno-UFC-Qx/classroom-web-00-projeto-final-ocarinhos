import { renderizarSidebar } from "../components/sidebarADM.js";
renderizarSidebar("sidebar-container", "rotas");

import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";

let atualPage = 0;
const pageSize = 5;

function validarRota(
  objRota: Record<string, string | number>
): boolean {
  for (const valor of Object.values(objRota)) {
    if (typeof valor === "string" && valor.trim() === "") {
      return false;
    }

    if (typeof valor === "number" && valor < 0) {
      return false;
    }
  }

  return true;
}

interface rotasInterface {
  id: number;
  nome: string;
  km: number;
  bairro: string;
}

const input = document.getElementById("textoBusca") as HTMLInputElement;
input.addEventListener("input", function (e) {
  e.preventDefault();

  atualPage = 0;
  fetchRotas();
});

async function fetchRotas() {
  const { data, error } = (await supabase
    .from("rotasComplementares")
    .select("id, nome, bairro, km")
    .ilike("nome", `%${input.value}%`)
    .range(atualPage * pageSize, atualPage * pageSize + pageSize - 1)) as {
    data: rotasInterface[] | null;
    error: any;
  };

  const { count: totalRotas, error: errRota } = await supabase
    .from("rotasComplementares")
    .select("*", { count: "exact", head: true })
    .ilike("nome", `%${input.value}%`);

  if (error) {
    showTopMessage("Não foi possível fazer o fetch das rotas.", "error");
  }

  if (data) {
    inserirRotas(data);
    await preencherFooterTable(totalRotas, error);
  }
}

async function excluirRota(id: number) {
  const { data, error } = await supabase
    .from("rotasComplementares")
    .delete()
    .eq("id", id);

  if (error) {
    return error;
  }

  await fetchRotas();
  return data;
}

async function editarRota(id: number) {
  const { data, error } = await supabase
    .from("rotasComplementares")
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

    form.onsubmit = async function (e) {
      e.preventDefault();
      const newForm = new FormData(form);
      const objRota: Record<string, string | number> = {};

      newForm.forEach((valor, atributo) => {
        if (typeof valor == "string" || typeof valor == "number") {
          if (atributo === "km") {
            objRota[atributo] = Number(valor);
          } else {
            objRota[atributo] = valor;
          }
        }
      });

      if (!validarRota(objRota)) {
        showTopMessage(
          "Algum campo está com valores negativos ou vazio",
          "error"
        );
        return;
      }

      const { error } = await supabase
        .from("rotasComplementares")
        .update(objRota)
        .eq("id", id);

      if (error) {
        showTopMessage("Não foi possível atualizar a rota", "error");
        return;
      }

      showTopMessage("Rota atualizada com sucesso", "alert");
      await fetchRotas();
      modal?.setAttribute("hidden", "");
    };
  }
}

const btnCadastro = document.querySelector(".efetuarCadastro");
btnCadastro?.addEventListener("click", cadastrarRota);

async function cadastrarRota() {
  const modal = document.getElementById("cadastrar");
  modal?.removeAttribute("hidden");

  const closeEdit = document.querySelectorAll("[aria-label='FecharCadastro']");
  closeEdit.forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      modal?.setAttribute("hidden", "");
    });
  });

  const form = modal?.querySelector("form");

  if (form) {
    form.onsubmit = async function (e) {
      e.preventDefault();
      const newForm = new FormData(form);
      const objRota: Record<string, string | number> = {};

      newForm.forEach((valor, atributo) => {
        if (typeof valor == "string" || typeof valor == "number") {
          if (atributo === "km") {
            objRota[atributo] = Number(valor);
          } else {
            objRota[atributo] = valor;
          }
        }
      });

      if (!validarRota(objRota)) {
        showTopMessage(
          "Algum campo está com valores negativos ou vazio",
          "error"
        );
        return;
      }

      const { error } = await supabase.from("rotasComplementares").insert(objRota);

      if (error) {
        showTopMessage("Não foi possível efetuar o cadastro", "error");
        return;
      }

      showTopMessage("Cadastro efetuado com sucesso", "alert");
      await fetchRotas();
      modal?.setAttribute("hidden", "");
    };
  }
}

function inserirRotas(listaRotas: Array<rotasInterface>) {
  const rotasTable = document.querySelector(
    ".motoristasTable tbody"
  ) as HTMLTableSectionElement;

    rotasTable.innerHTML = "";

  listaRotas.forEach((rota) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td class='name'>
    <i class="bi bi-bus-front" aria-hidden="true"></i>
    ${rota.nome}
  </td>

  <td>${rota.bairro}</td>

  <td>
    <span class='qtdKm'>${rota.km} KM</span>
  </td>

  <td class='buttons'>
    <button type='button' aria-label='Editar' class='edit' id='${rota.id}'>
      <i class='bi bi-pencil'></i>
    </button>

    <button type='button' aria-label='Excluir' class='delete' id='${rota.id}'>
      <i class='bi bi-trash'></i>
    </button>
  </td>`;

    const btnExcluir = tr.querySelector("[aria-label='Excluir']");
    if (btnExcluir instanceof HTMLButtonElement) {
      btnExcluir.addEventListener("click", function () {
        excluirRota(Number(this.getAttribute("id")));
      });
    }

    const btnEditar = tr.querySelector("[aria-label='Editar']");
    if (btnEditar instanceof HTMLButtonElement) {
      btnEditar.addEventListener("click", function () {
        editarRota(Number(this.getAttribute("id")));
      });
    }

    rotasTable.appendChild(tr);
  });
}

function preencherQTDRotas(totalRotas: number) {
  const span = document.querySelector(".qtdMotorista");

  if (totalRotas && span instanceof HTMLSpanElement) {
    span.innerText = String(totalRotas);
  }
}

async function skipPage(totalRotas: number, page: number) {
  if (page < 0) {
    page = 0;
  }

  if (page >= Math.floor(totalRotas / pageSize)) {
    page = Math.floor(totalRotas / pageSize);
  }

  atualPage = page;

  await fetchRotas();
}

async function inserirPaginas(totalRotas: number) {
  const listPages = document.querySelector(".pages");

  if (listPages) {
    listPages.innerHTML = "";
  }

  if (listPages instanceof HTMLDivElement) {
    for (let index = 0; index < Math.ceil(totalRotas / 5); index++) {
      const uniquePage = document.createElement("li");
      uniquePage.innerHTML = `<button id="${index}" class="page ${atualPage == index ? "active" : ""}" aria-current="page">
                          ${index}
                        </button>`;

      const btn = uniquePage.querySelector("button") as HTMLButtonElement;
      btn.addEventListener("click", async function () {
        const id = btn.getAttribute("id");
        if (id) {
          await skipPage(totalRotas, Number(id));
        }
      });

      listPages.appendChild(uniquePage);
    }
  }
}

async function preencherFooterTable(totalRotas: number, err?: any) {
  if (err) {
    showTopMessage(
      "Nao foi possivel obter a quantidade de motoristas",
      "error"
    );
    return;
  }

  preencherQTDRotas(totalRotas);
  await inserirPaginas(totalRotas);
  actionButtons(totalRotas);
}

function actionButtons(totalMotorista: number) {
  const prev = document.querySelector(".prev") as HTMLButtonElement;
  if (prev) {
    prev.onclick = async function () {
      await skipPage(totalMotorista, atualPage - 1);
    };
  }

  const next = document.querySelector(".next") as HTMLButtonElement;
  if (next) {
    next.onclick = async function () {
      await skipPage(totalMotorista, atualPage + 1);
    };
  }
}

async function preencherFormularioOnibus() {
  const { data, error } = (await supabase
    .from("rotasComplementares")
    .select("id, nome")) as { data: Array<rotasInterface>; error: any };

  const selects = document.querySelectorAll("#onibus");
  selects.forEach((select) => {
    data.forEach((rota) => {
      select.innerHTML += `<option value=${rota.id}>${rota.nome}</option>`;
    });
  });
}

await preencherFormularioOnibus();
await fetchRotas();
