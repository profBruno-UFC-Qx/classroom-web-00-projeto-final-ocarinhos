import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";

function verificarSenhas(senha: string, confirmarSenha: string): boolean {
  if (senha.length < 6) {
    showTopMessage("A senha deve ter pelo menos 6 caracteres.", "error");
    return false;
  }
  if (senha !== confirmarSenha) {
    showTopMessage("As senhas não coincidem.", "error");
    return false;
  }
  return true;
}

async function mudarSenha(event: SubmitEvent) {
  event.preventDefault();
  const inputs = form.querySelectorAll('input[type="password"]');
  const senha = (inputs[0] as HTMLInputElement).value;
  const confirmarSenha = (inputs[1] as HTMLInputElement).value;

  if (verificarSenhas(senha, confirmarSenha)) {
    const { data, error } = await supabase.auth.updateUser({ password: senha });
    console.log(data);

    if (!error) {
      showTopMessage("Senha redefinida com sucesso!", "alert");
      window.location.href = "../../aluno/login.html";
    }

    if (error) {
      showTopMessage("Link expirado ou inválido", "error");
    }
  }
}

const form = document.getElementById("redefinir-form") as HTMLFormElement;

form.addEventListener("submit", mudarSenha);
