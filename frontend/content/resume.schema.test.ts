import { describe, expect, it } from "vitest";

import resumeData from "./resume.json";
import { contactSchema, parseResume, resumeSchema } from "./resume.schema";

describe("resume.schema", () => {
  it("validates the committed resume.json", () => {
    expect(() => parseResume(resumeData)).not.toThrow();
  });

  it("covers all required sections", () => {
    const resume = parseResume(resumeData);

    expect(resume.hero.name).toBeTruthy();
    expect(resume.about).toBeTruthy();
    expect(resume.experiences.length).toBeGreaterThan(0);
    expect(resume.education.length).toBeGreaterThan(0);
    expect(resume.skills.length).toBeGreaterThan(0);
    expect(Array.isArray(resume.certifications)).toBe(true);
    expect(Array.isArray(resume.projects)).toBe(true);
    expect(resume.contact.linkedin).toMatch(/^https:\/\//);
    expect(resume.contact.whatsapp).toMatch(/^https:\/\/wa\.me\//);
  });

  it("rejects invalid resume data", () => {
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

  it("accepts a whatsapp wa.me URL", () => {
    expect(() =>
      contactSchema.parse({
        ...baseContact,
        whatsapp: "https://wa.me/5517991123547",
      }),
    ).not.toThrow();
  });

  it("accepts whatsapp as null", () => {
    expect(() =>
      contactSchema.parse({ ...baseContact, whatsapp: null }),
    ).not.toThrow();
  });

  it("rejects a non-URL whatsapp value", () => {
    expect(() =>
      contactSchema.parse({ ...baseContact, whatsapp: "not-a-url" }),
    ).toThrow();
  });
});
