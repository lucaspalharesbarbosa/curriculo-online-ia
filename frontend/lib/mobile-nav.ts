export const MOBILE_NAV_SECTIONS = [
  { id: "perfil", label: "Perfil", short: "Perfil" },
  { id: "experiencia", label: "Experiência", short: "Exp." },
  { id: "educacao", label: "Educação", short: "Edu." },
  { id: "certificacoes", label: "Certificações", short: "Certs" },
  { id: "reconhecimentos", label: "Reconhecimentos", short: "Reco." },
  { id: "destaques", label: "Destaques", short: "Projetos" },
] as const;

export type MobileNavSectionId = (typeof MOBILE_NAV_SECTIONS)[number]["id"];

/** Evento global para abrir o Assistente RAG a partir do hero mobile. */
export const OPEN_ASSIST_CHAT_EVENT = "open-assist-chat";

export function openAssistChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_ASSIST_CHAT_EVENT));
}
