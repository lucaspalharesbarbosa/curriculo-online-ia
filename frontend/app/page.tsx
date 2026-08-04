import { Certifications } from "@/components/Certifications";
import { ContactSection } from "@/components/Contact";
import { EducationSection } from "@/components/Education";
import { ExperienceSection } from "@/components/ExperienceCard";
import { Hero } from "@/components/Hero";
import { ProjectsSection } from "@/components/ProjectCard";
import { Skills } from "@/components/SkillBadge";
import { resume } from "@/content/resume";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-10 sm:px-6 sm:py-14">
      <Hero hero={resume.hero} about={resume.about} />
      <ExperienceSection experiences={resume.experiences} />
      <EducationSection items={resume.education} />
      <Skills groups={resume.skills} />
      <Certifications items={resume.certifications} />
      <ProjectsSection projects={resume.projects} />
      <ContactSection contact={resume.contact} />
    </main>
  );
}
