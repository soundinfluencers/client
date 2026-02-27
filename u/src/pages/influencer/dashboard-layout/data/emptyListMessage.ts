import type { TFilterStatus } from "@/pages/influencer/promos/types/promos.types.ts";

export const EMPTY_MESSAGE: Record<TFilterStatus, {title: string, description: string}> = {
  all: {
    title: "No promos yet",
    description: "Explore available campaigns and start earning rewards!"
  },
  new: {
    title: 'No new promotions right now',
    description: 'You’re all caught up. New promotions will appear here as soon as they’re available.',
  },
  close: {
    title: 'No completed campaigns yet',
    description: 'Your completed campaigns will appear here once they are finished.',
  },
  ongoing: {
    title: 'Distribution Complete',
    description: 'You may still have new or pending requests — please check your Requests tab to stay up to date.'
  },
};
