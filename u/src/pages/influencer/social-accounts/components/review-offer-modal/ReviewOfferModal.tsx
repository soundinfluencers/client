import { Modal } from "@components/ui/modal-fix/Modal.tsx";
import { useSocialAccountStatusStore } from "@/pages/influencer/social-accounts/store/store.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountAgreementAccept, getAccountAgreement } from "@/api/influencer/agreement/agreement.api.ts";
import { getSocialIcon } from "@/pages/influencer/components/social-accounts-list/data/social-account.data.ts";
import { getArticle } from "@/pages/influencer/agreement/utils/getArticlesForAgreement.ts";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { Link } from "react-router-dom";

import { handleApiError } from "@/api/error.api.ts";
import { toast } from "react-toastify";

import './_review-offer-modal.scss';

export const ReviewOfferModal = () => {
  const { onCloseModal, accountId, socialMedia } = useSocialAccountStatusStore();
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: ['offerDetails', accountId],
    queryFn: () => getAccountAgreement(accountId),
  });

  const { mutateAsync, isPending: isMutatePending } = useMutation({
    mutationKey: ['acceptOffer', accountId],
    mutationFn: () => accountAgreementAccept('accept', accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["influencerProfile"] });
      onCloseModal();
      toast.success('Offer accepted successfully!');
    },
    onError: handleApiError,
  })

  console.log(data);
  console.log(accountId);
  console.log(socialMedia);

  return (
    <Modal
      onClose={onCloseModal}
    >
      {isPending ? (
        <div
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Loading...
        </div>
      ) : isError ? (
        <p style={{ textAlign: "center", marginTop: "50px", fontSize: "40px" }}>
          Unable to load offer details. Please try again later.
        </p>
      ) : (
        <div className={'review-offer'}>
          <div className="review-offer__title-inner">
            <h2 className="review-offer__title">Congratulations</h2>
            <p className="review-offer__subtitle">Your new social media accounts have been approved.</p>
          </div>

          <div className="review-offer__content">
            <h3 className="review-offer__content-title">Here’s what you’ll earn</h3>

            <div className="review-offer__account">
              <div className="review-offer__account-info">
                <img
                  src={getSocialIcon(socialMedia) ?? ''}
                  alt={socialMedia ?? ''}
                />
                <p>{data.username}</p>
              </div>
              <p className="review-offer__account-benefits">
                {`${data.price}\u20AC ${getArticle(socialMedia)}`}
              </p>
            </div>

            <div className="review-offer__info">
              <h2 className="review-offer__earnings">{`Estimated total earnings: ${data.price}\u20AC`}</h2>
              <div className="review-offer__conformation">
                <h3
                  className="review-offer__conformation-title">{'Do you want to add these new pages to your account with the agreed fees?'}</h3>
                <div className="review-offer__conformation-cta">
                  <ButtonMain
                    label={isMutatePending ? 'Processing...' : 'Yes'}
                    isDisabled={isMutatePending}
                    onClick={mutateAsync}
                  />

                  <Link
                    to={'/influencer/negotiation'}
                    className="review-offer__negotiation"
                    state={{
                      accountId,
                      socialMedia,
                    }}
                  >
                    No, Review Details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <span className="review-offer__terms">
            By clicking Yes, you confirm and approve the rates listed above and agree to our
            <br />
            <a
              href="/terms/influencer"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "black" }}
            >
              Terms & Conditions.
            </a>
          </span>
        </div>
      )}
    </Modal>
  );
};
