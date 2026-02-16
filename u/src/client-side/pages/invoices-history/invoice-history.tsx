import "./_invoices-history.scss";

import { Breadcrumbs, Container, Loader } from "../../../components";

import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInfluencerInvoices } from "@/api/influencer/invoice/invoices.api";
import { InvoicesTable } from "@/client-side/widgets";
import React from "react";
import { getInvoiceHistory } from "@/api/client/invoice/invoice.api";

const LIMIT = 11;

export const InvoicesHistory = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["invoice-history", LIMIT],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getInvoiceHistory(LIMIT, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      if (lastPage.length < LIMIT) return undefined;
      return allPages.length + 1;
    },
  });

  const invoices = data?.pages.flat() ?? [];

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Container className="invoices-history">
        <Breadcrumbs />
        <div style={{ fontSize: 24, textAlign: "center", paddingTop: 40 }}>
          Error loading invoices.
        </div>
      </Container>
    );

  return (
    <Container className="invoices-history">
      <Breadcrumbs />

      <header className="invoices-history__header">
        <h1 className="invoices-history__header-title">Invoices history</h1>
        <p className="invoices-history__header-subtitle">
          View and track your submitted invoices and payment status
        </p>
      </header>

      <div className="invoices-history__content">
        <div className="invoices-history__scroll-container">
          <InvoicesTable invoices={invoices} />
        </div>
      </div>

      <div className="invoices-history__actions">
        <ButtonMain
          label={isFetchingNextPage ? "Loading..." : "View more"}
          onClick={() => fetchNextPage()}
          isDisabled={!hasNextPage || isFetchingNextPage}
        />
      </div>
    </Container>
  );
};
