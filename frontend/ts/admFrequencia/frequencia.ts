import { renderizarSidebar } from "../components/sidebarADM.js";
renderizarSidebar("sidebar-container", "frequencia");

const dataInput = document.querySelector<HTMLInputElement>("#dataEscala");
const textoData = document.querySelector<HTMLElement>("#dataAtual");
const botaoAnterior = document.querySelector<HTMLButtonElement>(".prev-day");
const botaoProximo = document.querySelector<HTMLButtonElement>(".next-day");
const mesAtual = document.querySelector<HTMLElement>("#mesAtual");
let dataSelecionada = new Date();

if (dataInput) {
  dataInput.value = new Date().toISOString().slice(0, 10);
}

interface Atribuicao {
  id: number;
  data: string;
  motorista: string;
  instituicao: string;
  rota: string;
}

const atribuicoes: Atribuicao[] = [
  {
    id: 1,
    data: new Date().toISOString().slice(0, 10),
    motorista: "João Silva",
    instituicao: "UFC - Campus Quixadá",
    rota: "Rota Norte",
  },
  {
    id: 2,
    data: new Date().toISOString().slice(0, 10),
    motorista: "Maria Oliveira",
    instituicao: "IFCE - Quixadá",
    rota: "Rota Sul",
  },
  {
    id: 3,
    data: "2026-06-20",
    motorista: "Carlos Santos",
    instituicao: "UFC - Campus Quixadá",
    rota: "Rota Central",
  },
];

function renderizarTabela() {
  const tbody = document.querySelector<HTMLTableSectionElement>("#atribuicoesBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  const dataFiltro = dataSelecionada.toISOString().slice(0, 10);

  const atribuicoesDoDia = atribuicoes.filter((atribuicao) => atribuicao.data === dataFiltro);

  if (atribuicoesDoDia.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          Nenhuma atribuição encontrada.
        </td>
      </tr>
    `;

    return;
  }

  atribuicoesDoDia.forEach((atribuicao) => {
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="motoristaCell">
            <strong>${atribuicao.motorista}</strong>
          </div>
        </td>

        <td>${atribuicao.instituicao}</td>

        <td>${atribuicao.rota}</td>

        <td class="actionsCell">
          <button class="iconButton edit">
            <i class="bi bi-pencil"></i>
          </button>

          <button class="iconButton delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

function atualizarDataTela() {
  if (textoData) {
    textoData.textContent = dataSelecionada.toLocaleDateString("pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (mesAtual) {
    mesAtual.textContent = dataSelecionada.toLocaleDateString("pt-BR",
      {
        month: "long",
        year: "numeric",
      }
    );
  }
}

botaoAnterior?.addEventListener("click", () => {
  dataSelecionada.setDate(dataSelecionada.getDate() - 1);

  atualizarDataTela();
  renderizarTabela();
});

botaoProximo?.addEventListener("click", () => {
  dataSelecionada.setDate(dataSelecionada.getDate() + 1);

  atualizarDataTela();
  renderizarTabela();
});

atualizarDataTela();
renderizarTabela();