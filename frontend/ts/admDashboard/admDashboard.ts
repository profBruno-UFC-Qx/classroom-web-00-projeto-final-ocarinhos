declare const Chart: any;

const graficoFaculdadesCanvas = document.getElementById("graficoFaculdades") as HTMLCanvasElement;
let paginaAtualFaculdade = 0;
let graficoFaculdades: any = null;
const btnAnteriorFaculdade = document.getElementById("btnAnteriorFaculdade") as HTMLButtonElement;
const btnProximaFaculdade = document.getElementById("btnProximaFaculdade") as HTMLButtonElement;

import { supabase } from "../supabase/supabase.js";
import { renderizarSidebar } from "../components/sidebarADM.js";
import showTopMessage from "../utils/showMsg.js";

renderizarSidebar("sidebar-container", "dashboard");

interface Aviso {
  id: number;
  titulo: string;
  desc: string;
  data: string;
}

const chart_div = document.getElementById("dashboard") as HTMLCanvasElement;

async function obterFrequenciaSemana() {
  const hoje = new Date();

  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));

  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);

  const { data, error } = await supabase
    .from("Datas")
    .select("data_ocorrencia")
    .gte(
      "data_ocorrencia",
      segunda.toISOString().split("T")[0]
    )
    .lte(
      "data_ocorrencia",
      domingo.toISOString().split("T")[0]
    );

  if (error) {
    console.error(error);
    return Array(7).fill(0);
  }

  const contagem = Array(7).fill(0);

  data?.forEach((registro: { data_ocorrencia: string }) => {
      const dataRegistro = new Date(registro.data_ocorrencia + "T00:00:00");
      const indice = (dataRegistro.getDay() + 6) % 7;
      contagem[indice]++;
  });
  return contagem;
}

async function carregarGrafico() {
  const labels = [
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
    "Dom",
  ];

  const data_sample = await obterFrequenciaSemana();

  new Chart(chart_div, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Frequência",
          data: data_sample,
          backgroundColor: "#1976d2",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

async function fetchEstatisticas() {
  const { count: totalMotoristas } =
    await supabase
      .from("motoristas")
      .select("*", {
        count: "exact",
        head: true,
      });

  inserirTotalMotoristas(totalMotoristas ?? 0);

  const { count: totalAlunos } =
    await supabase
      .from("usuarios")
      .select("*", {
        count: "exact",
        head: true,
      });

  inserirTotalAlunos(totalAlunos ?? 0);

  const { count: totalOnibus } =
    await supabase
      .from("onibus")
      .select("*", {
        count: "exact",
        head: true,
      });

  inserirTotalOnibus(totalOnibus ?? 0);

  const { count: totalRotas } =
    await supabase
      .from("rotasComplementares")
      .select("*", {
        count: "exact",
        head: true,
      });

  inserirTotalRotas(totalRotas ?? 0);
}

function inserirTotalMotoristas(totalMotoristas: number) {
  const cell = document.querySelector(".qtd-motoristas") as HTMLParagraphElement;

  if (cell) {
    cell.innerText = String(totalMotoristas);
  }
}

function inserirTotalAlunos(totalAlunos: number) {
  const cell = document.querySelector(".qtd-alunos") as HTMLParagraphElement;

  if (cell) {
    cell.innerText = String(totalAlunos);
  }
}

function inserirTotalOnibus(totalOnibus: number) {
  const cell = document.querySelector(".qtd-onibus") as HTMLParagraphElement;

  if (cell) {
    cell.innerText = String(totalOnibus);
  }
}

function inserirTotalRotas(totalRotas: number) {
  const cell = document.querySelector(".qtd-rotas") as HTMLParagraphElement;

  if (cell) {
    cell.innerText = String(totalRotas);
  }
}

async function fetchAvisos(): Promise<Aviso[]> {
  const { data, error } =
    await supabase
      .from("avisos")
      .select(
        "id, titulo, desc, data"
      )
      .order("data", {
        ascending: false,
      })
      .range(0, 2);

  if (error) {
    throw error;
  }

  return data;
}

async function inserirAvisos() {
  const avisosGroup = document.querySelector(".avisos-group") as HTMLDivElement;

  if (!avisosGroup) {
    return;
  }

  try {
    const avisos = await fetchAvisos();

    avisosGroup.innerHTML = "";

    avisos.forEach((aviso) => {
      avisosGroup.innerHTML += `
        <div class="dash-aviso-item dash-aviso-info">
          <div class="dash-aviso-titulo">
            ${aviso.titulo}
          </div>

          <div class="dash-aviso-desc">
            ${aviso.desc}
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error(error);

    showTopMessage("Não foi possível carregar os avisos.", "error");
  }
}

async function obterFaculdadesComQuantidade() {
  const { data: faculdades, error } = await supabase
    .from("faculdades")
    .select("id, nome");

  if (error) {
    console.error(error);
    return [];
  }

  const resultado = [];

  for (const faculdade of faculdades) {
    const { count } = await supabase
      .from("usuarios")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("ies", faculdade.id);

    resultado.push({
      nome: faculdade.nome,
      quantidade: count ?? 0,
    });
  }

  return resultado;
}

async function carregarGraficoFaculdades() {
  const dados = await obterFaculdadesComQuantidade();
  const inicio = paginaAtualFaculdade * 5;
  const fim = inicio + 5;
  const pagina = dados.slice(inicio, fim);
  const labels = pagina.map((faculdade) => faculdade.nome);
  const valores = pagina.map((faculdade) => faculdade.quantidade);

  if (graficoFaculdades) {
    graficoFaculdades.destroy();
  }

  graficoFaculdades = new Chart(graficoFaculdadesCanvas,
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Alunos",
            data: valores,
            backgroundColor: "#1976d2",
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    }
  );

  return dados.length;
}

let totalFaculdades = 0;

btnAnteriorFaculdade?.addEventListener("click", async () => {
  if (paginaAtualFaculdade > 0) {
    paginaAtualFaculdade--;
    await carregarGraficoFaculdades();
  }
});

btnProximaFaculdade?.addEventListener("click", async () => {
  const totalPaginas = Math.ceil(totalFaculdades / 5);

  if (paginaAtualFaculdade < totalPaginas - 1) {
    paginaAtualFaculdade++;
    await carregarGraficoFaculdades();
  }
});

totalFaculdades = (await obterFaculdadesComQuantidade()).length;
await fetchEstatisticas();
await inserirAvisos();
await carregarGrafico();
await carregarGraficoFaculdades();