import { supabase } from "../supabase/supabase.js";


const { data, error } = await supabase
  .from('teste')
  .select()

console.log(data)

const form = document.querySelector(".form");

if (form instanceof HTMLFormElement) {
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    if (
      email instanceof HTMLInputElement &&
      senha instanceof HTMLInputElement
    ) {
      const objLogin = {
        name: email.value,
        senha: senha.value,
      };
      console.log(objLogin);
    }
  };

  form.addEventListener("submit", onSubmit);
}

export {};
