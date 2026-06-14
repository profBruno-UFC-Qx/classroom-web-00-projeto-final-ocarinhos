let div = null;
let timer;
export default function showTopMessage(text, type) {
    if (div) {
        div.remove();
        clearTimeout(timer);
    }
    let color = "";
    if (type == "error") {
        color = "#dc2626";
    }
    else if (type == "alert") {
        color = "#2159a6";
    }
    div = document.createElement("div");
    div.id = "alerta";
    div.textContent = text;
    Object.assign(div.style, {
        position: "fixed",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        background: color,
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        zIndex: "9999",
    });
    document.body.appendChild(div);
    timer = setTimeout(() => {
        if (div) {
            div.remove();
        }
    }, 3000);
}
