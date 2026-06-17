declare const Chart: any;
import { supabase } from "../supabase/supabase.js";

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
        .gte("data_ocorrencia", segunda.toISOString().split("T")[0])
        .lte("data_ocorrencia", domingo.toISOString().split("T")[0]);

    if (error) throw error;

    const contagem = Array(7).fill(0);

    data?.forEach((registro: { data_ocorrencia: string }) => {
      const dataRegistro = new Date(registro.data_ocorrencia + "T00:00:00");
      const indice = (dataRegistro.getDay() + 6) % 7;

      contagem[indice]++;
    });

    return contagem;
}


async function carregarGrafico() {
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
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

carregarGrafico();
import { renderizarSidebar } from "../components/sidebarADM.js";
import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";
renderizarSidebar("sidebar-container", "dashboard");

interface Aviso {
  id: number;
  titulo: string;
  desc: string;
  data: string;
}

async function fetchEstatisticas() {
  const { count: totalMotorista, error: errMotorista } = await supabase
    .from("motoristas")
    .select("*", { count: "exact", head: true });

  inserirTotalMotoristas(totalMotorista);

  const { count: totalAlunos, error: errAlunos } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true });

  inserirTotalAlunos(totalAlunos);

  const { count: totalOnibus, error: errOnibus } = await supabase
    .from("onibus")
    .select("*", { count: "exact", head: true });

  inserirTotalOnibus(totalOnibus);

  const { count: totalRotas, error: errRotas } = await supabase
    .from("rotasComplementares")
    .select("*", { count: "exact", head: true });

  inserirTotalRotas(totalRotas);
}

function inserirTotalMotoristas(totalMotorista: number) {
  const cell = document.querySelector(
    ".qtd-motoristas"
  ) as HTMLParagraphElement;

  cell.innerText = String(totalMotorista);
}

function inserirTotalAlunos(totalAlunos: number) {
  const cell = document.querySelector(".qtd-alunos") as HTMLParagraphElement;

  cell.innerText = String(totalAlunos);
}

function inserirTotalOnibus(totalOnibus: number) {
  const cell = document.querySelector(".qtd-onibus") as HTMLParagraphElement;

  cell.innerText = String(totalOnibus);
}

function inserirTotalRotas(totalRotas: number) {
  const cell = document.querySelector(".qtd-rotas") as HTMLParagraphElement;

  cell.innerText = String(totalRotas);
}

async function inserirAvisos() {
  const avisosGroup = document.querySelector(".avisos-group") as HTMLDivElement;

  try {
    const Avisos = await fetchAvisos();
    Avisos.forEach((aviso) => {
      const avisoModel = document.createElement("div");
      avisoModel.innerHTML = `
    <div class="dash-aviso-item dash-aviso-info">
                    <div class="dash-aviso-titulo">
                      ${aviso.titulo}
                    </div>
                    <div class="dash-aviso-desc">
                      ${aviso.desc}
                    </div>
                  </div>`;
      avisosGroup.appendChild(avisoModel);
    });

    console.log(avisosGroup);
  } catch (e) {
    showTopMessage("Não foi possível carregar os avisos.", "error");
    console.log(e);
  }
}

async function fetchAvisos(): Promise<Array<Aviso>> {
  const { data, error } = await supabase
    .from("avisos")
    .select("id, titulo, desc, data")
    .order("data", { ascending: false })
    .range(0, 2);

  if (error) {
    throw new Error("Não foi possível carregar os avisos");
  }

  return data;
}

fetchEstatisticas();
await inserirAvisos();
