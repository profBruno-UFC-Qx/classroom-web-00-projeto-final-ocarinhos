const form = document.querySelector(".form");

if (form instanceof HTMLFormElement) {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const IES = document.getElementById("ies");
  const curso = document.getElementById("curso");
  const senha = document.getElementById("senha");
  const confrmarsenha = document.getElementById("confirmar-senha");

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    if (
      nome instanceof HTMLInputElement &&
      email instanceof HTMLInputElement &&
      IES instanceof HTMLSelectElement &&
      curso instanceof HTMLInputElement &&
      senha instanceof HTMLInputElement &&
      confrmarsenha instanceof HTMLInputElement
    ) {
      const objLogin = {
        name: nome.value,
        email: email.value,
        IES: IES.value,
        curso: curso.value,
        senha: senha.value,
        confrmarsenha: confrmarsenha.value,
      };
      console.log(objLogin);
    }
  };

  form.addEventListener("submit", onSubmit);
}
