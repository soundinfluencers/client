import { conformationInfluencerPromo } from "@/api/influencer/promos/influencer-promos.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/api/error.api.ts";
import { useNavigate } from "react-router-dom";

export const useConfirmInfluencerPromo = (isSingle?: boolean) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: conformationInfluencerPromo,

    onSuccess: async () => {
      // await queryClient.invalidateQueries({queryKey: ["influencer-new-promos"]});
      if (isSingle) {
        await queryClient.invalidateQueries({queryKey: ["promos"]});
        navigate('/influencer/promos/new-promos', {
          replace: true,
          state: null
        });
        return;
      }

      await queryClient.invalidateQueries({queryKey: ["distributingOrCompleted-promos"]});
      await queryClient.invalidateQueries({queryKey: ["promos"]});
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};

//Local optimistic update version
// export const useConfirmInfluencerPromo = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: conformationInfluencerPromo,

//     // OPTIMISTIC UPDATE
//     onMutate: async (variables) => {
//
//       await queryClient.cancelQueries({
//         queryKey: ["influencer-new-promos"],
//       });

//
//       const previousPromos = queryClient.getQueryData<IPromoDetailsModel[]>([
//         "influencer-new-promos",
//       ]);

//
//       queryClient.setQueryData<IPromoDetailsModel[]>(["influencer-new-promos"], (old = []) =>
//         old.filter(
//           (promo) =>
//             !(
//               promo.campaignId === variables.campaignId &&
//               promo.addedAccountsId === variables.addedAccountsId
//             ),
//         ),
//       );

//
//       return { previousPromos };
//     },

//
//     onError: (_err, _variables, context) => {
//       if (context?.previousPromos) {
//         queryClient.setQueryData<IPromoDetailsModel[]>(
//           ["influencer-new-promos"],
//           context.previousPromos,
//         );
//       }
//     },

//     // успех
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["influencer-new-promos"],
//       });
//     },
//   });
// };
