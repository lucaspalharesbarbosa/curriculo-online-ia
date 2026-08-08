import { SectionsLayoutPrototype } from "@/components/prototypes/SectionsLayoutPrototype";
import { resume } from "@/content/resume";

export const metadata = {
  title: "Protótipo — seções Experiência / Educação / Certificações",
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
