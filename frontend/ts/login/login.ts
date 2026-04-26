import { supabase } from "../supabase/supabase.js";

interface LoginData {
  name: string;
  email: string;
  IES: string;
  curso: string;
  senha: string;
  confrmarsenha: string;
}

const form = document.querySelector(".form");

if (form instanceof HTMLFormElement) {
  const email = document.getElementById("email") as HTMLInputElement;
  const senha = document.getElementById("senha") as HTMLInputElement;

  const elements = [email, senha];

  function showError(selector: string, msg: string) {
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
        showError(element.name, "Digite um valor");
        return true;
      } else {
        showError(element.name, "");
      }
    });

    if (!existeElementosVazios) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof obj.email == "string" && !emailRegex.test(obj.email)) {
      showError("email", "Email inválido");
      return false;
    }

    return true;
  }

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(form);
    const objLogin = Object.fromEntries(formData.entries());
    console.log(objLogin);

    if (checkLogin(objLogin)) {
      // logica de login
    }
  };

  form.addEventListener("submit", onSubmit);
}

export {};
