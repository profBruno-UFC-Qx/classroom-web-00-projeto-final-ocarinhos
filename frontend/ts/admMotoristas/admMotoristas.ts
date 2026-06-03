import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";
import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");

let atualPage = 0;
const pageSize = 5;

interface motoristasInterface {
  nome: string;
  kmAtual: number;
  onibus: {
    nome: string;
  };
}

const { count: totalMotorista, error: errmotorista } = await supabase
  .from("motoristas")
  .select("*", { count: "exact", head: true });

async function fetchMotoristas() {
  const { data, error } = (await supabase
    .from("motoristas")
    .select("nome, onibus (nome), kmAtual")
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
    <button type='button' aria-label='Editar' class='edit'>
      <i class='bi bi-pencil'></i>
    </button>

    <button type='button' aria-label='Excluir' class='delete'>
      <i class='bi bi-trash'></i>
    </button>
  </td>
`;

    motoristasTable.appendChild(tr);
  });
}

async function preencherFooterTable() {
  const span = document.querySelector(".qtdMotorista");

  if (totalMotorista && span instanceof HTMLSpanElement) {
    span.innerText = String(totalMotorista);
  } else {
    console.log("erro");
  }

  inserirPaginas();
}

async function skipPage(page: number) {
  if (page < 0) {
    page = 0;
  }

  if (page > Math.floor(totalMotorista / 5)) {
    page = Math.floor(totalMotorista / 5);
  }

  atualPage = page;
  fetchMotoristas();
  inserirPaginas();
}

async function inserirPaginas() {
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
          await skipPage(Number(id));
        }
      });

      listPages.appendChild(uniquePage);
    }
  }
}

function actionButtons() {
  const prev = document.querySelector(".prev");
  if (prev) {
    prev?.addEventListener("click", function () {
      skipPage(atualPage - 1);
    });
  }

  const next = document.querySelector(".next");
  if (next) {
    next?.addEventListener("click", function () {
      skipPage(atualPage + 1);
    });
  }
}

await fetchMotoristas();

if (errmotorista) {
  showTopMessage(
    "Não foi possível fazer o fetch da quantidade de motoristas.",
    "error"
  );
} else {
  await preencherFooterTable();
  actionButtons();
}
