import type { ColumnDef } from "@tanstack/react-table";

import type {
    EditableCampaignContentItem,
    EditableDescription,
    SelectedCampaignContentItem,
} from "@/entities/client-side/campaign/store/campaign.store";
import type { CampaignTableRow, StrategyGroup } from "./campaign-table.types";

import { ContentTableCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/content-table-cell";
import { DescriptionTableCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/description-table-cell";
import { ExtraFieldsTableCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/extra-fields-table-cell";
import { DateTableCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/date-cell.tsx";
import { FollowersTableCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/followers-cell.tsx";
import { NetworkTableCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/network-cell.tsx";
import { CountriesCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/countries-cell";
import { GenresCell } from "@/widgets/client-side/campaign/campaign-table/ui/cells/genres-cell";

import { SortableHeader } from "@/widgets/client-side/campaign/campaign-table/sortable-header/sortable-header";
import {ActionTableCell} from "@/widgets/client-side/campaign/campaign-table/ui/cells/action-cell.tsx";


type GetColumnsParams = {
    group: StrategyGroup;
    canEdit: boolean;
    canManageAccounts: boolean;
    isAdvancedInsights: boolean;
    isProposal: boolean;

    setAccountSelectedContent: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;

    setAccountDateRequest: (accountKey: string, dateRequest: string) => void;

    setContentField: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;

    setContentDescriptions: (
        contentId: string,
        descriptions: EditableDescription[],
    ) => void;

    addContentItem: (
        socialMedia: string,
        payload?: Partial<EditableCampaignContentItem>,
        inheritFromContentId?: string,
    ) => {
        contentId: string;
        firstDescriptionId: string;
    };

    removeContentItem: (contentId: string) => void;

    removeAccount: (accountKey: string) => void;
    setDeletingAccountKey: (accountKey: string | null) => void;
    clearRecentlyAdded: (accountKey: string) => void;
    deletingAccountKey: string | null;
    recentlyAddedAccountKeys: string[];
};

const MAIN_DEFAULT_SIZE = {
    network: 208,
    followers: 96,
    dateRequest: 96,
    content: 131,
    description: 311,
    taggedUser: 113,
    taggedLink: 125,
    brief: 142,
    action: 120,
} as const;

const MAIN_ADVANCED_SIZE = {
    network: 190,
    followers: 90,
    content: 150,
    description: 229,
    genres: 250,
    countries: 260,
    action: 120,
} as const;

const MUSIC_DEFAULT_SIZE = {
    network: 208,
    followers: 96,
    dateRequest: 120,
    content: 180,
    trackTitle: 260,
    action: 120,
} as const;

const MUSIC_ADVANCED_SIZE = {
    network: 190,
    followers: 90,
    content: 131,
    trackTitle: 200,
    genres: 589,
    action: 120,
} as const;

const PRESS_DEFAULT_SIZE = {
    network: 208,
    dateRequest: 120,
    musicLink: 180,
    artwork: 220,
    releaseLink: 220,
    brief: 260,
    action: 120,
} as const;

const PRESS_ADVANCED_SIZE = {
    network: 208,
    brief: 352,
    genres: 663,
    action: 120,
} as const;

const PROPOSAL_MAIN_DEFAULT_SIZE = {
    network: 180,
    followers: 104,
    dateRequest: 100,
    content: 120,
    description: 250,
    taggedUser: 100,
    taggedLink: 105,
    brief: 125,
    action: 65,
} as const;

const PROPOSAL_MAIN_ADVANCED_SIZE = {
    network: 175,
    followers: 82,
    content: 125,
    description: 210,
    genres: 210,
    countries: 210,
    action: 65,
} as const;

const PROPOSAL_MUSIC_DEFAULT_SIZE = {
    network: 180,
    followers: 94,
    dateRequest: 104,
    content: 145,
    trackTitle: 210,
    action: 65,
} as const;

const PROPOSAL_MUSIC_ADVANCED_SIZE = {
    network: 175,
    followers: 92,
    content: 125,
    trackTitle: 180,
    genres: 430,
    action: 65,
} as const;

const PROPOSAL_PRESS_DEFAULT_SIZE = {
    network: 180,
    dateRequest: 95,
    musicLink: 160,
    artwork: 180,
    releaseLink: 180,
    brief: 210,
    action: 65,
} as const;

const PROPOSAL_PRESS_ADVANCED_SIZE = {
    network: 180,
    brief: 300,
    genres: 520,
    action: 65,
} as const;

const followersColumn = (size: number): ColumnDef<CampaignTableRow> => ({
    id: "followers",
    header: ({ column }) => (
        <SortableHeader<CampaignTableRow> title="Followers" column={column} />
    ),
    size,
    accessorFn: (row) => Number(row.account.followers ?? 0),
    enableSorting: true,
    cell: ({ row }) => <FollowersTableCell row={row.original} />,
});

const networkColumn = (size: number): ColumnDef<CampaignTableRow> => ({
    id: "network",
    header: "Network",
    size,
    enableSorting: false,
    cell: ({ row }) => <NetworkTableCell row={row.original} />,
});

const genresColumn = (size: number): ColumnDef<CampaignTableRow> => ({
    id: "genres",
    header: "Genres",
    size,
    enableSorting: false,
    cell: ({ row }) => <GenresCell row={row.original} />,
});

const countriesColumn = (size: number): ColumnDef<CampaignTableRow> => ({
    id: "countries",
    header: "Countries",
    size,
    enableSorting: false,
    cell: ({ row }) => <CountriesCell row={row.original} />,
});

const actionColumn = ({
                          size,
                          canEdit,
                          removeAccount,
                          setDeletingAccountKey,
                          clearRecentlyAdded,
                          deletingAccountKey,
                          recentlyAddedAccountKeys,
                      }: {
    size: number;
    canEdit: boolean;
    removeAccount: (accountKey: string) => void;
    setDeletingAccountKey: (accountKey: string | null) => void;
    clearRecentlyAdded: (accountKey: string) => void;
    deletingAccountKey: string | null;
    recentlyAddedAccountKeys: string[];
}): ColumnDef<CampaignTableRow> => ({
    id: "action",
    header: "Action",
    size,
    enableSorting: false,
    cell: ({ row }) => (
        <ActionTableCell
            row={row.original}
            canEdit={canEdit}
            removeAccount={removeAccount}
            setDeletingAccountKey={setDeletingAccountKey}
            clearRecentlyAdded={clearRecentlyAdded}
            deletingAccountKey={deletingAccountKey}
            recentlyAddedAccountKeys={recentlyAddedAccountKeys}
        />
    ),
});

const dateRequestColumn = ({
                               size,
                               canEdit,
                               setAccountDateRequest,
                           }: {
    size: number;
    canEdit: boolean;
    setAccountDateRequest: (accountKey: string, dateRequest: string) => void;
}): ColumnDef<CampaignTableRow> => ({
    id: "dateRequest",
    header: "Req. date",
    size,
    enableSorting: false,
    cell: ({ row }) => (
        <DateTableCell
            row={row.original}
            canEdit={canEdit}
            setAccountDateRequest={setAccountDateRequest}
        />
    ),
});

const contentColumn = ({
                           id = "content",
                           header,
                           size,
                           canEdit,
                           setAccountSelectedContent,
                           setContentField,
                           addContentItem,
                           removeContentItem,
                       }: {
    id?: string;
    header: string;
    size: number;
    canEdit: boolean;
    setAccountSelectedContent: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;
    setContentField: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
    addContentItem: (
        socialMedia: string,
        payload?: Partial<EditableCampaignContentItem>,
        inheritFromContentId?: string,
    ) => {
        contentId: string;
        firstDescriptionId: string;
    };
    removeContentItem: (contentId: string) => void;
}): ColumnDef<CampaignTableRow> => ({
    id,
    header,
    size,
    enableSorting: false,
    cell: ({ row }) => (
        <ContentTableCell
            row={row.original}
            canSelect={true}
            canManage={canEdit}
            setAccountSelectedContent={setAccountSelectedContent}
            setContentField={setContentField}
            addContentItem={addContentItem}
            removeContentItem={removeContentItem}
        />
    ),
});

const descriptionColumn = ({
                               id,
                               header,
                               size,
                               canEdit,
                               variant,
                               setAccountSelectedContent,
                               setContentDescriptions,
                           }: {
    id: string;
    header: string;
    size: number;
    canEdit: boolean;
    variant?: "description" | "tracktitle" | "artworkLink";
    setAccountSelectedContent: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;
    setContentDescriptions: (
        contentId: string,
        descriptions: EditableDescription[],
    ) => void;
}): ColumnDef<CampaignTableRow> => ({
    id,
    header,
    size,
    enableSorting: false,
    cell: ({ row }) => (
        <DescriptionTableCell
            row={row.original}
            canSelect={true}
            canManage={canEdit}
            variant={variant}
            setAccountSelectedContent={setAccountSelectedContent}
            setContentDescriptions={setContentDescriptions}
        />
    ),
});

const extraFieldColumn = ({
                              id,
                              header,
                              size,
                              field,
                              canEdit,
                              setContentField,
                          }: {
    id: string;
    header: string;
    size: number;
    field:
        | "tag"
        | "link"
        | "brief"
        | "pressReleaseLink"
        | "pressBrief";
    canEdit: boolean;
    setContentField: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
}): ColumnDef<CampaignTableRow> => ({
    id,
    header,
    size,
    enableSorting: false,
    cell: ({ row }) => (
        <ExtraFieldsTableCell
            row={row.original}
            canEdit={canEdit}
            field={field}
            setContentField={setContentField}
        />
    ),
});

const appendActionColumn = ({
                                columns,
                                canManageAccounts,
                                size,
                                canEdit,
                                removeAccount,
                                setDeletingAccountKey,
                                clearRecentlyAdded,
                                deletingAccountKey,
                                recentlyAddedAccountKeys,
                            }: {
    columns: ColumnDef<CampaignTableRow>[];
    canManageAccounts: boolean;
    size: number;
    canEdit: boolean;
    removeAccount: (accountKey: string) => void;
    setDeletingAccountKey: (accountKey: string | null) => void;
    clearRecentlyAdded: (accountKey: string) => void;
    deletingAccountKey: string | null;
    recentlyAddedAccountKeys: string[];
}) => {
    if (!canManageAccounts) return columns;

    return [
        ...columns,
        actionColumn({
            size,
            canEdit,
            removeAccount,
            setDeletingAccountKey,
            clearRecentlyAdded,
            deletingAccountKey,
            recentlyAddedAccountKeys,
        }),
    ];
};

export const getCampaignTableColumns = ({
                                            group,
                                            canEdit,
                                            canManageAccounts,
                                            isAdvancedInsights,
                                            isProposal,
                                            setAccountSelectedContent,
                                            setAccountDateRequest,
                                            setContentField,
                                            setContentDescriptions,
                                            addContentItem,
                                            removeContentItem,
                                            removeAccount,
                                            setDeletingAccountKey,
                                            clearRecentlyAdded,
                                            deletingAccountKey,
                                            recentlyAddedAccountKeys,
                                        }: GetColumnsParams): ColumnDef<CampaignTableRow>[] => {
    if (group === "music") {
        if (isAdvancedInsights) {
            const size = isProposal
                ? PROPOSAL_MUSIC_ADVANCED_SIZE
                : MUSIC_ADVANCED_SIZE;

            const columns = [
                networkColumn(size.network),
                followersColumn(size.followers),
                contentColumn({
                    header: "Song",
                    size: size.content,
                    canEdit,
                    setAccountSelectedContent,
                    setContentField,
                    addContentItem,
                    removeContentItem,
                }),
                descriptionColumn({
                    id: "trackTitle",
                    header: "Track title",
                    size: size.trackTitle,
                    canEdit,
                    variant: "tracktitle",
                    setAccountSelectedContent,
                    setContentDescriptions,
                }),
                genresColumn(size.genres),
            ];

            return appendActionColumn({
                columns,
                canManageAccounts,
                size: size.action,
                canEdit,
                removeAccount,
                setDeletingAccountKey,
                clearRecentlyAdded,
                deletingAccountKey,
                recentlyAddedAccountKeys,
            });
        }

        const size = isProposal ? PROPOSAL_MUSIC_DEFAULT_SIZE : MUSIC_DEFAULT_SIZE;

        const columns = [
            networkColumn(size.network),
            followersColumn(size.followers),
            dateRequestColumn({
                size: size.dateRequest,
                canEdit,
                setAccountDateRequest,
            }),
            contentColumn({
                header: "Song",
                size: size.content,
                canEdit,
                setAccountSelectedContent,
                setContentField,
                addContentItem,
                removeContentItem,
            }),
            descriptionColumn({
                id: "trackTitle",
                header: "Track title",
                size: size.trackTitle,
                canEdit,
                variant: "tracktitle",
                setAccountSelectedContent,
                setContentDescriptions,
            }),
        ];

        return appendActionColumn({
            columns,
            canManageAccounts,
            size: size.action,
            canEdit,
            removeAccount,
            setDeletingAccountKey,
            clearRecentlyAdded,
            deletingAccountKey,
            recentlyAddedAccountKeys,
        });
    }

    if (group === "press") {
        if (isAdvancedInsights) {
            const size = isProposal
                ? PROPOSAL_PRESS_ADVANCED_SIZE
                : PRESS_ADVANCED_SIZE;

            const columns = [
                networkColumn(size.network),
                extraFieldColumn({
                    id: "pressBrief",
                    header: "Additional brief",
                    size: size.brief,
                    field: "pressBrief",
                    canEdit,
                    setContentField,
                }),
                genresColumn(size.genres),
            ];

            return appendActionColumn({
                columns,
                canManageAccounts,
                size: size.action,
                canEdit,
                removeAccount,
                setDeletingAccountKey,
                clearRecentlyAdded,
                deletingAccountKey,
                recentlyAddedAccountKeys,
            });
        }

        const size = isProposal ? PROPOSAL_PRESS_DEFAULT_SIZE : PRESS_DEFAULT_SIZE;

        const columns = [
            networkColumn(size.network),
            dateRequestColumn({
                size: size.dateRequest,
                canEdit,
                setAccountDateRequest,
            }),
            contentColumn({
                id: "pressMusicLink",
                header: "Link to music, events, news",
                size: size.musicLink,
                canEdit,
                setAccountSelectedContent,
                setContentField,
                addContentItem,
                removeContentItem,
            }),
            descriptionColumn({
                id: "pressArtworkLink",
                header: "Artwork",
                size: size.artwork,
                canEdit,
                variant: "artworkLink",
                setAccountSelectedContent,
                setContentDescriptions,
            }),
            extraFieldColumn({
                id: "pressReleaseLink",
                header: "Link to press release",
                size: size.releaseLink,
                field: "pressReleaseLink",
                canEdit,
                setContentField,
            }),
            extraFieldColumn({
                id: "pressBrief",
                header: "Additional brief",
                size: size.brief,
                field: "pressBrief",
                canEdit,
                setContentField,
            }),
        ];

        return appendActionColumn({
            columns,
            canManageAccounts,
            size: size.action,
            canEdit,
            removeAccount,
            setDeletingAccountKey,
            clearRecentlyAdded,
            deletingAccountKey,
            recentlyAddedAccountKeys,
        });
    }

    if (isAdvancedInsights) {
        const size = isProposal ? PROPOSAL_MAIN_ADVANCED_SIZE : MAIN_ADVANCED_SIZE;

        const columns = [
            networkColumn(size.network),
            followersColumn(size.followers),
            contentColumn({
                header: "Content",
                size: size.content,
                canEdit,
                setAccountSelectedContent,
                setContentField,
                addContentItem,
                removeContentItem,
            }),
            descriptionColumn({
                id: "description",
                header: "Post description",
                size: size.description,
                canEdit,
                setAccountSelectedContent,
                setContentDescriptions,
            }),
            genresColumn(size.genres),
            countriesColumn(size.countries),
        ];

        return appendActionColumn({
            columns,
            canManageAccounts,
            size: size.action,
            canEdit,
            removeAccount,
            setDeletingAccountKey,
            clearRecentlyAdded,
            deletingAccountKey,
            recentlyAddedAccountKeys,
        });
    }

    const size = isProposal ? PROPOSAL_MAIN_DEFAULT_SIZE : MAIN_DEFAULT_SIZE;

    const columns = [
        networkColumn(size.network),
        followersColumn(size.followers),
        dateRequestColumn({
            size: size.dateRequest,
            canEdit,
            setAccountDateRequest,
        }),
        contentColumn({
            header: "Content",
            size: size.content,
            canEdit,
            setAccountSelectedContent,
            setContentField,
            addContentItem,
            removeContentItem,
        }),
        descriptionColumn({
            id: "description",
            header: "Post description",
            size: size.description,
            canEdit,
            setAccountSelectedContent,
            setContentDescriptions,
        }),
        extraFieldColumn({
            id: "taggedUser",
            header: "Tagged user",
            size: size.taggedUser,
            field: "tag",
            canEdit,
            setContentField,
        }),
        extraFieldColumn({
            id: "taggedLink",
            header: "Tagged link",
            size: size.taggedLink,
            field: "link",
            canEdit,
            setContentField,
        }),
        extraFieldColumn({
            id: "brief",
            header: "Additional brief",
            size: size.brief,
            field: "brief",
            canEdit,
            setContentField,
        }),
    ];

    return appendActionColumn({
        columns,
        canManageAccounts,
        size: size.action,
        canEdit,
        removeAccount,
        setDeletingAccountKey,
        clearRecentlyAdded,
        deletingAccountKey,
        recentlyAddedAccountKeys,
    });
};