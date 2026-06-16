import { renderizarSidebar } from "../components/sidebarADM.js";
renderizarSidebar("sidebar-container", "frequencia");

const dataInput = document.querySelector<HTMLInputElement>("#dataEscala");
const textoData = document.querySelector<HTMLElement>("#dataAtual");
const botaoAnterior = document.querySelector<HTMLButtonElement>(".prev-day");
const botaoProximo = document.querySelector<HTMLButtonElement>(".next-day");
let dataSelecionada = new Date();

if (dataInput) {
  dataInput.value = new Date().toISOString().slice(0, 10);
}

function atualizarDataTela() {
  if (textoData) {
    textoData.textContent =
      dataSelecionada.toLocaleDateString("pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
  }
}

botaoAnterior?.addEventListener("click", () => {
  dataSelecionada.setDate(dataSelecionada.getDate() - 1);

  atualizarDataTela();
  // renderizarTabela();
});

botaoProximo?.addEventListener("click", () => {
  dataSelecionada.setDate(dataSelecionada.getDate() + 1);

  atualizarDataTela();
  // renderizarTabela();
});

atualizarDataTela();