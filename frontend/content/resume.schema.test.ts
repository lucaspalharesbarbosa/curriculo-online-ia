import { describe, expect, it } from "vitest";

import resumeData from "./resume.json";
import { contactSchema, parseResume, resumeSchema } from "./resume.schema";

describe("resume.schema", () => {
  it("valida o resume.json versionado no repositório", () => {
    expect(() => parseResume(resumeData)).not.toThrow();
  });

  it("cobre todas as seções obrigatórias", () => {
    const resume = parseResume(resumeData);

    expect(resume.hero.name).toBeTruthy();
    expect(resume.about).toBeTruthy();
    expect(resume.experiences.length).toBeGreaterThan(0);
    expect(resume.education.length).toBeGreaterThan(0);
    expect(resume.skills.length).toBeGreaterThan(0);
    expect(Array.isArray(resume.certifications)).toBe(true);
    expect(Array.isArray(resume.recognitions)).toBe(true);
    expect(Array.isArray(resume.projects)).toBe(true);
    expect(resume.contact.linkedin).toMatch(/^https:\/\//);
    expect(resume.contact.whatsapp).toMatch(/^https:\/\/wa\.me\//);
  });

  it("rejeita dados de currículo inválidos", () => {
    expect(() => resumeSchema.parse({ hero: {} })).toThrow();
  });
});

describe("contactSchema", () => {
  const baseContact = {
    linkedin: "https://www.linkedin.com/in/lucas-palhares-barbosa/",
    email: null,
    github: null,
    resumePdfUrl: null,
  };

  it("aceita uma URL de whatsapp no formato wa.me", () => {
    expect(() =>
      contactSchema.parse({
        ...baseContact,
        whatsapp: "https://wa.me/5517991123547",
      }),
    ).not.toThrow();
  });

  it("aceita whatsapp nulo", () => {
    expect(() =>
      contactSchema.parse({ ...baseContact, whatsapp: null }),
    ).not.toThrow();
  });

  it("rejeita um valor de whatsapp que não é uma URL", () => {
    expect(() =>
      contactSchema.parse({ ...baseContact, whatsapp: "not-a-url" }),
    ).toThrow();
  });
});
