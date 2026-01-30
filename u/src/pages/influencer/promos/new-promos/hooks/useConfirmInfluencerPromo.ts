import { conformationInfluencerPromo } from "@/api/influencer/promos/influencer-promos.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useConfirmInfluencerPromo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conformationInfluencerPromo,

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["influencer-new-promos"]});
    },
  });
};

//Local optimistic update version
// export const useConfirmInfluencerPromo = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: conformationInfluencerPromo,

//     // 🔥 OPTIMISTIC UPDATE
//     onMutate: async (variables) => {
//       // 1. Останавливаем возможный refetch
//       await queryClient.cancelQueries({
//         queryKey: ["influencer-new-promos"],
//       });

//       // 2. Сохраняем предыдущее состояние
//       const previousPromos = queryClient.getQueryData<IPromoDetailsModel[]>([
//         "influencer-new-promos",
//       ]);

//       // 3. Убираем карточку сразу
//       queryClient.setQueryData<IPromoDetailsModel[]>(["influencer-new-promos"], (old = []) =>
//         old.filter(
//           (promo) =>
//             !(
//               promo.campaignId === variables.campaignId &&
//               promo.addedAccountsId === variables.addedAccountsId
//             ),
//         ),
//       );

//       // 4. Вернём это, если будет ошибка
//       return { previousPromos };
//     },

//     // ❌ если ошибка — откат
//     onError: (_err, _variables, context) => {
//       if (context?.previousPromos) {
//         queryClient.setQueryData<IPromoDetailsModel[]>(
//           ["influencer-new-promos"],
//           context.previousPromos,
//         );
//       }
//     },

//     // ✅ успех
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["influencer-new-promos"],
//       });
//     },
//   });
// };
