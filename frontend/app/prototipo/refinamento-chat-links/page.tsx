import { RefinamentoChatLinksPrototype } from "@/components/prototypes/RefinamentoChatLinksPrototype";
import { resume } from "@/content/resume";

export const metadata = {
  title: "Protótipo — cabeçalho do chat mobile e botões de link",
  robots: { index: false, follow: false },
};

export default function RefinamentoChatLinksPrototypePage() {
  const education = resume.education.find((item) => item.websiteUrl);
  const certification = resume.certifications.find(
    (item): item is typeof item & { credentialUrl: string } =>
      Boolean(item.credentialUrl),
  );
  const project = resume.projects[0];

  return (
    <RefinamentoChatLinksPrototype
      education={education}
      certification={certification}
      project={project}
    />
  );
}
