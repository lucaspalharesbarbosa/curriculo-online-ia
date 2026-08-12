"use client";

import { Certifications } from "@/components/Certifications";
import { EducationSection } from "@/components/EducationSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileHero } from "@/components/MobileHero";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Recognitions } from "@/components/Recognitions";
import { ResumeSidebar } from "@/components/ResumeSidebar";
import { SummarySection } from "@/components/SummarySection";
import { resume } from "@/content/resume";

export default function Home() {
  return (
    <div className="gradient-bg relative min-h-[100dvh] overflow-x-hidden">
      {/* Crédito visual: layout adaptado de giasinguyen/personal-resume (MIT) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden max-lg:hidden">
        <div className="orb-drift absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="animate-pulse-slow absolute top-3/4 -right-20 h-80 w-80 rounded-full bg-accent-600/10 blur-3xl" />
        <div className="orb-drift-delayed absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-accent-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1800px] flex-col lg:flex-row">
        <MobileHero
          hero={resume.hero}
          contact={resume.contact}
          skills={resume.skills}
        />

        <ResumeSidebar
          hero={resume.hero}
          contact={resume.contact}
          skills={resume.skills}
        />

        <main className="flex-1 p-3 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:p-4 lg:p-8 lg:pb-8">
          <div className="space-y-4 sm:space-y-6">
            <SummarySection
              name={resume.hero.name}
              title={resume.hero.title}
              about={resume.about}
            />
            <ExperienceSection experiences={resume.experiences} />
            <EducationSection items={resume.education} />
            <Certifications items={resume.certifications} />
            <Recognitions items={resume.recognitions} />
            <ProjectsSection
              projects={resume.projects}
              articles={resume.articles}
            />
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
