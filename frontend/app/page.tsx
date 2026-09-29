import { resume } from "@/content/resume";
import { currentMonthIndex } from "@/lib/period";
import { AskAssistantButton } from "@/modules/chat/components/AskAssistantButton";
import { ChatAside } from "@/modules/chat/components/ChatAside";
import { AboutSection } from "@/modules/resume/components/AboutSection";
import { CareerTimeline } from "@/modules/resume/components/CareerTimeline";
import { CredentialsSection } from "@/modules/resume/components/CredentialsSection";
import { Hero } from "@/modules/resume/components/Hero";
import { ProjectsSection } from "@/modules/resume/components/ProjectsSection";
import { SiteHeader } from "@/modules/resume/components/SiteHeader";
import { SkillsSection } from "@/modules/resume/components/SkillsSection";
import { careerStats, ganttAxis } from "@/modules/resume/lib/career";

export default function Home() {
  // Página estática: o mês de referência ("atual") é o do build.
  const refIndex = currentMonthIndex();
  const stats = careerStats(resume, refIndex);
  const axis = ganttAxis(resume, refIndex);
  const current = resume.experiences[0];

  return (
    <div className="min-h-[100dvh] bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader contact={resume.contact} />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] 2xl:grid-cols-[minmax(0,1fr)_30rem]">
        <main id="conteudo" className="min-w-0 pb-24 lg:pb-0">
          <Hero
            hero={resume.hero}
            contact={resume.contact}
            stats={stats}
            current={{ company: current.company, role: current.role }}
            askAction={<AskAssistantButton />}
          />
          <AboutSection about={resume.about} />
          <CareerTimeline experiences={resume.experiences} axis={axis} />
          <SkillsSection skills={resume.skills} />
          <ProjectsSection
            projects={resume.projects}
            articles={resume.articles}
          />
          <CredentialsSection
            education={resume.education}
            certifications={resume.certifications}
            recognitions={resume.recognitions}
          />
          <footer className="border-t border-border-subtle px-4 py-8 text-xs text-muted sm:px-8">
            {resume.hero.name} · {resume.hero.location}
          </footer>
        </main>
        <ChatAside />
      </div>
    </div>
  );
}
