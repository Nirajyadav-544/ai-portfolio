import { Bot, Boxes, Cloud, Code2, Coffee, Container, Cpu, Database, GitBranch, Layers, Leaf, Palette, Server, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SkillCategory } from "../types";

const byKey: Record<string, LucideIcon> = {
  react: Layers, code: Code2, palette: Palette, coffee: Coffee, leaf: Leaf, database: Database,
  sparkles: Sparkles, container: Container, git: GitBranch, cloud: Cloud, server: Server, bot: Bot, cpu: Cpu,
};
const byCategory: Record<SkillCategory, LucideIcon> = {
  FRONTEND: Layers, BACKEND: Server, DATABASE: Database, AI: Sparkles, CLOUD: Cloud, TOOLS: Wrench,
};

export function SkillIcon({ icon, category, className }: { icon: string | null; category: SkillCategory; className?: string }) {
  const I = (icon && byKey[icon]) || byCategory[category] || Boxes;
  return <I className={className ?? "h-5 w-5"} aria-hidden />;
}
