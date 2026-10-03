"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BadgeCheck,
  Briefcase,
  ChevronDown,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  HandHeart,
  Languages,
  LayoutList,
  ListPlus,
  MoreVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createId } from "@/lib/resume/ids";
import type { BuiltInSectionKey, ResumeContent, SectionKey } from "@/lib/resume/schema";
import { customKey, isCustomKey, normalizeSectionOrder, sectionTitle } from "@/lib/resume/sections";
import { cn } from "@/lib/utils";

import { moveItem, useEditor } from "./EditorContext";
import {
  AchievementsEditor,
  CertificationsEditor,
  CustomSectionEditor,
  EducationEditor,
  ExperienceEditor,
  LanguagesEditor,
  PersonalInfoEditor,
  ProjectsEditor,
  SkillsEditor,
  SummaryEditor,
  VolunteerEditor,
} from "./SectionEditors";
import { SortableList } from "./SortableList";

const ICONS: Record<BuiltInSectionKey | "personal", LucideIcon> = {
  personal: User,
  summary: Sparkles,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderGit2,
  certifications: BadgeCheck,
  achievements: Award,
  languages: Languages,
  volunteer: HandHeart,
};

const EDITORS: Record<BuiltInSectionKey, () => ReactNode> = {
  summary: () => <SummaryEditor />,
  experience: () => <ExperienceEditor />,
  education: () => <EducationEditor />,
  skills: () => <SkillsEditor />,
  projects: () => <ProjectsEditor />,
  certifications: () => <CertificationsEditor />,
  achievements: () => <AchievementsEditor />,
  languages: () => <LanguagesEditor />,
  volunteer: () => <VolunteerEditor />,
};

function count(content: ResumeContent, key: SectionKey): number | null {
  if (isCustomKey(key)) return content.customSections.find((s) => customKey(s.id) === key)?.entries.length ?? 0;
  switch (key) {
    case "summary":
      return null;
    case "volunteer":
      return content.volunteerExperience.length;
    default:
      return content[key].length;
  }
}

function sectionHasErrors(errors: Record<string, string>, key: SectionKey | "personal", content: ResumeContent) {
  const prefixes: Record<string, string> = {
    personal: "personalInfo",
    volunteer: "volunteerExperience",
  };
  if (key !== "personal" && isCustomKey(key)) {
    const index = content.customSections.findIndex((s) => customKey(s.id) === key);
    return Object.keys(errors).some((k) => k.startsWith(`customSections.${index}.`));
  }
  const prefix = prefixes[key] ?? key;
  return Object.keys(errors).some((k) => k === prefix || k.startsWith(`${prefix}.`));
}

function Panel({
  id,
  title,
  icon: Icon,
  meta,
  open,
  onToggle,
  hidden,
  hasError,
  actions,
  handle,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  meta?: string | null;
  open: boolean;
  onToggle: () => void;
  hidden?: boolean;
  hasError?: boolean;
  actions?: ReactNode;
  handle?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("rounded-lg border bg-card transition-colors", hasError ? "border-destructive/50" : "border-border")}
    >
      <div className="flex items-center gap-1 p-1.5">
        {handle}
        <button
          type="button"
          id={`${id}-title`}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={onToggle}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-md px-2 text-left hover:bg-muted/60"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-brand">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate font-medium", hidden && "text-muted-foreground line-through decoration-1")}>
              {title}
            </span>
            {meta || hidden || hasError ? (
              <span className={cn("block text-xs", hasError ? "text-destructive" : "text-muted-foreground")}>
                {hasError ? "Needs attention" : hidden ? "Hidden from resume" : meta}
              </span>
            ) : null}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        {actions}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-body`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

/** Left editor column: personal info + every resume section, reorderable. */
export function SectionsPanel({ photoSupported, initialOpen = "personal" }: { photoSupported: boolean; initialOpen?: string }) {
  const { content, update, errors } = useEditor();
  const [open, setOpen] = useState<string | null>(initialOpen);
  const order = normalizeSectionOrder(content.sectionOrder, content.customSections);
  const hidden = new Set(content.hiddenSections);

  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  const setOrder = (next: SectionKey[]) => update((c) => ({ ...c, sectionOrder: next }));
  const toggleHidden = (key: SectionKey) =>
    update((c) => ({
      ...c,
      hiddenSections: c.hiddenSections.includes(key) ? c.hiddenSections.filter((k) => k !== key) : [...c.hiddenSections, key],
    }));

  const addCustom = () => {
    if (content.customSections.length >= 10) {
      toast.error("You can add up to 10 custom sections.");
      return;
    }
    const id = createId();
    update((c) => ({
      ...c,
      customSections: [...c.customSections, { id, title: "New section", entries: [] }],
      sectionOrder: [...normalizeSectionOrder(c.sectionOrder, c.customSections), customKey(id)],
    }));
    setOpen(customKey(id));
  };

  const deleteCustom = (key: SectionKey) => {
    const id = key.slice("custom:".length);
    const removed = content.customSections.find((s) => s.id === id);
    const previous = { customSections: content.customSections, sectionOrder: content.sectionOrder, hiddenSections: content.hiddenSections };
    update((c) => ({
      ...c,
      customSections: c.customSections.filter((s) => s.id !== id),
      sectionOrder: c.sectionOrder.filter((k) => k !== key),
      hiddenSections: c.hiddenSections.filter((k) => k !== key),
    }));
    toast(`“${removed?.title ?? "Section"}” deleted`, {
      action: { label: "Undo", onClick: () => update((c) => ({ ...c, ...previous })) },
    });
  };

  const items = order.map((key) => ({ id: key, key }));

  return (
    <div className="space-y-2">
      <Panel
        id="personal"
        title="Personal information"
        icon={ICONS.personal}
        meta={content.personalInfo.fullName || "Name, contact details and links"}
        open={open === "personal"}
        onToggle={() => toggle("personal")}
        hasError={sectionHasErrors(errors, "personal", content)}
      >
        <PersonalInfoEditor photoSupported={photoSupported} />
      </Panel>

      <SortableList
        label="sections"
        items={items}
        onReorder={(from, to) => setOrder(moveItem(order, from, to))}
        renderItem={({ key }, index, handle) => {
          const custom = isCustomKey(key);
          const n = count(content, key);
          return (
            <Panel
              id={key.replace(":", "-")}
              title={sectionTitle(key, content.customSections)}
              icon={custom ? LayoutList : ICONS[key as BuiltInSectionKey]}
              meta={n === null ? (content.summary ? "Written" : "Not started") : n === 0 ? "No entries yet" : `${n} ${n === 1 ? "entry" : "entries"}`}
              open={open === key}
              onToggle={() => toggle(key)}
              hidden={hidden.has(key)}
              hasError={sectionHasErrors(errors, key, content)}
              handle={handle}
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-10" aria-label={`Options for ${sectionTitle(key, content.customSections)}`}>
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem disabled={index === 0} onSelect={() => setOrder(moveItem(order, index, index - 1))}>
                      <ArrowUp /> Move section up
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={index === order.length - 1} onSelect={() => setOrder(moveItem(order, index, index + 1))}>
                      <ArrowDown /> Move section down
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => toggleHidden(key)}>
                      {hidden.has(key) ? <Eye /> : <EyeOff />} {hidden.has(key) ? "Show on resume" : "Hide from resume"}
                    </DropdownMenuItem>
                    {custom ? (
                      <>
                        <DropdownMenuItem onSelect={() => setOpen(key)}>
                          <Pencil /> Rename section
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => deleteCustom(key)}>
                          <Trash2 /> Delete section
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              {custom ? <CustomSectionEditor sectionId={key.slice("custom:".length)} /> : EDITORS[key as BuiltInSectionKey]()}
            </Panel>
          );
        }}
      />

      <Button type="button" variant="ghost" className="h-12 w-full justify-start gap-3 px-3 text-brand" onClick={addCustom}>
        <span className="flex size-8 items-center justify-center rounded-md border border-dashed border-brand/40">
          <ListPlus className="size-4" aria-hidden="true" />
        </span>
        Add custom section
        <Plus className="ml-auto size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
