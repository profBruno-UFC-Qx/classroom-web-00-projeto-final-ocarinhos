import { supabase } from "../supabase/supabase.js";
import { renderizarSidebar } from "../components/sidebarADM.js";
renderizarSidebar("sidebar-container", "frequencia");

const dataInput = document.querySelector<HTMLInputElement>("#dataEscala");
const textoData = document.querySelector<HTMLElement>("#dataAtual");
const botaoAnterior = document.querySelector<HTMLButtonElement>(".prev-day");
const botaoProximo = document.querySelector<HTMLButtonElement>(".next-day");
const mesAtual = document.querySelector<HTMLElement>("#mesAtual");

const motoristaSelect = document.querySelector<HTMLSelectElement>("#motorista");
const faculdadeSelect = document.querySelector<HTMLSelectElement>("#faculdade");
const rotaSelect = document.querySelector<HTMLSelectElement>("#rota");
const form = document.querySelector<HTMLFormElement>(".atribuicaoForm");

const modal = document.querySelector<HTMLElement>(".modalOverlay");
const fecharModal = document.querySelector<HTMLButtonElement>(".fecharModal");
const editarId = document.querySelector<HTMLInputElement>("#editarId");
const editarMotorista = document.querySelector<HTMLSelectElement>("#editarMotorista");
const editarFaculdade = document.querySelector<HTMLSelectElement>("#editarFaculdade");
const editarRota = document.querySelector<HTMLSelectElement>("#editarRota");
const formEditar = document.querySelector<HTMLFormElement>(".formEditar");
const botoesEditar = document.querySelectorAll<HTMLButtonElement>(".edit");

let dataSelecionada = new Date();

if (dataInput) {
  dataInput.value = new Date().toISOString().slice(0, 10);
}

async function carregarMotoristas() {
  if (!motoristaSelect) {
    return;
  }

  const { data, error } = await supabase
    .from("motoristas")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((motorista: any) => {
    motoristaSelect.innerHTML += `
      <option value="${motorista.id}">
        ${motorista.nome}
      </option>
    `;
  });
}

async function carregarFaculdades() {
  if (!faculdadeSelect) {
    return;
  }

  const { data, error } = await supabase
    .from("faculdades")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((faculdade: any) => {
    faculdadeSelect.innerHTML += `
      <option value="${faculdade.id}">
        ${faculdade.nome}
      </option>
    `;
  });
}

async function carregarRotas() {
  if (!rotaSelect) {
    return;
  }

  const { data, error } = await supabase
    .from("rotasComplementares")
    .select("id, nome")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((rota: any) => {
    rotaSelect.innerHTML += `
      <option value="${rota.id}">
        ${rota.nome}
      </option>
    `;
  });
}

async function obterIdData(data: string) {
  const { data: existente } = await supabase
    .from("Datas")
    .select("id")
    .eq("data_ocorrencia", data)
    .single();

  if (existente) {
    return existente.id;
  }

  const { data: novaData, error } = await supabase
    .from("Datas")
    .insert({
      data_ocorrencia: data,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return novaData.id;
}

async function renderizarTabela() {
  const tbody = document.querySelector<HTMLTableSectionElement>("#atribuicoesBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  const dataFiltro = dataSelecionada.toISOString().slice(0, 10);

  const { data: dataRegistro } = await supabase
    .from("Datas")
    .select("id")
    .eq("data_ocorrencia", dataFiltro)
    .single();

  if (!dataRegistro) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          Nenhuma atribuição encontrada.
        </td>
      </tr>
    `;

    return;
  }

  const { data: atribuicoes, error } = await supabase
    .from("motoristaAssociacao")
    .select(`
        id,
        Motorista_id,
        Faculdade_id,
        RotaComplementar_id,
        motoristas(nome),
        faculdades(nome),
        rotasComplementares(nome)
    `)
    .eq("Data_id", dataRegistro.id);

  if (error) {
    console.error(error);
    return;
  }

  if (!atribuicoes || atribuicoes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          Nenhuma atribuição encontrada.
        </td>
      </tr>
    `;

    return;
  }

  atribuicoes.forEach((atribuicao: any) => {
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="motoristaCell">
            <strong>${atribuicao.motoristas?.nome ?? "-"}</strong>
          </div>
        </td>

        <td>${atribuicao.faculdades?.nome ?? "-"}</td>

        <td>${atribuicao.rotasComplementares?.nome ?? "-"}</td>

        <td class="actionsCell">
          <button
            class="iconButton edit"
            data-id="${atribuicao.id}"
            data-motorista="${atribuicao.Motorista_id}"
            data-faculdade="${atribuicao.Faculdade_id}"
            data-rota="${atribuicao.RotaComplementar_id ?? ""}"
           >
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

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!dataInput || !motoristaSelect || !faculdadeSelect) {
    return;
    }

    const data = dataInput.value;
    const dataId = await obterIdData(data);

    if (!dataId) {
    console.log("Erro ao obter a data.");
    return;
    }

    const { error } = await supabase
    .from("motoristaAssociacao")
    .insert({
        Data_id: dataId,
        Faculdade_id: Number(faculdadeSelect.value),
        Motorista_id: Number(motoristaSelect.value),
        RotaComplementar_id: rotaSelect?.value
        ? Number(rotaSelect.value)
        : null,
    });

    if (error) {
        console.error(error);
        console.log("Erro ao salvar atribuição.");
        return;
    }

    form.reset();
    dataSelecionada = new Date();
    dataInput.value = dataSelecionada.toISOString().slice(0, 10);

    atualizarDataTela();
    await renderizarTabela();
});

formEditar?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { error } = await supabase
        .from("motoristaAssociacao")
        .update({
            Motorista_id: Number(
                editarMotorista?.value
            ),

            Faculdade_id: Number(
                editarFaculdade?.value
            ),

            RotaComplementar_id:
                editarRota?.value
                    ? Number(editarRota.value)
                    : null,
        })
        .eq(
            "id",
            Number(editarId?.value)
        );

    if (error) {
        console.error(error);
        return;
    }

    modal?.setAttribute("hidden", "");
    await renderizarTabela();
});

fecharModal?.addEventListener("click", () => {
    modal?.setAttribute("hidden", "");
});

botaoAnterior?.addEventListener("click", async () => {
  dataSelecionada.setDate(dataSelecionada.getDate() - 1);

  atualizarDataTela();
  await renderizarTabela();
});

botaoProximo?.addEventListener("click", async () => {
  dataSelecionada.setDate(dataSelecionada.getDate() + 1);

  atualizarDataTela();
  await renderizarTabela();
});

await carregarMotoristas();
await carregarFaculdades();
await carregarRotas();

if (editarMotorista && editarFaculdade && editarRota && motoristaSelect && faculdadeSelect &&rotaSelect) {
    editarMotorista.innerHTML = motoristaSelect.innerHTML;
    editarFaculdade.innerHTML = faculdadeSelect.innerHTML;
    editarRota.innerHTML = rotaSelect.innerHTML;
}

atualizarDataTela();
await renderizarTabela();