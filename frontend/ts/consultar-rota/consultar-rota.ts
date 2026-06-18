import { supabase } from "../supabase/supabase.js";
import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "rota");
const tbody = document.querySelector(".transporte-table tbody");
const filtro = document.getElementById("filtroOnibus") as HTMLSelectElement;
const tbodyPassageiros = document.querySelector(".passengers-table tbody");
const badge = document.querySelector(".weekday-badge");
const infoPassageiros = document.querySelector(".passengers-card .small");

let diaAtual: DiaSemana = "segunda";

function preencherFiltroOnibus(dados: any[]) {
  filtro.innerHTML = '<option value="">Todos</option>';

  dados.forEach(item => {
    filtro.innerHTML += `
      <option value="${item.id}">
        ${item.motoristas.onibus.nome}
      </option>
    `;
  });
}

function dataDaSemanaAtual(dia: DiaSemana) {
  const mapa: Record<DiaSemana, number> = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5
  };

  const hoje = new Date();
  const segundaSemana = new Date(hoje);
  const diff = hoje.getDay() === 0 ? -6 : 1 - hoje.getDay();

  segundaSemana.setDate(hoje.getDate() + diff);

  const data = new Date(segundaSemana);

  data.setDate(segundaSemana.getDate() + (mapa[dia] - 1));

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const diaMes = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${diaMes}`;
}

function proximaData(dia: "segunda" | "terca" | "quarta" | "quinta" | "sexta") {
  const mapa: Record<DiaSemana, number> = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
  };

  const hoje = new Date();
  let delta = (mapa[dia] - hoje.getDay() + 7) % 7;

  if (delta === 0) {
    delta = 7;
  }

  const data = new Date();
  data.setDate(data.getDate() + delta);

  return data.toISOString().split("T")[0];
}

function renderizarTabelaTransportes(dados: any[]) {
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  dados.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>
          <strong>
            ${item.motoristas.onibus.nome}
          </strong>
        </td>

        <td>
          ${item.faculdades.nome}
        </td>

        <td>
          ${item.rotasComplementares.nome}
        </td>

        <td>
          ${item.motoristas.nome}
        </td>
      </tr>
    `;
  });
}

type DiaSemana = | "segunda" | "terca" | "quarta" | "quinta" | "sexta";

async function carregarTransportes(dia: DiaSemana) {
  const dataSelecionada = dataDaSemanaAtual(dia);

  const { data: registroData } = await supabase
    .from("Datas")
    .select("id")
    .eq("data_ocorrencia", dataSelecionada);

  if (!registroData?.length) {
    renderizarTabelaTransportes([]);
    preencherFiltroOnibus([]);
    renderizarPassageiros([]);
    return;
  }

  const ids = registroData.map((d: { id: number }) => d.id);

  const { data } = await supabase
    .from("motoristaAssociacao")
    .select(`
      *,
      motoristas(
        nome,
        onibus(
          id,
          nome
        )
      ),
      faculdades(
        nome
      ),
      rotasComplementares(
        nome
      )
    `)
    .in("Data_id", ids);

    console.log("TRANSPORTES", data);

  renderizarTabelaTransportes(data ?? []);
  preencherFiltroOnibus(data ?? []);
  if (!data?.length) {
    renderizarTabelaTransportes([]);
    preencherFiltroOnibus([]);
    renderizarPassageiros([]);
    return;
  }

  if (data?.length) {
    await carregarPassageiros(null, null, dia);
  }
}

function renderizarPassageiros(passageiros: any[]) {

  if (!tbodyPassageiros) {
    return;
  }

  if (infoPassageiros) {
    infoPassageiros.textContent = `${passageiros.length} aluno(s) alocado(s)`;
  }

  tbodyPassageiros.innerHTML = "";

  passageiros.forEach(p => {
    tbodyPassageiros.innerHTML += `
      <tr>
        <td>
          ${p.usuarios.nome}
        </td>

        <td>
          <span class="tag">
            ${p.usuarios.curso}
          </span>
        </td>
      </tr>
    `;
  });
}

async function carregarPassageiros(faculdadeId: number | null, rotaId: number | null, dia: DiaSemana) {
  const dataSelecionada = dataDaSemanaAtual(dia);

  const { data } = await supabase
    .from("Datas")
    .select(`
      *,
      ParticipaFreq(
        *,
        usuarios(
          nome,
          curso
        )
      )
    `)
    .eq("data_ocorrencia", dataSelecionada);

  if (!data || !data.length) {
    renderizarPassageiros([]);
    return;
  }

  const passageiros = data.flatMap((d: any) => d.ParticipaFreq || []);

  const filtrados = passageiros.filter((p: any) => {
    const matchFaculdade = faculdadeId === null || Number(p.ida_destino) === Number(faculdadeId);
    const matchRota = rotaId === null || Number(p.rotaComplementar) === Number(rotaId);
    return matchFaculdade && matchRota;
  });

  renderizarPassageiros(filtrados);
}

filtro.addEventListener("change", async () => {
  const id = Number(filtro.value);

  if (!id) {
    await carregarPassageiros(null, null, diaAtual);
    return;
  }

  const { data } = await supabase
    .from("motoristaAssociacao")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    return;
  }

  carregarPassageiros(data.Faculdade_id, data.RotaComplementar_id, diaAtual);
});

function atualizarBadge(dia: DiaSemana) {
  if (!badge) {
    return;
  }

  const nomes = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira"
  };

  badge.textContent = nomes[dia];
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", async () => {

    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.remove("active");
    });
    btn.classList.add("active");

    const dia = btn.getAttribute("data-dia");
    if (!dia) {
      return;
    }

    diaAtual = dia as DiaSemana;
    atualizarBadge(diaAtual);

    await carregarTransportes(diaAtual);
  });
});

atualizarBadge("segunda");
await carregarTransportes("segunda");