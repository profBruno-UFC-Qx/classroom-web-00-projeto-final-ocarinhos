import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");
import { supabase } from "../supabase/supabase.js";

interface Aviso {
  id: number;
  titulo: string;
  desc: string;
  data: string;
}

function renderizarMural(avisos: Aviso[]): void {
  const listaMural = document.querySelector(".mural ul");

  if (!listaMural) {
    console.error("Elemento .mural ul não foi encontrado no DOM.");
    return;
  }
  listaMural.innerHTML = "";

  if (avisos.length === 0) {
    listaMural.innerHTML =
      '<li><p style="padding: 10px;">Nenhum aviso no momento.</p></li>';
    return;
  }

  avisos.forEach((aviso) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="muralCard">
        <div>
          <img src="../assets/dashBoard/aviso.svg" alt="Ícone de aviso" />
        </div>
        <div class="muralInfo">
          <h1>${aviso.titulo}</h1>
          <p>${aviso.desc}</p>
        </div>
      </div>
    `;

    listaMural.appendChild(li);
  });
}

async function buscarAvisosDoSupabase(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("avisos")
      .select("id, titulo, desc, data")
      .order("data", { ascending: false });

    if (error) {
      throw error;
    }

    if (data) {
      renderizarMural(data as Aviso[]);
    }
  } catch (error) {
    console.error("Erro ao buscar avisos do Supabase:", error);
  }
}

buscarAvisosDoSupabase();
