import { supabase } from "../supabase/supabase.js";

const { data } = await supabase.auth.getSession();

if (data) {
  const dataUser = data.session?.user.user_metadata;
  console.log(data);
  const btn = document.querySelector(".login-btn");

  if (btn instanceof HTMLAnchorElement && dataUser) {
    const hello = document.createElement("h1");
    hello.classList.add("hello-msg")

    hello.innerText = `Olá, ${dataUser.nome}`;
    btn.replaceWith(hello);
  }
}

const header = document.querySelector<HTMLElement>(".header");
const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");

if (header && menuToggle) {
  const closeMenu = () => {
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });

  const menuLinks = header.querySelectorAll<HTMLAnchorElement>(
    ".nav a, .nav-login a"
  );

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}
