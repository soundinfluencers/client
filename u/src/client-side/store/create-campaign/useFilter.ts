import { create } from "zustand";
import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type { FilterCampaignState } from "./types";

export const useFilter = create<FilterCampaignState>((set) => ({
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
      const nextSelected = [...state.selected];

      const parent = filters.find((filter) =>
          filter.children?.some((child) => child.id === item.id),
      );

      const findSelected = (id: string) =>
          nextSelected.find((filter) => filter.id === id);

      const addItem = (filter: FilterItem) => {
        if (!findSelected(filter.id)) nextSelected.push({ ...filter });
      };

      const removeItemById = (id: string) => {
        const index = nextSelected.findIndex((filter) => filter.id === id);
        if (index !== -1) nextSelected.splice(index, 1);
      };

      if (checked) {
        if (item.children?.length) {
          addItem(item);
        } else if (parent) {
          let selectedParent = findSelected(parent.id);
          if (!selectedParent) {
            selectedParent = { ...parent, children: [] };
            nextSelected.push(selectedParent);
          }

          if (!selectedParent.children?.some((child) => child.id === item.id)) {
            selectedParent.children = [...(selectedParent.children ?? []), { ...item }];
          }
        } else {
          addItem(item);
        }
      } else {
        if (item.children?.length) {
          removeItemById(item.id);
        } else if (parent) {
          const selectedParent = findSelected(parent.id);
          if (selectedParent?.children) {
            selectedParent.children = selectedParent.children.filter(
                (child) => child.id !== item.id,
            );

            if (!selectedParent.children.length) {
              removeItemById(parent.id);
            }
          }
        } else {
          removeItemById(item.id);
        }
      }

      return { selected: nextSelected };
    });
  },

  removeItem: (id) =>
      set((state) => ({
        selected: state.selected
            .filter((filter) => filter.id !== id)
            .map((filter) =>
                filter.children
                    ? {
                      ...filter,
                      children: filter.children.filter((child) => child.id !== id),
                    }
                    : filter,
            ),
      })),
    reset: () =>
      set({
        selected: [],
      }),

}));