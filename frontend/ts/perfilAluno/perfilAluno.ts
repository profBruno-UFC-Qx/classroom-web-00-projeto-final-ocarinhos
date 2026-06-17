import { renderizarSidebar } from "../components/sidebar.js";
import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js"; 

renderizarSidebar("sidebar-container", "perfil");

const formPerfil = document.getElementById("form-perfil") as HTMLFormElement | null;
const nomeInput = document.getElementById("nome") as HTMLInputElement | null;
const emailInput = document.getElementById("email") as HTMLInputElement | null;
const faculdadeSelect = document.getElementById("faculdade") as HTMLSelectElement | null;
const telefoneInput = document.getElementById("telefone") as HTMLInputElement | null;
const cursoInput = document.getElementById("curso") as HTMLInputElement | null;

const displayNome = document.getElementById("display-nome") as HTMLElement | null;
const displayCurso = document.getElementById("display-curso") as HTMLElement | null;

let userId: string | null = null;


async function carregarPerfil() {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      window.location.replace("login.html");
      return;
    }
    
    userId = authData.user.id;

    const { data: faculdades, error: faculdadesError } = await supabase
      .from("faculdades")
      .select("id, nome")
      .order("nome");

    if (faculdadesError) throw new Error("Erro ao carregar faculdades.");

    if (faculdades && faculdadeSelect) {
      faculdadeSelect.innerHTML = '<option value="">Selecione sua faculdade</option>';
      faculdades.forEach((fac: { id: any; nome: string | null; }) => {
        const option = document.createElement("option");
        option.value = String(fac.id);
        option.textContent = fac.nome;
        faculdadeSelect.appendChild(option);
      });
    }

    const { data: usuario, error: errorUser } = await supabase
      .from("usuarios")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (errorUser) throw new Error("Erro ao buscar dados do perfil.");

    if (usuario) {
      if (nomeInput) nomeInput.value = usuario.nome ?? "";
      if (emailInput) emailInput.value = usuario.email ?? authData.user.email ?? "";
      if (cursoInput) cursoInput.value = usuario.curso ?? "";
      if (telefoneInput) telefoneInput.value = usuario.number ?? ""; 
      if (faculdadeSelect && usuario.ies) faculdadeSelect.value = String(usuario.ies); 
      
      if (displayNome) displayNome.textContent = usuario.nome || "Aluno";
      if (displayCurso) displayCurso.textContent = usuario.curso || "Curso não definido";
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao carregar perfil.";
    showTopMessage(message, "error");
  }
}


async function salvarPerfil(event: SubmitEvent) {
  event.preventDefault();
  
  if (!userId || !nomeInput || !cursoInput || !faculdadeSelect || !telefoneInput) return;

  const submitButton = formPerfil?.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (submitButton) submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Salvando...';

  const payload = {
    nome: nomeInput.value.trim(),
    curso: cursoInput.value.trim(),
    ies: Number(faculdadeSelect.value),
    number: telefoneInput.value.trim() 
  };

try {
  const { error } = await supabase
    .from("usuarios")
    .update(payload)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  showTopMessage("Perfil atualizado com sucesso!", "alert");
  
  if (displayNome) displayNome.textContent = payload.nome;
  if (displayCurso) displayCurso.textContent = payload.curso;

} catch (error) {
  console.error(error);
  showTopMessage("Não foi possível atualizar o perfil.", "error");
} finally {
  if (submitButton) submitButton.innerHTML = '<i class="bi bi-download"></i> Salvar Alterações';
}
}

formPerfil?.addEventListener("submit", salvarPerfil);
window.addEventListener("DOMContentLoaded", carregarPerfil);