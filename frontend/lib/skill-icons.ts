import {
  Blocks,
  BookOpen,
  Bot,
  Boxes,
  Code2,
  Database,
  type LucideIcon,
  FileCode2,
  Kanban,
  Layers,
  LayoutGrid,
  MessageSquare,
  Puzzle,
  RefreshCw,
  Webhook,
  Workflow,
} from "lucide-react";
import { DiAws, DiCss3, DiJava, DiMsqlServer } from "react-icons/di";
import {
  SiAngular,
  SiApachekafka,
  SiDatadog,
  SiDocker,
  SiGit,
  SiGitlab,
  SiGooglecloud,
  SiGrafana,
  SiHtml5,
  SiJavascript,
  SiPostgresql,
  SiPython,
  SiRabbitmq,
  SiReact,
  SiRedis,
  SiSplunk,
  SiSpringboot,
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";
import type { IconType } from "react-icons";

/**
 * Ícone por habilidade técnica (item de `skills[].items`). Prioriza o logo da
 * marca (Simple Icons/Devicons/Tabler via `react-icons`); quando a tecnologia
 * não tem logo oficial (padrões de arquitetura, metodologias), cai num ícone
 * genérico coerente do `lucide-react` já usado no resto do site.
 */
const SKILL_ICON_MAP: Record<string, IconType | LucideIcon> = {
  // AI Engineering
  "AI Engineering": Bot,
  "Agentic AI": Workflow,
  "Context Engineering": BookOpen,
  "Prompt Engineering": MessageSquare,
  "Spec-Driven Development (SDD)": FileCode2,
  // Backend
  Java: DiJava,
  "Spring Boot": SiSpringboot,
  Python: SiPython,
  "C#": TbBrandCSharp,
  // Frontend
  Angular: SiAngular,
  React: SiReact,
  JavaScript: SiJavascript,
  HTML5: SiHtml5,
  CSS3: DiCss3,
  // Cloud
  AWS: DiAws,
  GCP: SiGooglecloud,
  // Mensageria
  "Apache Kafka": SiApachekafka,
  RabbitMQ: SiRabbitmq,
  "AWS SQS": DiAws,
  "AWS SNS": DiAws,
  // DevOps & CI/CD
  Docker: SiDocker,
  Git: SiGit,
  GitLab: SiGitlab,
  "CI/CD": Workflow,
  // Arquitetura & Padrões
  Microsserviços: Boxes,
  "APIs REST": Webhook,
  BFF: Layers,
  "Clean Architecture": LayoutGrid,
  SOLID: Blocks,
  "Design Patterns": Puzzle,
  // Banco de Dados (SQL)
  "SQL Server": DiMsqlServer,
  PostgreSQL: SiPostgresql,
  // Banco de Dados (NoSQL)
  Redis: SiRedis,
  DynamoDB: Database,
  // Observabilidade
  Splunk: SiSplunk,
  Grafana: SiGrafana,
  DataDog: SiDatadog,
  // Metodologias
  Scrum: RefreshCw,
  Kanban: Kanban,
};

export function getSkillIcon(skill: string): IconType | LucideIcon {
  return SKILL_ICON_MAP[skill] ?? Code2;
}
