import { renderizarSidebar } from '../components/sidebar.js';
renderizarSidebar('sidebar-container', 'formulario');
const form = document.querySelector(".sem-form-corpo");

if (form instanceof HTMLFormElement) {
  const radioSim = form.querySelector('input[value="sim"][name="rotaComplementar"]') as HTMLInputElement;
  const radioNao = form.querySelector('input[value="nao"][name="rotaComplementar"]') as HTMLInputElement;
  const selectRotaDestino = form.querySelector('select[name="rotaDestino"]') as HTMLSelectElement;

  const atualizarEstadoRota = () => {
    const precisaDeRota = radioSim.checked;
    selectRotaDestino.disabled = !precisaDeRota;
    selectRotaDestino.required = precisaDeRota;
    
    if (!precisaDeRota) {
      selectRotaDestino.value = "";
    }
  };

  radioSim?.addEventListener("change", atualizarEstadoRota);
  radioNao?.addEventListener("change", atualizarEstadoRota);

  atualizarEstadoRota();

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    const nome = document.getElementById("nome") as HTMLInputElement | null;
    const email = document.getElementById("email") as HTMLInputElement | null;

    const diasSelecionados = Array.from(
      document.querySelectorAll('input[name="dias"]:checked')
    ).map((el) => (el as HTMLInputElement).value);

    if (diasSelecionados.length === 0) {
      alert("Por favor, selecione pelo menos um dia da semana.");
      return;
    }

    const formData = new FormData(form);
    
    if (nome && email) {
      const objAgendamento = {
        aluno: nome.value,
        email: email.value,
        dias: diasSelecionados,
        tipoUso: formData.get("tipoUso"),
        paradaSaida: formData.get("paradaSaida"),
        faculdadeDestino: formData.get("faculdadeDestino"),
        rotaComplementar: formData.get("rotaComplementar"),
        rotaDestino: formData.get("rotaDestino"),
      };

      console.log("Dados prontos:", objAgendamento);
      alert("Formulário validado!");
    }
  };

  form.addEventListener("submit", onSubmit);
}