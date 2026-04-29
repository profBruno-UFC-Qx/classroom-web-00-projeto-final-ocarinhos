import { supabase } from "../supabase/supabase.js";

const { data, error } = await supabase.from("usuarios")
  .select("*");

if (error) {
  console.error(error);
} else {
  console.log(data);
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
