import { describe, expect, it } from "vitest";

import resumeData from "./resume.json";
import { parseResume, resumeSchema } from "./resume.schema";

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
  });

  it("rejects invalid resume data", () => {
    expect(() => resumeSchema.parse({ hero: {} })).toThrow();
  });
});
