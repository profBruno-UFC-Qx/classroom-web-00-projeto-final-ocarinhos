declare const Chart: any;

const chart_div = document.getElementById("dashboard") as HTMLCanvasElement;

const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const data_sample = [10, 20, 30, 40, 50, 60, 70];

new Chart(chart_div, {
  type: "bar",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Dataset 1",
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
        position: "top",
      },
    },
  },
});

import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");
