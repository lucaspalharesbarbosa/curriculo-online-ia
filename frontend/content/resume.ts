import resumeData from "./resume.json";
import { parseResume, type Resume } from "./resume.schema";

export const resume: Resume = parseResume(resumeData);
