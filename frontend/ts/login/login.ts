const form = document.querySelector(".login-form");

if (form instanceof HTMLFormElement) {
  const name = document.getElementById("username");
  const password = document.getElementById("password");

  const onSubmit = (event: SubmitEvent) => {
    if (name && password) {
      // logica
    }
  };

  form.addEventListener("submit", onSubmit);
}
