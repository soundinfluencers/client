// Visual JSX return from rescue 551dfc76fe2c59121197153ccce89f899d4ad267.
// Fixture binds display state only; no historical API or mutation logic.
import React from 'react';
import {Breadcrumbs,ButtonMain,Container,SubmitButton} from '@/components';
import {PaymentBar} from '@/client-side/widgets';import {PaymentForm} from '@/client-side/client-forms';
import {FormPayment} from '@components/form/form-payment.tsx';import {Modal} from '@/shared/ui/modal-fix/Modal';
import {PAYMENT_CAMPAIGN_TABS} from '@/client-side/data/payment-campaign-tabs';import {PAYMENT_CAMPAIGN_TABS_INPUTS} from '@/client-side/constants/payment-campaign-tabs.inputs';
import {paymentCampaignSchema} from '@/client-side/schemas';import '@/client-side/pages/payment-campaign/_payment-campaign.scss';
type PaymentCampaignFormValues=any;
export const HistoricalPayment=()=>{
 const [tab,handleTabChange]=React.useState('bank_card');const [currency,selectTransferCurrency]=React.useState(null);const[modalCompleted,setModalCompleted]=React.useState(false);
 const selectedCurrency='$',paymentCurrencySymbol='$',paymentAmount=837,referenceNumber='FIXTURE',isPaymentSubmitting=false;
 const defaultValues={firstName:'Fixture',lastName:'Client',address:'Address',country:'Germany',company:'',vatNumber:''};const onSent=()=>{},navigate=()=>{};
 const transferOptions=[{name:'UK',id:'bank_transfer_uk'},{name:'EU',id:'bank_transfer_eu'},{name:'International',id:'bank_transfer_international'}];
 const CurrentConfirmation=PAYMENT_CAMPAIGN_TABS.find(t=>t.id===tab)?.component;
  return (
      <Container className="payment-campaign">
        <div className="navmenu">
          <Breadcrumbs />
        </div>

        <h1>Payment method</h1>

        <div className="payment-campaign__content">
          <div className="payment-campaign__form">
            <PaymentBar
                data={PAYMENT_CAMPAIGN_TABS}
                tab={tab}
                onChange={handleTabChange}
            />
            <FormPayment<PaymentCampaignFormValues>
                schema={paymentCampaignSchema}
                onSubmit={onSent}
                defaultValues={defaultValues}
                classNameBtnSection={tab === "bank_transfer" ? "margin" : ""}
                submitButton={
                  <SubmitButton
                      className="btn-margin"
                      data="Confirm payment sent"
                  />
                }
                className="payment-campaign__width"
            >
              <div className="payment-campaign__form-flex">



                <div className="payment-campaign__form-flex-width">
                  {tab === "bank_transfer" && (
                      <ul className="ul-BankTransfer">
                        {transferOptions.map((cr) => (
                            <li
                                key={cr.id}
                                className={currency === cr.id ? "active" : ""}
                                onClick={() => selectTransferCurrency(cr.id)}
                            >
                              {cr.name}
                            </li>
                        ))}
                      </ul>
                  )}
                  <div className="payment-campaign__confirmation">
                    {CurrentConfirmation && (
                        <CurrentConfirmation
                            currencySymbol={paymentCurrencySymbol}
                            currency={currency ? [currency] : []}
                            referenceNumber={referenceNumber}
                            isSubmitting={isPaymentSubmitting}
                            amount={paymentAmount}
                        />
                    )}
                  </div>
                  <div className="payment-campaign__invoice">
                    <h3>Invoice details</h3>
                  </div>



                  <PaymentForm data={PAYMENT_CAMPAIGN_TABS_INPUTS} />
                </div>
              </div>


            </FormPayment>
          </div>
        </div>

        {modalCompleted && (
            <Modal
                addStyles="content-width"
                onClose={() => {
                  setModalCompleted(false);
                  navigate("/client");
                }}
            >
              <div className="modal-payment">
                <h2>Campaign Received</h2>
                <h3>Thanks for your payment!</h3>
                <p>
                  We are reviewing your campaign and will notify you once it&apos;s
                  approved and sent to distribution.
                </p>
                <ButtonMain
                    className="btn"
                    text="Ok"
                    onClick={() => {
                      setModalCompleted(false);
                      navigate("/client");
                    }}
                />
              </div>
            </Modal>
        )}
      </Container>
  );
};
