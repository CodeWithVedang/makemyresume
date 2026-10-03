"use client";

/* eslint-disable @next/next/no-img-element -- local data URL preview */
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { Field } from "@/components/forms/Field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newEntry } from "@/lib/resume/defaults";
import { formatRange } from "@/lib/resume/dates";
import { createId } from "@/lib/resume/ids";
import { employmentTypeLabels, employmentTypes, type EmploymentType } from "@/lib/resume/schema";

import { moveItem, useEditor } from "./EditorContext";
import { EntryCard } from "./EntryCard";
import { DESCRIPTION_HINT, FieldGrid, MonthInput, TextArea, TextInput } from "./fields";
import { ListEditor } from "./ListEditor";
import { resizeImage } from "./resize-image";
import { SortableList } from "./SortableList";

// --- Personal information ---------------------------------------------------

export function PersonalInfoEditor({ photoSupported }: { photoSupported: boolean }) {
  const { content, update, errors } = useEditor();
  const p = content.personalInfo;
  const set = (patch: Partial<typeof p>) =>
    update((c) => ({ ...c, personalInfo: { ...c.personalInfo, ...patch } }));
  const err = (field: string) => errors[`personalInfo.${field}`];
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Choose an image smaller than 8 MB.");
      return;
    }
    try {
      set({ photo: await resizeImage(file, 320) });
    } catch {
      toast.error("We couldn't read that image. Try another file.");
    }
  };

  return (
    <div className="space-y-4">
      <FieldGrid>
        <TextInput label="Full name" value={p.fullName} onChange={(v) => set({ fullName: v })} error={err("fullName")} autoComplete="name" />
        <TextInput
          label="Professional title"
          value={p.professionalTitle}
          onChange={(v) => set({ professionalTitle: v })}
          error={err("professionalTitle")}
          placeholder="e.g. Frontend Developer"
        />
        <TextInput label="Email" type="email" inputMode="email" value={p.email} onChange={(v) => set({ email: v })} error={err("email")} autoComplete="email" />
        <TextInput label="Phone" type="tel" inputMode="tel" value={p.phone} onChange={(v) => set({ phone: v })} error={err("phone")} autoComplete="tel" optional />
        <TextInput label="Location" value={p.location} onChange={(v) => set({ location: v })} error={err("location")} placeholder="City, Country" optional />
        <TextInput label="Website" value={p.website} onChange={(v) => set({ website: v })} error={err("website")} inputMode="url" optional />
        <TextInput label="LinkedIn" value={p.linkedin} onChange={(v) => set({ linkedin: v })} error={err("linkedin")} placeholder="linkedin.com/in/…" inputMode="url" optional />
        <TextInput label="GitHub" value={p.github} onChange={(v) => set({ github: v })} error={err("github")} placeholder="github.com/…" inputMode="url" optional />
        <TextInput label="Portfolio" value={p.portfolio} onChange={(v) => set({ portfolio: v })} error={err("portfolio")} inputMode="url" optional />
      </FieldGrid>

      <div className="space-y-2">
        <p className="text-sm font-medium">Other links</p>
        {p.otherLinks.map((link, i) => (
          <div key={link.id} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto] items-start gap-2">
            <Input
              aria-label="Link label"
              placeholder="Label"
              value={link.label}
              maxLength={40}
              className="h-11 sm:h-10"
              onChange={(e) => set({ otherLinks: p.otherLinks.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)) })}
            />
            <div>
              <Input
                aria-label="Link URL"
                placeholder="https://"
                value={link.url}
                inputMode="url"
                aria-invalid={err(`otherLinks.${i}.url`) ? true : undefined}
                className="h-11 sm:h-10"
                onChange={(e) => set({ otherLinks: p.otherLinks.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)) })}
              />
              {err(`otherLinks.${i}.url`) ? (
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {err(`otherLinks.${i}.url`)}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 sm:size-10"
              aria-label="Remove link"
              onClick={() => set({ otherLinks: p.otherLinks.filter((_, j) => j !== i) })}
            >
              <X />
            </Button>
          </div>
        ))}
        {p.otherLinks.length < 5 ? (
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-2 text-brand"
            onClick={() => set({ otherLinks: [...p.otherLinks, { id: createId(), label: "", url: "" }] })}
          >
            <Plus /> Add link
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center gap-3">
          {p.photo ? (
            <img src={p.photo} alt="Your profile photo" className="size-14 rounded-full object-cover" />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ImagePlus className="size-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Profile photo (optional)</p>
            <p className="text-xs text-muted-foreground">
              {photoSupported
                ? "Shown by this template. Many employers prefer resumes without photos."
                : "This template doesn't show photos, which keeps it ATS friendly."}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              void onPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" className="h-10" onClick={() => fileRef.current?.click()}>
            {p.photo ? "Replace Photo" : "Add Photo"}
          </Button>
          {p.photo ? (
            <Button type="button" variant="ghost" className="h-10" onClick={() => set({ photo: null })}>
              <Trash2 /> Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// --- Summary ----------------------------------------------------------------

export function SummaryEditor() {
  const { content, update, errors } = useEditor();
  return (
    <TextArea
      label="Professional summary"
      value={content.summary}
      maxLength={3000}
      rows={6}
      onChange={(v) => update((c) => ({ ...c, summary: v }))}
      error={errors.summary}
      hint="Keep this concise and focused on your professional background."
    />
  );
}

// --- List sections ------------------------------------------------------------

function DateRange({
  start,
  end,
  onStart,
  onEnd,
  endError,
  current,
  onCurrent,
  currentLabel = "I currently work here",
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  endError?: string;
  current?: boolean;
  onCurrent?: (v: boolean) => void;
  currentLabel?: string;
}) {
  const currentId = useId();
  return (
    <div className="space-y-3">
      <FieldGrid>
        <MonthInput label="Start date" value={start} onChange={onStart} />
        <MonthInput label="End date" value={current ? "" : end} onChange={onEnd} error={endError} disabled={current} />
      </FieldGrid>
      {onCurrent ? (
        <div className="flex items-center gap-2.5">
          <Checkbox id={currentId} checked={current} onCheckedChange={(v) => onCurrent(v === true)} className="size-5" />
          <Label htmlFor={currentId} className="text-sm font-normal">
            {currentLabel}
          </Label>
        </div>
      ) : null}
    </div>
  );
}

export function ExperienceEditor() {
  const { content } = useEditor();
  const fmt = content.settings.dateFormat;
  return (
    <ListEditor
      listKey="experience"
      itemLabel="Experience"
      emptyText="Add the roles you want employers to see, most recent first."
      create={newEntry.experience}
      summarize={(e) => ({
        title: e.jobTitle,
        subtitle: [e.company, formatRange(e.startDate, e.endDate, fmt, e.current)].filter(Boolean).join(" · "),
      })}
      renderFields={({ item, set, error }) => (
        <>
          <FieldGrid>
            <TextInput label="Job title" value={item.jobTitle} onChange={(v) => set({ jobTitle: v })} error={error("jobTitle")} />
            <TextInput label="Company" value={item.company} onChange={(v) => set({ company: v })} error={error("company")} />
            <TextInput label="Location" value={item.location} onChange={(v) => set({ location: v })} optional />
            <Field label="Employment type">
              {(p) => (
                <select
                  {...p}
                  value={item.employmentType}
                  onChange={(e) => set({ employmentType: e.target.value as EmploymentType })}
                  className="h-11 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:h-10 dark:bg-input/30"
                >
                  {employmentTypes.map((t) => (
                    <option key={t} value={t}>
                      {employmentTypeLabels[t]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </FieldGrid>
          <DateRange
            start={item.startDate}
            end={item.endDate}
            current={item.current}
            onStart={(v) => set({ startDate: v })}
            onEnd={(v) => set({ endDate: v })}
            onCurrent={(v) => set({ current: v, endDate: v ? "" : item.endDate })}
            endError={error("endDate")}
          />
          <TextArea
            label="Description and responsibilities"
            value={item.description}
            onChange={(v) => set({ description: v })}
            error={error("description")}
            hint={DESCRIPTION_HINT}
            maxLength={5000}
          />
        </>
      )}
    />
  );
}

export function EducationEditor() {
  const { content } = useEditor();
  const fmt = content.settings.dateFormat;
  return (
    <ListEditor
      listKey="education"
      itemLabel="Education"
      emptyText="Add degrees, diplomas or relevant courses."
      create={newEntry.education}
      summarize={(e) => ({
        title: e.institution || e.degree,
        subtitle: [e.degree && e.institution ? e.degree : "", formatRange(e.startDate, e.endDate, fmt)].filter(Boolean).join(" · "),
      })}
      renderFields={({ item, set, error }) => (
        <>
          <FieldGrid>
            <TextInput label="Institution" value={item.institution} onChange={(v) => set({ institution: v })} error={error("institution")} />
            <TextInput label="Degree" value={item.degree} onChange={(v) => set({ degree: v })} placeholder="e.g. BSc" />
            <TextInput label="Field of study" value={item.fieldOfStudy} onChange={(v) => set({ fieldOfStudy: v })} optional />
            <TextInput label="Location" value={item.location} onChange={(v) => set({ location: v })} optional />
            <TextInput label="Grade" value={item.grade} onChange={(v) => set({ grade: v })} optional placeholder="e.g. 3.8 GPA" />
          </FieldGrid>
          <DateRange
            start={item.startDate}
            end={item.endDate}
            onStart={(v) => set({ startDate: v })}
            onEnd={(v) => set({ endDate: v })}
            endError={error("endDate")}
          />
          <TextArea label="Description" value={item.description} onChange={(v) => set({ description: v })} hint={DESCRIPTION_HINT} optional rows={3} />
        </>
      )}
    />
  );
}

function TechnologiesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !value.includes(s));
    if (parts.length) onChange([...value, ...parts].slice(0, 30));
    setDraft("");
  };
  return (
    <Field label="Technologies" optional hint="Press Enter or comma to add.">
      {(p) => (
        <div className="space-y-2">
          {value.length ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
              {value.map((t) => (
                <li key={t} className="flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-2.5 text-sm text-secondary-foreground">
                  {t}
                  <button
                    type="button"
                    className="flex size-6 items-center justify-center rounded-full hover:bg-background"
                    aria-label={`Remove ${t}`}
                    onClick={() => onChange(value.filter((v) => v !== t))}
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <Input
            {...p}
            value={draft}
            maxLength={40}
            className="h-11 sm:h-10"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
          />
        </div>
      )}
    </Field>
  );
}

export function ProjectsEditor() {
  return (
    <ListEditor
      listKey="projects"
      itemLabel="Project"
      emptyText="Add personal, academic or professional projects."
      create={newEntry.projects}
      summarize={(p) => ({ title: p.name, subtitle: p.role })}
      renderFields={({ item, set, error }) => (
        <>
          <FieldGrid>
            <TextInput label="Project name" value={item.name} onChange={(v) => set({ name: v })} error={error("name")} />
            <TextInput label="Your role" value={item.role} onChange={(v) => set({ role: v })} optional />
            <TextInput label="Project URL" value={item.url} onChange={(v) => set({ url: v })} error={error("url")} inputMode="url" optional />
            <TextInput label="GitHub URL" value={item.githubUrl} onChange={(v) => set({ githubUrl: v })} error={error("githubUrl")} inputMode="url" optional />
          </FieldGrid>
          <DateRange
            start={item.startDate}
            end={item.endDate}
            onStart={(v) => set({ startDate: v })}
            onEnd={(v) => set({ endDate: v })}
            endError={error("endDate")}
          />
          <TechnologiesInput value={item.technologies} onChange={(v) => set({ technologies: v })} />
          <TextArea label="Description" value={item.description} onChange={(v) => set({ description: v })} hint={DESCRIPTION_HINT} rows={4} />
        </>
      )}
    />
  );
}

export function CertificationsEditor() {
  return (
    <ListEditor
      listKey="certifications"
      itemLabel="Certification"
      emptyText="Add licenses and certifications you hold."
      create={newEntry.certifications}
      summarize={(c) => ({ title: c.name, subtitle: c.issuer })}
      renderFields={({ item, set, error }) => (
        <>
          <FieldGrid>
            <TextInput label="Certification name" value={item.name} onChange={(v) => set({ name: v })} />
            <TextInput label="Issuer" value={item.issuer} onChange={(v) => set({ issuer: v })} />
            <MonthInput label="Issue date" value={item.issueDate} onChange={(v) => set({ issueDate: v })} />
            <MonthInput label="Expiry date" value={item.expiryDate} onChange={(v) => set({ expiryDate: v })} error={error("expiryDate")} />
            <TextInput label="Credential ID" value={item.credentialId} onChange={(v) => set({ credentialId: v })} optional />
            <TextInput label="Credential URL" value={item.credentialUrl} onChange={(v) => set({ credentialUrl: v })} error={error("credentialUrl")} inputMode="url" optional />
          </FieldGrid>
        </>
      )}
    />
  );
}

export function AchievementsEditor() {
  return (
    <ListEditor
      listKey="achievements"
      itemLabel="Achievement"
      emptyText="Add awards, recognitions or milestones."
      create={newEntry.achievements}
      summarize={(a) => ({ title: a.title })}
      renderFields={({ item, set }) => (
        <>
          <FieldGrid>
            <TextInput label="Title" value={item.title} onChange={(v) => set({ title: v })} />
            <MonthInput label="Date" value={item.date} onChange={(v) => set({ date: v })} />
          </FieldGrid>
          <TextArea label="Description" value={item.description} onChange={(v) => set({ description: v })} rows={3} optional />
        </>
      )}
    />
  );
}

export function LanguagesEditor() {
  return (
    <ListEditor
      listKey="languages"
      itemLabel="Language"
      emptyText="Add languages you speak."
      create={newEntry.languages}
      summarize={(l) => ({ title: l.name, subtitle: l.proficiency })}
      renderFields={({ item, set }) => (
        <FieldGrid>
          <TextInput label="Language" value={item.name} onChange={(v) => set({ name: v })} />
          <TextInput
            label="Proficiency"
            value={item.proficiency}
            onChange={(v) => set({ proficiency: v })}
            list="language-levels"
            placeholder="e.g. Fluent"
          />
          <datalist id="language-levels">
            {["Native", "Fluent", "Professional working", "Intermediate", "Basic"].map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </FieldGrid>
      )}
    />
  );
}

export function VolunteerEditor() {
  const { content } = useEditor();
  const fmt = content.settings.dateFormat;
  return (
    <ListEditor
      listKey="volunteerExperience"
      itemLabel="Volunteer role"
      emptyText="Add volunteering or community work."
      create={newEntry.volunteerExperience}
      summarize={(v) => ({
        title: v.role || v.organization,
        subtitle: [v.role ? v.organization : "", formatRange(v.startDate, v.endDate, fmt)].filter(Boolean).join(" · "),
      })}
      renderFields={({ item, set, error }) => (
        <>
          <FieldGrid>
            <TextInput label="Organization" value={item.organization} onChange={(v) => set({ organization: v })} />
            <TextInput label="Role" value={item.role} onChange={(v) => set({ role: v })} />
          </FieldGrid>
          <DateRange
            start={item.startDate}
            end={item.endDate}
            onStart={(v) => set({ startDate: v })}
            onEnd={(v) => set({ endDate: v })}
            endError={error("endDate")}
          />
          <TextArea label="Description" value={item.description} onChange={(v) => set({ description: v })} hint={DESCRIPTION_HINT} rows={3} />
        </>
      )}
    />
  );
}

// --- Skills -----------------------------------------------------------------

export function SkillsEditor() {
  const { content, update } = useEditor();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const skills = content.skills;
  const categories = [...new Set(skills.map((s) => s.category).filter(Boolean))];
  const setSkills = (recipe: (list: typeof skills) => typeof skills) => update((c) => ({ ...c, skills: recipe(c.skills) }));

  const add = () => {
    const names = name
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) return;
    setSkills((list) => [
      ...list,
      ...names
        .filter((n) => !list.some((s) => s.name.toLowerCase() === n.toLowerCase() && s.category === category.trim()))
        .map((n) => ({ id: createId(), name: n.slice(0, 60), category: category.trim().slice(0, 60) })),
    ]);
    setName("");
  };

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_0.8fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <TextInput label="Skill" value={name} onChange={setName} hint="Separate several with commas." maxLength={200} />
        <TextInput label="Category" value={category} onChange={setCategory} optional list="skill-categories" placeholder="e.g. Frontend" />
        <datalist id="skill-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Button type="submit" className="h-11 sm:mb-[1.375rem] sm:h-10" disabled={!name.trim()}>
          <Plus /> Add Skill
        </Button>
      </form>

      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add the skills you can confidently discuss in an interview.</p>
      ) : (
        <SortableList
          label="skills"
          items={skills}
          className="space-y-1.5"
          onReorder={(from, to) => setSkills((list) => moveItem(list, from, to))}
          renderItem={(skill, index, handle) => (
            <div className="flex items-center gap-1 rounded-md border border-border bg-card py-1 pr-1 pl-0.5">
              {handle}
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{skill.name}</span>
              <Input
                aria-label={`Category for ${skill.name}`}
                value={skill.category}
                placeholder="Category"
                list="skill-categories"
                maxLength={60}
                className="h-9 w-28 text-xs sm:w-36"
                onChange={(e) =>
                  setSkills((list) => list.map((s) => (s.id === skill.id ? { ...s, category: e.target.value } : s)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={`Move ${skill.name} up`}
                disabled={index === 0}
                onClick={() => setSkills((list) => moveItem(list, index, index - 1))}
              >
                <span aria-hidden="true">↑</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={`Remove ${skill.name}`}
                onClick={() => setSkills((list) => list.filter((s) => s.id !== skill.id))}
              >
                <X />
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
}

// --- Custom section ------------------------------------------------------------

export function CustomSectionEditor({ sectionId }: { sectionId: string }) {
  const { content, update, errors } = useEditor();
  const index = content.customSections.findIndex((s) => s.id === sectionId);
  const section = content.customSections[index];
  const [opened, setOpened] = useState<string | null>(null);
  if (!section) return null;

  const setSection = (recipe: (s: typeof section) => typeof section) =>
    update((c) => ({ ...c, customSections: c.customSections.map((s) => (s.id === sectionId ? recipe(s) : s)) }));
  const setEntries = (recipe: (e: typeof section.entries) => typeof section.entries) =>
    setSection((s) => ({ ...s, entries: recipe(s.entries) }));

  return (
    <div className="space-y-3">
      <TextInput
        label="Section name"
        value={section.title}
        maxLength={60}
        onChange={(v) => setSection((s) => ({ ...s, title: v }))}
        error={errors[`customSections.${index}.title`]}
      />
      <SortableList
        label="entries"
        items={section.entries}
        onReorder={(from, to) => setEntries((list) => moveItem(list, from, to))}
        renderItem={(entry, i, handle) => (
          <EntryCard
            title={entry.title}
            subtitle={entry.subtitle}
            handle={handle}
            index={i}
            count={section.entries.length}
            defaultOpen={opened === entry.id}
            itemLabel="Entry"
            onMove={(to) => setEntries((list) => moveItem(list, i, to))}
            onDuplicate={() =>
              setEntries((list) => {
                const next = [...list];
                next.splice(i + 1, 0, { ...entry, id: createId() });
                return next;
              })
            }
            onDelete={() => setEntries((list) => list.filter((e) => e.id !== entry.id))}
          >
            <FieldGrid>
              <TextInput
                label="Title"
                value={entry.title}
                onChange={(v) => setEntries((list) => list.map((e) => (e.id === entry.id ? { ...e, title: v } : e)))}
              />
              <TextInput
                label="Subtitle"
                value={entry.subtitle}
                optional
                onChange={(v) => setEntries((list) => list.map((e) => (e.id === entry.id ? { ...e, subtitle: v } : e)))}
              />
              <TextInput
                label="Date"
                value={entry.date}
                optional
                maxLength={40}
                placeholder="e.g. 2023 or Mar 2021 – Present"
                onChange={(v) => setEntries((list) => list.map((e) => (e.id === entry.id ? { ...e, date: v } : e)))}
              />
            </FieldGrid>
            <TextArea
              label="Description"
              value={entry.description}
              optional
              rows={3}
              hint={DESCRIPTION_HINT}
              onChange={(v) => setEntries((list) => list.map((e) => (e.id === entry.id ? { ...e, description: v } : e)))}
            />
          </EntryCard>
        )}
      />
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-dashed"
        onClick={() => {
          const entry = newEntry.customEntry();
          setOpened(entry.id);
          setEntries((list) => [...list, entry]);
        }}
      >
        <Plus /> Add Entry
      </Button>
    </div>
  );
}
