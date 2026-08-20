import React from "react";
import "@/client-side/styles-table/table-base.scss";

import chevron from "@/assets/icons/chevron-up.svg";
import plus from "@/assets/icons/plus.svg";

import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/types/store/index.types";

import { TableCard } from "../card-table/table-card-proposal";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { TableGroup } from "@/client-side/types/table-types";
import { getTableColumnWidths, getTitle } from "@/client-side/data/table-campaign.data";

import { useFollowersSort } from "@/client-side/hooks";
import { getAccountKey, getColumns } from "@/client-side/utils";
import {
  useFetchCampaign,
  useProposalAccountsStore,
} from "@/client-side/store";
import {
  useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import {
  buildProposalAddInfluencerUrl,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";
import { isCampaignDisplayCurrency } from "@/shared/functions/formatCurrency";
import {
  useBundleByIdFetcher,
} from "@/entities/client-side/campaign-creator-page/bundle";
import {
  getPublishedOfferById,
} from "@/entities/client-side/campaign-creator-page/offer/api/offer.api";
import {
  searchPromoAccounts,
} from "@/entities/client-side/campaign-creator-page/campaign-promo-account/api/promo-account.api";
import {
  getProposalAddInfluencerRequirements,
  prepareProposalAddInfluencerBuilderState,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder";

type Props = {
  items: CampaignContentItem[];
  networks: CampaignAddedAccount[];
  totalPrice: number;
  changeView: boolean;
  group: TableGroup;
  canEdit: boolean;
  optionIndex: number;
  title: string;
  optionIndexes?: number[];
  onDeleteOption?: (optionIndex: number) => Promise<void>;
  isMutationPending?: boolean;
};

const makeRowKey = (n: CampaignAddedAccount, index: number) =>
  String((n as any).accountId ?? `${(n as any).influencerId}-${index}`);

type ActiveDropdown = {
  rowKey: string;
  key: "date" | "content" | "postDescription";
} | null;

export function TableProposal({
  items,
  networks,
  totalPrice,
  changeView,
  group,
  canEdit,
  optionIndex,
  title,
  optionIndexes,
  onDeleteOption,
  isMutationPending,
}: Props) {
  const navigate = useNavigate();
  const fetchBundleById = useBundleByIdFetcher();
  const campaignName = useFetchCampaign(
    (state) => String(state.data?.campaignName ?? ""),
  );
  const isHydratingBuilderRef = React.useRef(false);
  const getGroupBySocial = (social?: string): TableGroup => {
    const s = String(social ?? "").toLowerCase();

    if (["facebook", "instagram", "youtube", "tiktok"].includes(s)) {
      return "main";
    }

    if (["spotify", "soundcloud"].includes(s)) {
      return "music";
    }

    return "press";
  };
  const optionItems = useProposalAccountsStore(
    (s) => s.contentByOption[optionIndex] ?? items ?? [],
  );

  const optionNetworks = useProposalAccountsStore(
    (s) => s.accountsByOption[optionIndex] ?? networks ?? [],
  );
  const proposalDisplayCurrency = useProposalAccountsStore(
    (s) => s.optionSnapshotsByIndex[optionIndex]?.displayCurrency,
  );
  const addInfluencerUrl = isCampaignDisplayCurrency(proposalDisplayCurrency)
    ? buildProposalAddInfluencerUrl({
        optionIndex,
        currency: proposalDisplayCurrency,
      })
    : "/client/campaign";

  const initializeAddInfluencerBuilder = React.useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (isHydratingBuilderRef.current) return;
      if (!isCampaignDisplayCurrency(proposalDisplayCurrency)) {
        toast.error("Proposal currency is unavailable in Campaign Builder");
        return;
      }

      const proposalState = useProposalAccountsStore.getState();
      const snapshot = proposalState.optionSnapshotsByIndex[optionIndex];
      const accounts = proposalState.accountsByOption[optionIndex] ?? [];
      const content = proposalState.contentByOption[optionIndex] ?? [];
      const cachedBuilderState =
        proposalState.builderWorkingStateByOption[optionIndex];
      const cachedCatalogContext =
        proposalState.builderCatalogContextByOption[optionIndex];

      if (!snapshot || !accounts.length || !campaignName) {
        toast.error("Proposal option is unavailable for Campaign Builder");
        return;
      }

      const source = {
        campaignName,
        snapshot,
        accounts: accounts as any[],
        content,
        pendingBundleMembership: Object.prototype.hasOwnProperty.call(
          proposalState.pendingBundleMembershipByOption,
          optionIndex,
        )
          ? proposalState.pendingBundleMembershipByOption[optionIndex]
          : undefined,
        selectedOfferChange: Object.prototype.hasOwnProperty.call(
          proposalState.selectedOfferChangeByOption,
          optionIndex,
        )
          ? proposalState.selectedOfferChangeByOption[optionIndex]
          : undefined,
        cachedBuilderState,
      };
      const requirements = getProposalAddInfluencerRequirements(source);

      isHydratingBuilderRef.current = true;

      try {
        const cachedBundlesById = new Map(
          (cachedBuilderState?.selectedBundles ?? []).map((bundle) => [
            bundle.bundleId,
            bundle,
          ] as const),
        );
        const bundles = await Promise.all(
          requirements.bundleIds.map(async (bundleId) =>
            cachedBundlesById.get(bundleId) ?? fetchBundleById(bundleId),
          ),
        );
        const bundlesById = new Map(
          bundles.map((bundle) => [bundle.bundleId, bundle] as const),
        );
        const hasCachedOffer =
          Boolean(requirements.offer) &&
          cachedBuilderState?.selectedOfferId === requirements.offer?.offerId;
        const offer =
          requirements.offer && !hasCachedOffer
            ? await getPublishedOfferById(
              requirements.offer.offerId,
              requirements.offer.socialMedia ?? "",
              requirements.offer.genre ?? "",
            )
            : undefined;
        const cachedAccountsById = new Map(
          (cachedBuilderState?.selectedAccounts ?? []).map((account) => [
            account.accountId,
            account,
          ] as const),
        );
        const standaloneAccounts = await Promise.all(
          requirements.standaloneAccounts.map(async (requiredAccount) => {
            const cached = cachedAccountsById.get(requiredAccount.accountId);
            if (cached?.prices && Object.keys(cached.prices).length > 1) {
              return null;
            }

            const matches = await searchPromoAccounts({
              query: requiredAccount.username,
              socialMedias: [requiredAccount.socialMedia],
              page: 1,
              limit: 50,
            });
            const exact = matches.find(
              (account) => account.accountId === requiredAccount.accountId,
            );
            if (!exact) {
              throw new Error(
                `Account ${requiredAccount.accountId} is unavailable`,
              );
            }

            return exact;
          }),
        );
        const standaloneAccountsById = new Map(
          standaloneAccounts
            .filter((account): account is NonNullable<typeof account> =>
              Boolean(account),
            )
            .map((account) => [account.accountId, account] as const),
        );
        const hydrated = prepareProposalAddInfluencerBuilderState(source, {
          bundlesById,
          offer,
          standaloneAccountsById,
        });

        useCampaignBuilderStore
          .getState()
          .actions.hydrateFromDraft(hydrated);
        proposalState.setBuilderWorkingState(optionIndex, hydrated);
        navigate(
          buildProposalAddInfluencerUrl({
            optionIndex,
            currency: proposalDisplayCurrency,
            platform:
              cachedCatalogContext?.platform ??
              requirements.offer?.socialMedia,
            genre:
              cachedCatalogContext?.genre ??
              requirements.offer?.genre,
          }),
        );
      } catch (error) {
        console.error(error);
        useCampaignBuilderStore.getState().actions.reset();
        toast.error(
          error instanceof Error
            ? error.message
            : "Proposal option cannot be opened in Campaign Builder",
        );
      } finally {
        isHydratingBuilderRef.current = false;
      }
    }, [
      campaignName,
      fetchBundleById,
      navigate,
      optionIndex,
      proposalDisplayCurrency,
    ],
  );

  const localItems = React.useMemo(
    () =>
      (optionItems ?? []).filter((item) => item.socialMediaGroup === group),
    [optionItems, group],
  );

  const localNetworks = React.useMemo(
    () =>
      (optionNetworks ?? []).filter(
        (network) => getGroupBySocial((network as any).socialMedia) === group,
      ),
    [optionNetworks, group],
  );

  const totalFollowers = React.useMemo(
    () =>
      localNetworks.reduce(
        (sum, n) => sum + Number((n as any).followers ?? 0),
        0,
      ),
    [localNetworks],
  );

  const { followersSort, toggleFollowersSort, sortedNetworks } =
    useFollowersSort(localNetworks);

  const [active, setActive] = React.useState<ActiveDropdown>(null);

  const toggleDropdown = React.useCallback(
    (rowKey: string, key: ActiveDropdown extends null ? never : any) => {
      setActive((prev) =>
        prev && prev.rowKey === rowKey && prev.key === key
          ? null
          : { rowKey, key },
      );
    },
    [],
  );

  const closeDropdown = React.useCallback(() => setActive(null), []);

  const uniqueNetworks = React.useMemo(() => {
    const seen = new Set<string>();
    return sortedNetworks.filter((n) => {
      const key = getAccountKey(n);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sortedNetworks]);

  const columns = React.useMemo(
    () => getColumns(changeView, group, canEdit),
    [changeView, group, canEdit],
  );

  const widths = React.useMemo(
    () =>
      getTableColumnWidths({
        group,
        changeView,
        canEdit,
      }),
    [group, changeView, canEdit],
  );

  return (
    <div className="tableBase-wrap">
      <h1>{title}</h1>

      <table className="tableBase border-table">
        <colgroup>
          {columns.map((key) => (
            <col
              key={key}
              style={widths[key] ? { width: `${widths[key]}px` } : undefined}
            />
          ))}
        </colgroup>

        <thead>
        <tr>
          {columns.map((key) => (
            <th key={key} className="tableBase__th">
              <div className="header-content">
                <span className="th-title">{getTitle(group, key)}</span>

                {key === "followers" && (
                  <div className="switch" aria-label="Sort by followers">
                    <button
                      type="button"
                      className={`switch-btn ${followersSort === "desc" ? "active" : ""}`}
                      onClick={() => toggleFollowersSort("desc")}
                      aria-pressed={followersSort === "desc"}
                      title="Sort desc"
                    >
                      <img className="up" src={chevron} alt=""/>
                    </button>

                    <button
                      type="button"
                      className={`switch-btn ${followersSort === "asc" ? "active" : ""}`}
                      onClick={() => toggleFollowersSort("asc")}
                      aria-pressed={followersSort === "asc"}
                      title="Sort asc"
                    >
                      <img className="down" src={chevron} alt=""/>
                    </button>
                  </div>
                )}
              </div>
            </th>
          ))}
        </tr>
        </thead>

        <tbody>
        {uniqueNetworks.map((network, index) => {
          const rowKey = makeRowKey(network, index);

          return (
            <TableCard
              columns={columns}
              optionIndex={optionIndex}
              key={rowKey}
              rowKey={rowKey}
              data={network}
              items={localItems}
              group={group}
              activeDropdown={active}
              onToggleDropdown={toggleDropdown}
              onCloseDropdown={closeDropdown}
              canEdit={canEdit}
              changeView={changeView}
              optionIndexes={optionIndexes ?? []}
              onDeleteOption={onDeleteOption}
              isMutationPending={Boolean(isMutationPending)}
            />
          );
        })}
        </tbody>

        <tfoot>
        <tr>
          {columns.map((col, index) => {
            const isAddInfluencer =
              col === "network" && canEdit && !changeView;

            return (
              <td
                key={index}
                className={`td--footer ${isAddInfluencer ? "is-left" : ""} ${col.includes("followers") ? "followers" : ""}`}
              >
                {isAddInfluencer && (
                  <Link
                        onClick={initializeAddInfluencerBuilder}
                        to={addInfluencerUrl}>
                    <div className="add-influencer">
                      <img src={plus} alt=""/>
                      <p>Add Influencer</p>
                    </div>
                  </Link>
                )}

                {col === "followers" && <p>{totalFollowers}</p>}
              </td>
            );
          })}
        </tr>
        </tfoot>
      </table>
    </div>
  );
}
