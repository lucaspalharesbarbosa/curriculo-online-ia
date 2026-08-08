import { RagChatMorphPrototype } from "@/components/prototypes/RagChatMorphPrototype";
import { resume } from "@/content/resume";

export const metadata = {
  title: "Protótipo — chat RAG do site",
  robots: { index: false, follow: false },
};

export default function ChatRagPrototypePage() {
  return (
    <RagChatMorphPrototype name={resume.hero.name} role={resume.hero.title} />
  );
}
