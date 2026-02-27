import type React from 'react';
import './_view-mode.scss';

// import check from '../../../../../assets/icons/check.svg';
import gridViewIcon from '../../../../../assets/icons/grid.svg';
import listViewIcon from '../../../../../assets/icons/menu.svg';
import { useDashboardLayoutStore } from '../../store/useDashboardLayoutStore';

export const ViewModeTabs:React.FC = () => {
  const { viewMode, setViewMode } = useDashboardLayoutStore();

  return (
    <div className="promos-view-mode-tabs">
      <button
        className={`promos-view-mode-tabs__tab ${viewMode === 'list' ? 'promos-view-mode-tabs__tab--active' : ''}`}
        onClick={() => {
          if (viewMode !== 'list') {
            setViewMode('list');
          }
        }}
      >
        {/*<img*/}
        {/*  src={check}*/}
        {/*  alt="Check"*/}
        {/*  className={`promos-view-mode-tabs__icon-check ${viewMode === 'list' ? 'promos-view-mode-tabs__icon-check--active' : ''}`}*/}
        {/*/>*/}
        <img
          src={listViewIcon}
          alt="List View"
          className='promos-view-mode-tabs__img'
        />
      </button>
      <button
        className={`promos-view-mode-tabs__tab ${viewMode === 'grid' ? 'promos-view-mode-tabs__tab--active' : ''}`}
        onClick={() => {
          if (viewMode !== 'grid') {
            setViewMode('grid');
          };
        }}
      >
        <img
          src={gridViewIcon}
          alt="Grid View"
          className='promos-view-mode-tabs__img'
        />
        {/*<img*/}
        {/*  src={check}*/}
        {/*  alt="Check"*/}
        {/*  className={`promos-view-mode-tabs__icon-check ${viewMode === 'grid' ? 'promos-view-mode-tabs__icon-check--active' : ''}`}*/}
        {/*/>*/}
      </button>
    </div>
  );
}