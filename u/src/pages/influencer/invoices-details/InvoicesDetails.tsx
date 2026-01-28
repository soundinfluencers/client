import './_invoices-details.scss';

import { Breadcrumbs, Container, Loader } from '../../../components';
import { InvoicesTable } from './components/invoices-table/InvoicesTable';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getInfluencerInvoices } from '@/api/influencer/invoice/invoices.api';

const LIMIT = 11;

export const InvoicesDetails = () => {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['invoices', LIMIT],
    queryFn: ({ pageParam = 1 }) => getInfluencerInvoices(LIMIT, pageParam as number),

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      if (lastPage.length < LIMIT) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });

  console.log('Invoices data:', data);

  const invoices = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading invoices.</div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>No invoices found.</div>
    );
  }

  return (
    <Container className="invoices-details">
      <Breadcrumbs />
      <header className="invoices-details__header">
        <h1 className='invoices-details__header-title'>Invoices</h1>
        <p className='invoices-details__header-subtitle'>View and track your submitted invoices and payment status</p>
      </header>
      <div className="invoices-details__content">
        <div className='invoices-details__scroll-container'>
          <InvoicesTable invoices={invoices} />
        </div>
      </div>

      <div className="invoices-details__actions">
        <ButtonMain
          label={isFetchingNextPage ? "Loading..." : "View more"}
          onClick={() => fetchNextPage()}
          isDisabled={!hasNextPage || isFetchingNextPage}
        />
      </div>
    </Container>
  );
};