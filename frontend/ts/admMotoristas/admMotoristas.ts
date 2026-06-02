import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";
import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");

const page = 0;
const pageSize = 5;

interface motoristasInterface {
  nome: string;
  kmAtual: number;
  onibus: {
    nome: string;
  };
}

async function fetchMotoristas(page: number = 0) {
  const { data, error } = (await supabase
    .from("motoristas")
    .select("nome, onibus (nome), kmAtual")
    .range(page * pageSize, page * pageSize + pageSize - 1)) as {
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

// O CARA TA COLOCANDO DENTRO DE UM TBODY QUE NAO EXISTE **___**
function inserirMotoristas(listaMotoristas: Array<motoristasInterface>) {
  const motoristasTable = document.querySelector(
    ".motoristasTable tbody"
  ) as HTMLTableSectionElement;

  console.log(motoristasTable);

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
  const { count: totalOnibus, error: errOnibus } = await supabase
    .from("motoristas")
    .select("*", { count: "exact", head: true });

  const span = document.querySelector(".qtdMotorista");

  if (totalOnibus && span instanceof HTMLSpanElement) {
    span.innerText = String(totalOnibus);
  } else {
    console.log("erro");
  }

  const listPages = document.querySelector(".pages");

  if (listPages instanceof HTMLDivElement) {
    for (let index = 0; index < totalOnibus / 5; index++) {
      const uniquePage = document.createElement("li");
      uniquePage.innerHTML = `<button id="${index}" class="page ${page == index ? "active" : ""}" aria-current="page">
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

async function skipPage(page: number) {
  fetchMotoristas(page);
}

await fetchMotoristas();
await preencherFooterTable();
