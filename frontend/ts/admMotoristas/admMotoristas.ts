import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";
import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");

interface motoristasInterface {
  nome: string;
  kmAtual: number;
  onibus: {
    nome: string;
  };
}

async function fetchMotoristas() {
  const { data, error } = (await supabase
    .from("motoristas")
    .select("nome, onibus (nome), kmAtual")) as {
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

  listaMotoristas.forEach((motorista) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td class='name'>
    <i class='bi bi-mortarboard' aria-hidden='true'></i>
    ${motorista.nome}
  </td>

  <td>${motorista.onibus.nome}</td>

  <td>
    <span class='qtdAlunos'>${motorista.kmAtual} KM</span>
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

fetchMotoristas();
