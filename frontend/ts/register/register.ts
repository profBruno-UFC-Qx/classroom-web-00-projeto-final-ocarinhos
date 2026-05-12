import { supabase } from "../supabase/supabase.js";
import showTopMessage from "../utils/showError.js";

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
    showTopMessage("Digite ate 6 caracteres na sua senha");
    return false;
  }

  if (obj.senha != obj.confirmarsenha) {
    showTopMessage("senhas diferentes");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof obj.email == "string" && !emailRegex.test(obj.email)) {
    showTopMessage("Email inválido");
    return false;
  }
  return true;
}

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

  // const elements = [nome, email, IES, curso, senha, confrmarsenha];

  // function showError(selector: string, msg: string) {
  //   const erroBox = document.querySelector(`.input-group .${selector}`);
  //   if (erroBox) {
  //     erroBox.innerHTML = msg;
  //   }
  // }

  // function checkLogin(obj: unknown): obj is LoginData {
  //   if (
  //     !(
  //       obj &&
  //       typeof obj == "object" &&
  //       "confirmar-senha" in obj &&
  //       "curso" in obj &&
  //       "email" in obj &&
  //       "ies" in obj &&
  //       "nome" in obj &&
  //       "senha" in obj
  //     )
  //   ) {
  //     return false;
  //   }

  //   const existeElementosVazios = elements.filter((element) => {
  //     if (!element.value) {
  //       showError(element.name, "Digite um valor");
  //       return true;
  //     } else {
  //       showError(element.name, "");
  //     }
  //   });

  //   if (!existeElementosVazios) {
  //     return false;
  //   }

  //   if (obj.senha && obj.senha != obj["confirmar-senha"]) {
  //     showError("senha", "senhas diferentes");
  //     return false;
  //   }

  //   if (typeof obj.senha == "string" && obj.senha.length < 6) {
  //     showError("senha", "Digite ate 6 caracteres");
  //     return false;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //   if (typeof obj.email == "string" && !emailRegex.test(obj.email)) {
  //     showError("email", "Email inválido");
  //     return false;
  //   }

  //   return true;
  // }

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(form);
    const objLogin = Object.fromEntries(formData.entries());

    if (temCampoVazio(objLogin)) {
      showTopMessage("Ainda existem campos vazios.");
      return;
    }

    console.log(objLogin)
    if (!isLoginData(objLogin)) {
      showTopMessage("Formato do formulario é invalido.");
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
            ies: objLogin.ies,
          },
        },
      });

      if (!error) {
        window.location.href = "/index.html";
      }

      if (error) {
        console.log(error);
      }
    }
  };

  form.addEventListener("submit", onSubmit);
}
