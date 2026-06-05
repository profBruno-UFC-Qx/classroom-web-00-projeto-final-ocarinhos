import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";
import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");

let atualPage = 0;
const pageSize = 5;

function validarMotorista(
  objMotorista: Record<string, string | number>
): boolean {
  for (const valor of Object.values(objMotorista)) {
    if (typeof valor === "string" && valor.trim() === "") {
      return false;
    }

    if (typeof valor === "number" && valor < 0) {
      return false;
    }
  }

  return true;
}

interface motoristasInterface {
  id: number;
  nome: string;
  kmAtual: number;
  onibus: {
    nome: string;
  };
}

interface onibusInterface {
  id: number;
  nome: string;
  kmAtual: number;
}

async function fetchMotoristas() {
  const { data, error } = (await supabase
    .from("motoristas")
    .select("id, nome, onibus (nome), kmAtual")
    .range(atualPage * pageSize, atualPage * pageSize + pageSize - 1)) as {
    data: motoristasInterface[] | null;
    error: any;
  };

  if (error) {
    showTopMessage("Não foi possível fazer o fetch dos motoristas.", "error");
  }

  if (data) {
    inserirMotoristas(data);
  }
}

async function excluirMotorista(id: number) {
  const { data, error } = await supabase
    .from("motoristas")
    .delete()
    .eq("id", id);

  if (error) {
    return error;
  }

  await fetchMotoristas();
  return data;
}

async function editarMotorista(id: number) {
  const { data, error } = await supabase
    .from("motoristas")
    .select()
    .eq("id", id);

  if (error) {
    return error;
  }

  // Trazendo os dados ja cadastrados e inserindo nos inputs. isso aki nao foi feito pelo GPT, =D
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
  }

  form?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const newForm = new FormData(form);
    const objMotorista: Record<string, string | number> = {};

    newForm.forEach((valor, atributo) => {
      if (typeof valor == "string" || typeof valor == "number") {
        objMotorista[atributo] = valor;
      }
    });

    const { error } = await supabase
      .from("motoristas")
      .update(objMotorista)
      .eq("id", id);

    if (error) {
      showTopMessage("Nao foi possivel atualizar o motorista", "error");
      console.log(error);
      return;
    }

    showTopMessage("Motorista atualizado", "alert");
    await fetchMotoristas();
    modal?.setAttribute("hidden", "");
  });
}

const btnCadastro = document.querySelector(".efetuarCadastro");
btnCadastro?.addEventListener("click", cadastrarMotorista);

async function cadastrarMotorista() {
  const modal = document.getElementById("cadastrar");
  console.log(modal);
  modal?.removeAttribute("hidden");

  const closeEdit = document.querySelectorAll("[aria-label='FecharCadastro']");
  closeEdit.forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      modal?.setAttribute("hidden", "");
    });
  });

  const form = modal?.querySelector("form");

  form?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const newForm = new FormData(form);
    const objMotorista: Record<string, string | number> = {};

    newForm.forEach((valor, atributo) => {
      if (typeof valor == "string" || typeof valor == "number") {
        objMotorista[atributo] = valor;
      }
    });


    if (!validarMotorista(objMotorista)) {
      showTopMessage(
        "Algum campo esta com valores negativos ou vazio",
        "error"
      );
      return;
    }

    const { error } = await supabase.from("motoristas").insert(objMotorista);

    if (error) {
      console.log(error);
      showTopMessage("Nao foi possivel efetuar o cadastro", "error");
      return;
    }

    showTopMessage("Cadastro efetuado", "alert");
    await fetchMotoristas();
    modal?.setAttribute("hidden", "");
  });
}

function inserirMotoristas(listaMotoristas: Array<motoristasInterface>) {
  const motoristasTable = document.querySelector(
    ".motoristasTable tbody"
  ) as HTMLTableSectionElement;

  motoristasTable.innerHTML = "";

  listaMotoristas.forEach((motorista) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td class='name'>
    <i class='bi bi-mortarboard' aria-hidden='true'></i>
    ${motorista.nome}
  </td>

  <td>${motorista.onibus.nome}</td>

  <td>
    <span class='qtdKm'>${motorista.kmAtual} KM</span>
  </td>

  <td class='buttons'>
    <button type='button' aria-label='Editar' class='edit' id='${motorista.id}'>
      <i class='bi bi-pencil'></i>
    </button>

    <button type='button' aria-label='Excluir' class='delete' id='${motorista.id}'>
      <i class='bi bi-trash'></i>
    </button>
  </td>`;

    const btnExcluir = tr.querySelector("[aria-label='Excluir']");
    if (btnExcluir instanceof HTMLButtonElement) {
      btnExcluir.addEventListener("click", function () {
        excluirMotorista(Number(this.getAttribute("id")));
      });
    }

    const btnEditar = tr.querySelector("[aria-label='Editar']");
    if (btnEditar instanceof HTMLButtonElement) {
      btnEditar.addEventListener("click", function () {
        editarMotorista(Number(this.getAttribute("id")));
      });
    }

    motoristasTable.appendChild(tr);
  });
}

function preencherQTDMotoristas(totalMotorista: number) {
  const span = document.querySelector(".qtdMotorista");

  if (totalMotorista && span instanceof HTMLSpanElement) {
    span.innerText = String(totalMotorista);
  }
}

async function skipPage(totalMotorista: number, page: number) {
  if (page < 0) {
    page = 0;
  }

  if (page >= Math.floor(totalMotorista / pageSize)) {
    page = Math.floor(totalMotorista / pageSize) - 1;
  }

  atualPage = page;
  await fetchMotoristas();
  await inserirPaginas(totalMotorista);
}

async function inserirPaginas(totalMotorista: number) {
  const listPages = document.querySelector(".pages");

  if (listPages) {
    listPages.innerHTML = "";
  }

  if (listPages instanceof HTMLDivElement) {
    for (let index = 0; index < Math.ceil(totalMotorista / 5); index++) {
      const uniquePage = document.createElement("li");
      uniquePage.innerHTML = `<button id="${index}" class="page ${atualPage == index ? "active" : ""}" aria-current="page">
                          ${index}
                        </button>`;

      const btn = uniquePage.querySelector("button") as HTMLButtonElement;
      btn.addEventListener("click", async function () {
        const id = btn.getAttribute("id");
        if (id) {
          await skipPage(totalMotorista, Number(id));
        }
      });

      listPages.appendChild(uniquePage);
    }
  }
}

async function preencherFooterTable() {
  const { count: totalMotorista, error: errmotorista } = await supabase
    .from("motoristas")
    .select("*", { count: "exact", head: true });

  if (errmotorista) {
    showTopMessage(
      "Não foi possível fazer o fetch da quantidade de motoristas.",
      "error"
    );
  } else {
    preencherQTDMotoristas(totalMotorista);
    await inserirPaginas(totalMotorista);
    actionButtons(totalMotorista);
  }
}

function actionButtons(totalMotorista: number) {
  const prev = document.querySelector(".prev");
  if (prev) {
    prev?.addEventListener("click", function () {
      skipPage(totalMotorista, atualPage - 1);
    });
  }

  const next = document.querySelector(".next");
  if (next) {
    next?.addEventListener("click", function () {
      skipPage(totalMotorista, atualPage + 1);
    });
  }
}

async function preencherFormularioOnibus() {
  const { data, error } = (await supabase
    .from("onibus")
    .select("id, nome")) as { data: Array<onibusInterface>; error: any };

  const selects = document.querySelectorAll("#onibus");
  selects.forEach((select) => {
    data.forEach((onibus) => {
      select.innerHTML += `<option value=${onibus.id}>${onibus.nome}</option>`;
    });
  });
}

await preencherFormularioOnibus();
await fetchMotoristas();
await preencherFooterTable();
