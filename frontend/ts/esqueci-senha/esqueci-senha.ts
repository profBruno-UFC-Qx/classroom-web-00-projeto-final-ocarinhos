import showTopMessage from "../utils/showMsg.js";
import { supabase } from "../supabase/supabase.js";

const formRecuperacao = document.getElementById(
  "esquecisenha-form",
) as HTMLFormElement;

formRecuperacao.addEventListener("submit", async function (event) {
  event.preventDefault();
  const inputEmail = document.getElementById("email") as HTMLInputElement;

  if (inputEmail && inputEmail.value) {
    await supabase.auth.resetPasswordForEmail(inputEmail.value, {
      redirectTo: "http://127.0.0.1:5501/aluno/redefinirSenha.html",
    });

    showTopMessage(
      "Link de recuperação enviado para: " + inputEmail.value,
      "alert",
    );
  }
});
