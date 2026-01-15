import type React from 'react';
import './_view-mode.scss';

import type { ListDisplayMode } from '../../../../../types/utils/constants.types';
import check from '../../../../../assets/icons/check.svg';
import gridViewIcon from '../../../../../assets/icons/grid.svg';
import listViewIcon from '../../../../../assets/icons/menu.svg';

interface Props {
  viewMode: ListDisplayMode;
  setViewMode: (mode: ListDisplayMode) => void;
};

export const ViewModeTabs:React.FC<Props> = ({ viewMode, setViewMode }) => {
  return (
    <div className="promos-view-mode-tabs">
      <button
        className={`promos-view-mode-tabs__tab ${viewMode === 'list' ? 'promos-view-mode-tabs__tab--active' : ''}`}
        onClick={() => setViewMode('list')}
      >
        <img
          src={check}
          alt="Check"
          className={`promos-view-mode-tabs__icon-check ${viewMode === 'list' ? 'promos-view-mode-tabs__icon-check--active' : ''}`}
        />
        <img
          src={listViewIcon}
          alt="List View"
          className='promos-view-mode-tabs__img'
        />
      </button>
      <button
        className={`promos-view-mode-tabs__tab ${viewMode === 'grid' ? 'promos-view-mode-tabs__tab--active' : ''}`}
        onClick={() => setViewMode('grid')}
      >
        <img
          src={gridViewIcon}
          alt="Grid View"
          className='promos-view-mode-tabs__img'
        />
        <img
          src={check}
          alt="Check"
          className={`promos-view-mode-tabs__icon-check ${viewMode === 'grid' ? 'promos-view-mode-tabs__icon-check--active' : ''}`}
        />
      </button>
    </div>
  );
}