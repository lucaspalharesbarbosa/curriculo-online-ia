"use client";

import { motion } from "framer-motion";

import { Certifications } from "@/components/Certifications";
import { EducationSection } from "@/components/EducationSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ResumeSidebar } from "@/components/ResumeSidebar";
import { SummarySection } from "@/components/SummarySection";
import { resume } from "@/content/resume";

export default function Home() {
  return (
    <div className="gradient-bg relative min-h-screen overflow-hidden">
      {/* Crédito visual: layout adaptado de giasinguyen/personal-resume (MIT) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 h-96 w-96 animate-pulse-slow rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-3/4 -right-20 h-80 w-80 animate-pulse-slow rounded-full bg-accent-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-accent-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(234,179,8,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(234,179,8,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1800px] flex-col lg:flex-row">
        <ResumeSidebar
          hero={resume.hero}
          contact={resume.contact}
          skills={resume.skills}
        />

        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <SummarySection
              name={resume.hero.name}
              title={resume.hero.title}
              about={resume.about}
            />
            <ExperienceSection experiences={resume.experiences} />
            <EducationSection items={resume.education} />
            <Certifications items={resume.certifications} />
            <ProjectsSection projects={resume.projects} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
