let div: HTMLDivElement | null = null;
let timer: number;

export default function showTopMessage(text: string): void {
  if (div) {
    div.remove();
    clearTimeout(timer);
  }

  div = document.createElement("div");
  div.id = "alerta";
  div.textContent = text;

  Object.assign(div.style, {
    position: "fixed",
    top: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#dc2626",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
    zIndex: "9999",
  } as CSSStyleDeclaration);

  document.body.appendChild(div);

  timer = setTimeout(() => {
    if (div) {
      div.remove();
    }
  }, 3000);
}
