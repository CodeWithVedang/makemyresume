"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createId } from "@/lib/resume/ids";
import type { ResumeContent } from "@/lib/resume/schema";

import { moveItem, useEditor } from "./EditorContext";
import { EntryCard } from "./EntryCard";
import { SortableList } from "./SortableList";

export type ListKey =
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "achievements"
  | "languages"
  | "volunteerExperience";

export type ListItem<K extends ListKey> = ResumeContent[K][number];

export type FieldHelpers<T> = {
  item: T;
  set: (patch: Partial<T>) => void;
  error: (field: keyof T & string) => string | undefined;
};

/** Generic editor for an ordered list section (experience, education, …). */
export function ListEditor<K extends ListKey>({
  listKey,
  itemLabel,
  create,
  summarize,
  renderFields,
  emptyText,
}: {
  listKey: K;
  itemLabel: string;
  create: () => ListItem<K>;
  summarize: (item: ListItem<K>) => { title: string; subtitle?: string };
  renderFields: (helpers: FieldHelpers<ListItem<K>>) => ReactNode;
  emptyText: string;
}) {
  const { content, update, errors } = useEditor();
  const items = content[listKey] as ListItem<K>[];
  const [opened, setOpened] = useState<string | null>(null);

  const setList = (recipe: (list: ListItem<K>[]) => ListItem<K>[]) =>
    update((c) => ({ ...c, [listKey]: recipe(c[listKey] as ListItem<K>[]) }));

  const add = () => {
    const item = create();
    setOpened(item.id);
    setList((list) => [...list, item]);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null}
      <SortableList
        label={itemLabel.toLowerCase()}
        items={items}
        onReorder={(from, to) => setList((list) => moveItem(list, from, to))}
        renderItem={(item, index, handle) => {
          const prefix = `${listKey}.${index}.`;
          const hasError = Object.keys(errors).some((k) => k.startsWith(prefix));
          const { title, subtitle } = summarize(item);
          return (
            <EntryCard
              title={title}
              subtitle={subtitle}
              handle={handle}
              index={index}
              count={items.length}
              hasError={hasError}
              defaultOpen={opened === item.id}
              itemLabel={itemLabel}
              onMove={(to) => setList((list) => moveItem(list, index, to))}
              onDuplicate={() =>
                setList((list) => {
                  const copy = { ...structuredClone(list[index]), id: createId() };
                  const next = [...list];
                  next.splice(index + 1, 0, copy);
                  return next;
                })
              }
              onDelete={() => {
                const removed = item;
                setList((list) => list.filter((entry) => entry.id !== removed.id));
                toast(`${itemLabel} deleted`, {
                  action: {
                    label: "Undo",
                    onClick: () =>
                      setList((list) => {
                        const next = [...list];
                        next.splice(Math.min(index, next.length), 0, removed);
                        return next;
                      }),
                  },
                });
              }}
            >
              {renderFields({
                item,
                set: (patch) =>
                  setList((list) => list.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))),
                error: (field) => errors[`${prefix}${field}`],
              })}
            </EntryCard>
          );
        }}
      />
      <Button type="button" variant="outline" className="h-11 w-full border-dashed" onClick={add}>
        <Plus /> Add {itemLabel}
      </Button>
    </div>
  );
}
