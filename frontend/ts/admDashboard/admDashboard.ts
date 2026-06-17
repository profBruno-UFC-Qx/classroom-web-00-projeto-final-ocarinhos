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
renderizarSidebar("sidebar-container", "dashboard");
  