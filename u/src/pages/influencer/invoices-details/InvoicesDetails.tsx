import './_invoices-details.scss';

import { Breadcrumbs, Container } from '../../../components';
import { InvoicesTable } from './components/invoices-table/InvoicesTable';

/*
  TODO: types for data and connect api
*/

export const InvoicesDetails = () => {
  return (
    <>
      <Container className="invoices-details">
        <Breadcrumbs />
        <header className="invoices-details__header">
          <h1 className='invoices-details__header-title'>Invoices</h1>
          <p className='invoices-details__header-subtitle'>View and track your submitted invoices and payment status</p>
        </header>
      </Container>

      <div className="invoices-details__table">
        <div className='invoices-details__scroll-container'>
          <InvoicesTable />
        </div>
      </div>
    </>
  );
};