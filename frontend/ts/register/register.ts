import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showMsg.js";

interface LoginData {
  nome: string;
  email: string;
  ies: string;
  curso: string;
  senha: string;
  confirmarsenha: string;
}

function temCampoVazio(obj: object) {
  return Object.values(obj).some(
    (valor) => valor === "" || valor === null || valor === undefined
  );
}

function isLoginData(obj: any): obj is LoginData {
  if (typeof obj !== "object" || obj === null) return false;

  const campos = ["nome", "email", "ies", "curso", "senha", "confirmarsenha"];

  return campos.every((campo) => typeof obj[campo] === "string");
}

function verificarCampos(obj: LoginData): Boolean {
  if (obj.senha.length < 6) {
    showTopMessage("Digite ate 6 caracteres na sua senha","error");
    return false;
  }

  if (obj.senha != obj.confirmarsenha) {
    showTopMessage("senhas diferentes","error");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof obj.email == "string" && !emailRegex.test(obj.email)) {
    showTopMessage("Email inválido","error");
    return false;
  }
  return true;
}

async function preencherFaculdades() {
  const { data, error } = await supabase.from("faculdades").select("id, nome");
  const select = document.getElementById("ies") as HTMLSelectElement;

  if (error) {
    showTopMessage(error.message, "error");
    return;
  }

  data?.forEach((faculdades) => {
    const options = document.createElement("option");
    options.value = faculdades.id;
    options.innerText = faculdades.nome;
    select.appendChild(options);
  });
}

preencherFaculdades();

const form = document.querySelector(".form");

if (form instanceof HTMLFormElement) {
  const nome = document.getElementById("nome") as HTMLInputElement;
  const email = document.getElementById("email") as HTMLInputElement;
  const IES = document.getElementById("ies") as HTMLSelectElement;
  const curso = document.getElementById("curso") as HTMLInputElement;
  const senha = document.getElementById("senha") as HTMLInputElement;
  const confrmarsenha = document.getElementById(
    "confirmarsenha"
  ) as HTMLInputElement;

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(form);
    const objLogin = Object.fromEntries(formData.entries());

    if (temCampoVazio(objLogin)) {
      showTopMessage("Ainda existem campos vazios.", "error");
      return;
    }

    console.log(objLogin);
    if (!isLoginData(objLogin)) {
      showTopMessage("Formato do formulario é invalido.", "error");
      return;
    }

    const isValid = verificarCampos(objLogin);

    if (isValid) {
      const { data, error } = await supabase.auth.signUp({
        email: objLogin.email,
        password: objLogin.senha,
        options: {
          data: {
            nome: objLogin.nome,
            curso: objLogin.curso,
            ies: Number(objLogin.ies),
          },
        },
      });

      if (!error) {
        window.location.href = "/index.html";
      }

      if (error) {
        showTopMessage("Algo deu errado, tente novamente.", "error");
        console.log(error);
        return;
      }
    }
  };

  form.addEventListener("submit", onSubmit);
}
