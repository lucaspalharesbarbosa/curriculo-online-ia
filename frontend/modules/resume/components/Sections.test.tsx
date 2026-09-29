import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { resume } from "@/content/resume";
import { ymToIndex } from "@/lib/period";

import { ganttAxis } from "../lib/career";
import { AboutSection } from "./AboutSection";
import { CareerTimeline } from "./CareerTimeline";
import { CredentialsSection } from "./CredentialsSection";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";

afterEach(cleanup);

describe("CareerTimeline", () => {
  const axis = ganttAxis(resume, ymToIndex("2026-09"));

  it("abre só o cargo mais recente e alterna com aria-expanded", () => {
    render(<CareerTimeline experiences={resume.experiences} axis={axis} />);

    const buttons = screen.getAllByRole("button", { name: /·|→/ });
    expect(buttons).toHaveLength(resume.experiences.length);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText(resume.experiences[0].highlights[0]),
    ).toBeInTheDocument();

    fireEvent.click(buttons[1]);

    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("recolhe o cargo aberto ao clicar de novo", () => {
    render(<CareerTimeline experiences={resume.experiences} axis={axis} />);
    const first = screen.getAllByRole("button", { name: /→/ })[0];

    fireEvent.click(first);

    expect(first).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SkillsSection", () => {
  it("lista cada grupo com o nível acessível de cada habilidade", () => {
    render(<SkillsSection skills={resume.skills} />);

    for (const group of resume.skills) {
      expect(
        screen.getByRole("heading", { level: 3, name: group.category }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByRole("img", { name: /nível \d de 5/ }).length).toBe(
      resume.skills.reduce((n, g) => n + g.items.length, 0),
    );
  });
});

describe("ProjectsSection", () => {
  it("mostra projetos com repositório e artigos com link", () => {
    render(
      <ProjectsSection projects={resume.projects} articles={resume.articles} />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: resume.projects[0].title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /repositório/i })).toHaveAttribute(
      "href",
      resume.projects[0].repositoryUrl,
    );
    expect(
      screen.getByRole("link", { name: resume.articles[0].title }),
    ).toHaveAttribute("href", resume.articles[0].url);
  });
});

describe("AboutSection", () => {
  it("divide o texto em parágrafos", () => {
    render(<AboutSection about={"Primeiro.\nSegundo."} />);

    expect(screen.getByText("Primeiro.")).toBeInTheDocument();
    expect(screen.getByText("Segundo.")).toBeInTheDocument();
  });
});

describe("CredentialsSection", () => {
  it("mostra formação, reconhecimentos e só algumas certificações até expandir", () => {
    render(
      <CredentialsSection
        education={resume.education}
        certifications={resume.certifications}
        recognitions={resume.recognitions}
      />,
    );
    const certCard = screen
      .getByRole("heading", { level: 3, name: /^certificações \(/i })
      .closest("div") as HTMLElement;

    expect(within(certCard).getAllByRole("listitem")).toHaveLength(4);

    fireEvent.click(
      screen.getByRole("button", {
        name: `Ver todas as ${resume.certifications.length}`,
      }),
    );

    expect(within(certCard).getAllByRole("listitem")).toHaveLength(
      resume.certifications.length,
    );
    expect(
      screen.getByRole("button", { name: "Mostrar menos" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getAllByText(resume.recognitions[0].title).length,
    ).toBeGreaterThan(0);
  });
});
