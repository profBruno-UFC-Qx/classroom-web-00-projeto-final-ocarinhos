import { renderizarSidebar } from '../components/sidebar.js';
import { supabase } from '../supabase/supabase.js';
import showTopMessage from '../utils/showMsg.js';

renderizarSidebar('sidebar-container', 'formulario');

interface Faculdade {
  id: number;
  nome: string;
}

interface RotaComplementar {
  id: number;
  nome: string;
  bairro: string | null;
}

type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta";

const diaSemanaParaNumero: Record<DiaSemana, number> = {
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
};

type RegistroParticipaFreq = {
  IDaluno: string;
  ida: boolean;
  volta: boolean;
  ida_embarque: string | null;
  ida_destino: number | null;
  volta_embarque: number | null;
  volta_destino: string | null;
  rotaComplementar: number | null;
};

type DatasRegistro = {
  data_ocorrencia: string;
  frequencia: number;
};

function obterDataCorreta(dia: DiaSemana) {
  const alvo = diaSemanaParaNumero[dia];
  const hoje = new Date();
  const hojeNumero = hoje.getDay();

  const delta = (alvo - hojeNumero + 7) % 7;

  const data = new Date();
  data.setDate(hoje.getDate() + delta);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const diaMes = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${diaMes}`;
}

function desabilitarDiasPassados() {
  const hoje = new Date();
  const diaAtual = hoje.getDay();

  if (diaAtual === 0 || diaAtual === 6) {
    return;
  }

  const checkboxes = document.querySelectorAll('input[name="dias"]');

  checkboxes.forEach((checkbox) => {
    const input = checkbox as HTMLInputElement;
    const diaValue = input.value as DiaSemana;
    const numeroDoDia = diaSemanaParaNumero[diaValue];

    if (numeroDoDia < diaAtual) {
      input.disabled = true;
      input.title = "Este dia já passou."; 
      
      if (input.parentElement) {
        input.parentElement.style.opacity = "0.5";
        input.parentElement.style.cursor = "not-allowed";
      }
    }
  });
}

const form = document.getElementById("formulario-semanal");

if (form instanceof HTMLFormElement) {
  desabilitarDiasPassados();

  const nomeInput = document.getElementById("nome") as HTMLInputElement | null;
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;

  const radioSim = form.querySelector('input[value="sim"][name="rotaComplementar"]') as HTMLInputElement;
  const radioNao = form.querySelector('input[value="nao"][name="rotaComplementar"]') as HTMLInputElement;
  const selectParadaSaida = form.querySelector('select[name="paradaSaida"]') as HTMLSelectElement;
  const selFaculdade = form.querySelector('select[name="faculdadeDestino"]') as HTMLSelectElement;
  const selRota = form.querySelector('select[name="rotaComplementarDestino"]') as HTMLSelectElement;

  let alunoId: string | null = null;
  let salvandoFormulario = false;
  let idsFaculdadesValidas = new Set<number>();
  let idsRotasComplementaresValidas = new Set<number>();

  const setSubmitting = (isSubmitting: boolean) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? "Salvando..."
      : "Salvar formulário semanal";
  };

  const preencherSelect = (
    select: HTMLSelectElement,
    placeholder: string,
    options: Array<{ value: string; label: string }>
  ) => {
    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);

    options.forEach((optionData) => {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.label;
      select.appendChild(option);
    });
  };

  function textoSel(select: HTMLSelectElement): string | null {
    const option = select.selectedOptions[0];
    const texto = option?.textContent?.trim();
    return texto ? texto : null;
  }

  function numSel(value: FormDataEntryValue | null): number | null {
    if (typeof value !== "string" || value.trim() === "") return null;
    const numero = Number(value);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
  }

  const carregarSelectFaculdades = async () => {
    const { data, error } = await supabase
      .from("faculdades")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const faculdades = (data ?? []) as Faculdade[];
    idsFaculdadesValidas = new Set(faculdades.map((faculdade) => Number(faculdade.id)));

    preencherSelect(
      selFaculdade,
      "Selecione sua Faculdade",
      faculdades.map((faculdade) => ({ value: String(faculdade.id), label: faculdade.nome }))
    );
  };

  const carregarSelectRotasComplementares = async () => {
    const { data, error } = await supabase
      .from("rotasComplementares")
      .select("id, nome, bairro")
      .order("nome", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const rotasComplementares = (data ?? []) as RotaComplementar[];
    idsRotasComplementaresValidas = new Set(rotasComplementares.map((rota) => Number(rota.id)));

    preencherSelect(
      selRota,
      "Selecione a rota complementar",
      rotasComplementares.map((rota) => ({ value: String(rota.id), label: rota.bairro ? `${rota.nome} - ${rota.bairro}` : rota.nome }))
    );
  };

  const carregarDadosAlunoLogado = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new Error("Voce precisa estar logado para preencher o formulario.");
    }

    const { data: alunoDb, error: erroAlunoDb } = await supabase
      .from("usuarios")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (erroAlunoDb) {
      throw new Error("Nao foi possivel validar o aluno no sistema.");
    }

    if (!alunoDb) {
      throw new Error("Aluno nao encontrado na tabela usuarios. Finalize seu cadastro antes de enviar.");
    }

    alunoId = data.user.id;

    if (nomeInput && !nomeInput.value) {
      nomeInput.value = String(data.user.user_metadata.nome ?? "");
    }

    if (emailInput && !emailInput.value) {
      emailInput.value = data.user.email ?? "";
    }
  };

  const carregarDadosIniciais = async () => {
    try {
      await Promise.all([
        carregarDadosAlunoLogado(),
        carregarSelectFaculdades(),
        carregarSelectRotasComplementares(),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar formulario.";
      showTopMessage(message, "error");
    }
  };

  const atualizarEstadoRotaComplementar = () => {
    const precisaDeRota = radioSim.checked;

    selRota.disabled = !precisaDeRota;
    selRota.required = precisaDeRota;
    if (!precisaDeRota) selRota.value = "";
  };

  radioSim?.addEventListener("change", atualizarEstadoRotaComplementar);
  radioNao?.addEventListener("change", atualizarEstadoRotaComplementar);

  atualizarEstadoRotaComplementar();

  void carregarDadosIniciais();

  const validarIdsSelecionados = (faculdadeDestino: number, rotaComplementarDestino: number | null): string | null => {
    if (idsFaculdadesValidas.size > 0 && !idsFaculdadesValidas.has(faculdadeDestino)) {
      return "Faculdade destino invalida para a tabela faculdades.";
    }

    if (rotaComplementarDestino !== null && idsRotasComplementaresValidas.size > 0 && !idsRotasComplementaresValidas.has(rotaComplementarDestino)) {
      return "Rota complementar invalida para a tabela rotasComplementares.";
    }

    return null;
  };

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (salvandoFormulario) {
      return;
    }

    const diasSelecionados = Array.from(
      form.querySelectorAll('input[name="dias"]:checked')
    ).map((el) => (el as HTMLInputElement).value as DiaSemana);

    const diasUnicos = Array.from(new Set(diasSelecionados));

    if (diasUnicos.length === 0) {
      showTopMessage("Selecione pelo menos um dia da semana.", "error");
      return;
    }

    const formData = new FormData(form);

    const tipoUso = String(formData.get("tipoUso") ?? "");
    const paradaSaida = String(formData.get("paradaSaida") ?? "").trim();
    const faculdadeDestino = numSel(formData.get("faculdadeDestino"));
    const rotaComplementar = String(formData.get("rotaComplementar") ?? "nao") === "sim";
    const rotaComplementarDestino = numSel(formData.get("rotaComplementarDestino"));
    const paradaSaidaTexto = textoSel(selectParadaSaida);

    if (!alunoId) {
      showTopMessage("Voce precisa estar logado para enviar o formulario.", "error");
      return;
    }

    if (!paradaSaida || faculdadeDestino === null || !paradaSaidaTexto) {
      showTopMessage("Preencha os campos de rota e faculdade corretamente.", "error");
      return;
    }

    if (rotaComplementar && rotaComplementarDestino === null) {
      showTopMessage("Selecione uma rota complementar valida.", "error");
      return;
    }

    const erroValidacaoIds = validarIdsSelecionados(faculdadeDestino, rotaComplementar ? rotaComplementarDestino : null);

    if (erroValidacaoIds) {
      showTopMessage(erroValidacaoIds, "error");
      return;
    }

    const ida = tipoUso !== "apenas-volta";
    const volta = tipoUso !== "apenas-ida";

    try {
      salvandoFormulario = true;
      setSubmitting(true);

      const registroParticipaFreq: RegistroParticipaFreq = {
        IDaluno: alunoId,
        ida,
        volta,
        ida_embarque: ida ? paradaSaidaTexto : null,
        ida_destino: ida ? faculdadeDestino : null,
        volta_embarque: volta ? faculdadeDestino : null,
        volta_destino: volta ? paradaSaidaTexto : null,
        rotaComplementar: rotaComplementar && rotaComplementarDestino ? rotaComplementarDestino : null,
      };

      const datasSelecionadas = diasUnicos.map((dia) => obterDataCorreta(dia));

      const { data: datasExistentes, error: erroDatasExistentes } = await supabase
        .from("Datas")
        .select(`
          data_ocorrencia,
          ParticipaFreq!inner (
            IDaluno
          )
        `)
        .eq("ParticipaFreq.IDaluno", alunoId)
        .in("data_ocorrencia", datasSelecionadas);
      
      if (erroDatasExistentes) {
        throw new Error("Erro ao verificar formulários existentes.");
      }

      if (datasExistentes && datasExistentes.length > 0) {
        const diasDuplicados = datasExistentes.map((d: any) => d.data_ocorrencia);

        showTopMessage(`Você já possui formulário cadastrado para: ${diasDuplicados.join(", ")}`, "error");
        return;
      }

      const { data: participaFreqCriada, error: erroParticipaFreq } = await supabase
        .from("ParticipaFreq")
        .insert(registroParticipaFreq)
        .select("id")
        .single();

      if (erroParticipaFreq || !participaFreqCriada) {
        if (erroParticipaFreq?.code === "23503") {
          throw new Error(`Falha de relacionamento (FK) ao salvar em ParticipaFreq. ${erroParticipaFreq.message}`);
        }

        throw new Error(erroParticipaFreq?.message ?? "Nao foi possivel salvar o formulario.");
      }

      const datas: DatasRegistro[] = diasUnicos.map((dia) => ({
        data_ocorrencia: obterDataCorreta(dia),
        frequencia: Number(participaFreqCriada.id),
      }));

      const { error: erroDatas } = await supabase.from("Datas").insert(datas);

      if (erroDatas) {
        await supabase.from("ParticipaFreq").delete().eq("id", Number(participaFreqCriada.id));

        if (erroDatas.code === "23503") {
          throw new Error(`Falha de relacionamento (FK) ao salvar em Datas. ${erroDatas.message}`);
        }

        throw new Error(erroDatas.message);
      }

      showTopMessage(
        "Formulario semanal salvo com sucesso.",
        "alert"
      );

      form.reset();

      const { data: authData } = await supabase.auth.getUser();

      if (nomeInput) {
        nomeInput.value = String(authData.user?.user_metadata.nome ?? "");
      }

      if (emailInput) {
        emailInput.value = authData.user?.email ?? "";
      }

      atualizarEstadoRotaComplementar();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Nao foi possivel salvar o formulario.";

      showTopMessage(message, "error");
    } finally {
      setSubmitting(false);
      salvandoFormulario = false;
    }
  };

  form.addEventListener("submit", onSubmit);
}
