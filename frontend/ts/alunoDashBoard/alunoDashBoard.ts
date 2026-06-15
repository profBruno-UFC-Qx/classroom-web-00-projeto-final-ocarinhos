import { renderizarSidebar } from "../components/sidebar.js";
renderizarSidebar("sidebar-container", "dashboard");
import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";

interface Aviso {
  id: number;
  titulo: string;
  desc: string;
  data: string;
}

type ParticipaFreq = {
  ida_embarque: string;
  ida_destino: string;
  volta_destino: string;
  volta_embarque: string;
  ida: boolean;
  volta: boolean;
  Datas: {
    data_ocorrencia: string;
    motoristaAssociacao: {
      faculdades: {
        nome: string;
      };
      motoristas: {
        nome: string;
        onibus: {
          nome: string;
        };
      };
      rotasComplementares: {
        nome: string;
      };
    }[];
  }[];
};

async function getFaculdadeById(id: string) {
  try {
    const { data, error } = await supabase
      .from("faculdades")
      .select("nome")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data.nome;
  } catch (error) {
    showTopMessage(
      "Nao foi possivel obter locais de embarque e destino",
      "error"
    );
    return "---";
  }
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

async function renderizarNome() {
  const campoNome = document.querySelector(".nomeUser");
  let nome;
  try {
    nome = await buscarNomeUsuario();
  } catch (e) {
    console.log(e);
    nome = null;
  }

  if (!(campoNome instanceof HTMLSpanElement)) return;

  if (nome) {
    campoNome.innerText = nome;
  } else {
    campoNome.innerText = "---";
  }
}

async function buscarNomeUsuario() {
  try {
    const { data } = await supabase.auth.getSession();
    console.log(data);
    return data.session.user.user_metadata.nome;
  } catch (e) {
    throw e;
  }
}

async function buscarFrequencia() {
  try {
    const {
      data: {
        session: { user },
      },
    } = await supabase.auth.getSession();

    const { id } = user;

    const hoje = new Date().toISOString().split("T")[0];

    const { data, error } = (await supabase
      .from("ParticipaFreq")
      .select(
        `
        ida_embarque,
        ida_destino,
        volta_destino,
        volta_embarque,
        ida,
        volta,
        Datas!inner (
          data_ocorrencia,
          motoristaAssociacao (
            faculdades(
              nome
            ),
            motoristas(
              nome,
              onibus(
                nome
              )
            ),
            rotasComplementares(
              nome
            )
          )
        )
      `
      )
      .eq("IDaluno", id)
      .eq("Datas.data_ocorrencia", hoje)
      .single()) as { data: ParticipaFreq; error: any };

    if (error) {
      throw error;
    }

    const motorista = data.Datas[0]?.motoristaAssociacao[0]?.motoristas;
    const rotasComplementar =
      data.Datas[0]?.motoristaAssociacao[0]?.rotasComplementares;
    const faculdades = data.Datas[0]?.motoristaAssociacao[0]?.faculdades;
    const dataHoje = data.Datas[0]?.data_ocorrencia;
    const onibus =
      data.Datas[0]?.motoristaAssociacao[0]?.motoristas.onibus.nome;
    const ida_embarque = data.ida_embarque;
    const volta_destino = data.volta_destino;
    const ida = data.ida;
    const volta = data.volta;
    const ida_destino = await getFaculdadeById(data.ida_destino);
    const volta_embarque = await getFaculdadeById(data.volta_embarque);

    return {
      motorista,
      rotasComplementar,
      faculdades,
      dataHoje,
      onibus,
      ida_embarque,
      volta_destino,
      ida_destino,
      volta_embarque,
      ida,
      volta,
    };
  } catch (e) {
    throw e;
  }
}

async function inserirFrequencia() {
  try {
    const response = await buscarFrequencia();
    const {
      motorista,
      rotasComplementar,
      faculdades,
      dataHoje,
      onibus,
      ida_embarque,
      volta_destino,
      ida_destino,
      volta_embarque,
      ida,
      volta,
    } = response;

    if (rotasComplementar && faculdades) {
      inserirInfosDeEmbarque({
        faculdade: faculdades?.nome,
        rotaComp: rotasComplementar?.nome,
      });
    }

    const datasHoje = document.querySelectorAll(
      ".data"
    ) as NodeListOf<HTMLSpanElement>;

    datasHoje.forEach((hoje) => {
      hoje.innerText = dataHoje ? dataHoje : "--/--/--";
    });

    const idaEmbarque = document.querySelector(
      ".idaEmbarque"
    ) as HTMLSpanElement;
    const idaDestino = document.querySelector(".idaDestino") as HTMLSpanElement;
    const voltaEmbarque = document.querySelector(
      ".voltaEmbarque"
    ) as HTMLSpanElement;
    const voltaDestino = document.querySelector(
      ".voltaDestino"
    ) as HTMLSpanElement;

    const onibusIda = document.querySelector(
      ".onibusIda"
    ) as HTMLParagraphElement;

    const motoristaIda = document.querySelector(
      ".motoristaIda"
    ) as HTMLParagraphElement;

    const onibusVolta = document.querySelector(
      ".onibusVolta"
    ) as HTMLParagraphElement;

    const motoristaVolta = document.querySelector(
      ".motoristaVolta"
    ) as HTMLParagraphElement;

    const rotaCompIda = document.querySelector(
      ".rotaCompIda"
    ) as HTMLParagraphElement;

    const rotaCompVolta = document.querySelector(
      ".rotaCompVolta"
    ) as HTMLParagraphElement;

    if (ida) {
      idaEmbarque.innerText = ida_embarque ? ida_embarque : "---";
      idaDestino.innerText = ida_destino ? ida_destino : "---";
      onibusIda.innerText = onibus ? onibus : "---";
      motoristaIda.innerText = motorista ? motorista.nome : "---";
      rotaCompIda.innerText = rotasComplementar
        ? rotasComplementar?.nome
        : "---";
    }
    if (volta) {
      onibusVolta.innerText = onibus ? onibus : "---";
      motoristaVolta.innerText = motorista ? motorista.nome : "---";
      voltaEmbarque.innerText = volta_embarque ? volta_embarque : "---";
      voltaDestino.innerText = volta_destino ? volta_destino : "---";
      rotaCompVolta.innerText = rotasComplementar
        ? rotasComplementar?.nome
        : "---";
    }
  } catch (error) {
    if (typeof error == "object" && error && "code" in error) {
      if (error.code == "PGRST116") {
        showTopMessage("Sem nenhum registro de frequencia", "alert");
      } else if (error.code == "42703") {
        console.log(error);
      }
    }
  }
}

async function inserirInfosDeEmbarque(infos: {
  faculdade: string;
  rotaComp: string;
}) {
  const faculdade = document.querySelector(
    ".embarqueFaculdade"
  ) as HTMLParagraphElement;
  const rotaComp = document.querySelector(
    ".embarqueRotaComp"
  ) as HTMLParagraphElement;

  faculdade.innerText = infos.faculdade;
  rotaComp.innerText = infos.rotaComp;
}

await buscarAvisosDoSupabase();
await renderizarNome();
await inserirFrequencia();
