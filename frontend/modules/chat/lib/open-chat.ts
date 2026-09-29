/** Evento global para abrir o assistente (botões do hero e da barra mobile). */
export const OPEN_ASSIST_CHAT_EVENT = "open-assist-chat";

export function openAssistChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_ASSIST_CHAT_EVENT));
}
