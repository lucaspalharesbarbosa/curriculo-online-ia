import { z } from "zod";

const publicAssetPathSchema = z
  .string()
  .regex(/^\/.+/, "Must be a root-relative public path");

export const heroSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  // null até o autor enviar a foto (US-07-03/T04b) — Hero.tsx usa um bloco
  // decorativo no lugar enquanto o campo estiver null
  photoUrl: z.union([z.string().url(), publicAssetPathSchema]).nullable(),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullable(),
  location: z.string().min(1),
  modality: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  technologies: z.array(z.string().min(1)).min(1),
  // null quando a empresa não tem logo disponível — ExperienceSection usa
  // um ícone decorativo no lugar (mesmo padrão do hero.photoUrl)
  logoUrl: z.union([z.string().url(), publicAssetPathSchema]).nullable(),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  // null quando a instituição não tem logo — EducationSection usa ícone decorativo
  logoUrl: z
    .union([z.string().url(), publicAssetPathSchema])
    .nullable()
    .default(null),
});

export const skillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issuedAt: z.string().min(1),
  expiresAt: z.string().nullable(),
  // null quando o certificado não tem badge/logo — Certifications usa ícone decorativo
  logoUrl: z
    .union([z.string().url(), publicAssetPathSchema])
    .nullable()
    .default(null),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string().min(1)).min(1),
  repositoryUrl: z.string().url(),
});

export const contactSchema = z.object({
  linkedin: z.string().url(),
  email: z.string().email().nullable(),
  github: z.string().url().nullable(),
  whatsapp: z.string().url().nullable(),
  resumePdfUrl: z.union([z.string().url(), publicAssetPathSchema]).nullable(),
});

export const resumeSchema = z.object({
  hero: heroSchema,
  about: z.string().min(1),
  experiences: z.array(experienceSchema).min(1),
  education: z.array(educationSchema).min(1),
  skills: z.array(skillGroupSchema).min(1),
  certifications: z.array(certificationSchema),
  projects: z.array(projectSchema),
  contact: contactSchema,
});

export type Hero = z.infer<typeof heroSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Resume = z.infer<typeof resumeSchema>;

export function parseResume(data: unknown): Resume {
  return resumeSchema.parse(data);
}
