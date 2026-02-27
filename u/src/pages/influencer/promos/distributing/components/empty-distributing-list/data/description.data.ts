export type TEmptyDistributingListAdditionalInfo = {
  id: string;
  text: string;
}

export const EMPTY_DISTRIBUTING_LIST_TITLE = 'Distribution Complete';
export const EMPTY_DISTRIBUTING_LIST_DESCRIPTION = 'You may still have new or pending requests — please check your Requests tab to stay up to date.';

export const EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO_TITLE = 'While you wait:';
export const EMPTY_DISTRIBUTING_LIST_ADDITIONAL_INFO: TEmptyDistributingListAdditionalInfo[] = [
  {
    id: '1',
    text: 'Improve your profile to unlock more offers',
  },
  {
    id: '2',
    text: 'Review your campaign performance',
  },
  {
    id: '3',
    text: 'Enable instant notifications',
  },
];
