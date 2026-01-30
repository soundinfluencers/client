import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { FilterCampaign } from "@/types/store/index.types";
import { create } from "zustand";

export const useFilter = create<FilterCampaign>((set) => ({
  selected: [],

  setSelected: (itemsOrUpdater) =>
    set((state) => ({
      selected:
        typeof itemsOrUpdater === "function"
          ? itemsOrUpdater(state.selected)
          : itemsOrUpdater,
    })),

  toggleItem: (item, checked, filters) => {
    set((state) => {
      const newSelected = [...state.selected];

      const parent = filters.find((f) =>
        f.children?.some((c) => c.id === item.id),
      );

      const findSelected = (id: string) => newSelected.find((f) => f.id === id);

      const addItem = (it: FilterItem) => {
        if (!findSelected(it.id)) newSelected.push({ ...it });
      };

      const removeItem = (id: string) => {
        const index = newSelected.findIndex((f) => f.id === id);
        if (index !== -1) newSelected.splice(index, 1);
      };

      if (checked) {
        if (item.children?.length) {
          addItem(item);
        } else if (parent) {
          let p = findSelected(parent.id);
          if (!p) {
            p = { ...parent, children: [] };
            newSelected.push(p);
          }
          if (!p.children!.some((c) => c.id === item.id))
            p.children!.push({ ...item });
        } else {
          addItem(item);
        }
      } else {
        if (item.children?.length) {
          removeItem(item.id);
        } else if (parent) {
          const p = findSelected(parent.id);
          if (p?.children) {
            p.children = p.children.filter((c) => c.id !== item.id);
            if (!p.children.length) removeItem(parent.id);
          }
        } else {
          removeItem(item.id);
        }
      }

      return { selected: newSelected };
    });
  },
  removeItem: (id: string) => {
    set((state) => ({
      selected: state.selected
        .filter((f) => f.id !== id)
        .map((f) =>
          f.children
            ? { ...f, children: f.children.filter((c) => c.id !== id) }
            : f,
        ),
    }));
  },
}));
