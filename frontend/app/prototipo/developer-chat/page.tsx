import { redirect } from "next/navigation";

export const metadata = {
  title: "Protótipo — chat RAG do site",
  robots: { index: false, follow: false },
};

/** Rota antiga — redireciona para a família de protótipos de chat RAG. */
export default function DeveloperChatPrototypePage() {
  redirect("/prototipo/chat-rag");
}
