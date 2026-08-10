import { SectionsLayoutPrototype } from "@/components/prototypes/SectionsLayoutPrototype";
import { resume } from "@/content/resume";

export const metadata = {
  title: "Protótipo — marcadores PRAD/Mérito (US-07-13)",
  robots: { index: false, follow: false },
};

export default function SecoesLayoutPrototypePage() {
  return (
    <SectionsLayoutPrototype
      education={resume.education}
      certifications={resume.certifications}
    />
  );
}
