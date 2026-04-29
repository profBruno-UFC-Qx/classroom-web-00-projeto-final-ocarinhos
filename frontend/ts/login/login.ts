import { supabase } from "../supabase/supabase.js";

interface LoginData {
  nome: string;
  email: string;
  ies: string;
  curso: string;
  senha: string;
  confrmarsenha: string;
}


const form = document.querySelector(".form");

if (form instanceof HTMLFormElement) {
  const email = document.getElementById("email") as HTMLInputElement;
  const senha = document.getElementById("senha") as HTMLInputElement;

  const elements = [email, senha];

  function showApiError(msg: string) {
    const erro = document.querySelector(".api-error");

    if (erro instanceof HTMLElement) {
      erro.innerText = msg;
      erro.classList.add("show");

      setTimeout(() => {
        erro.classList.remove("show");
        erro.innerText = "";
      }, 3000);
    }
  }

  function showInputError(selector: string, msg: string) {
    const erroBox = document.querySelector(`.input-group .${selector}`);
    if (erroBox) {
      erroBox.innerHTML = msg;
    }
  }

  function checkLogin(obj: unknown): obj is LoginData {
    if (!(obj && typeof obj == "object" && "email" in obj && "senha" in obj)) {
      return false;
    }

    const existeElementosVazios = elements.filter((element) => {
      if (!element.value) {
        showInputError(element.name, "Digite um valor");
        return true;
      } else {
        showInputError(element.name, "");
      }
    });

    if (!existeElementosVazios) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof obj.email == "string" && !emailRegex.test(obj.email)) {
      showInputError("email", "Email inválido");
      return false;
    }

    return true;
  }

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(form);
    const objLogin = Object.fromEntries(formData.entries());

    if (checkLogin(objLogin)) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: objLogin.email,
        password: objLogin.senha,
      });

      if (!error) {
        window.location.href = "/index.html";
      }

      if (error && error.code == "invalid_credentials") {
        showApiError("Login ou senha incorretos");
      } else if (error) {
        showApiError("Alguma coisa deu errado");
      }

      console.log(data);
      console.log(error);
    }
  };

  form.addEventListener("submit", onSubmit);
}

export {};
