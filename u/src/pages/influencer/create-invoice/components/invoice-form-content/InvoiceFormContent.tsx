import './_invoice-form-content.scss'
import { useEffect, useState } from "react";
import { PaymentBar } from "../payment-bar/PaymentBar";
import { useFormContext } from "react-hook-form";
import { FormFields } from '../../../../../components/form/render-fields/FormFields';
import type { TInvoicePaymentMethod } from '../payment-bar/types/payment-method.types';
import { INVOICE_DETAILS_INPUTS_DATA, PAYMENT_METHOD_FIELDS_MAP, PAYMENT_METHOD_INPUTS_DATA } from './data/imvoice-form-inputs.data';
import { getInvoicePaymentMethodLabel } from '../payment-bar/data/payment-method.data';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';
import { Modal } from '@/components/ui/modal-fix/Modal';
import { useNavigate } from 'react-router-dom';
import type { InvoiceFormValues } from './types/invoice-form-inputs.types';
import { requestDtoMapper } from './utils/invoice-form.mapper';
import { createInvoice } from '@/api/influencer/create-invoice/create-invoice.api';

export const InvoiceFormContent = () => {
  const { resetField, handleSubmit, setValue } = useFormContext<InvoiceFormValues>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TInvoicePaymentMethod>("ukBankTransfer");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue('selectedPaymentMethod', tab, { shouldValidate: true });
  }, [tab, setValue]);

  const handleTabChange = (newTab: TInvoicePaymentMethod) => {
    if (newTab === tab) return;

    PAYMENT_METHOD_FIELDS_MAP[tab].forEach((fieldName) => {
      resetField(fieldName as keyof InvoiceFormValues, { keepError: false });
    });

    setTab(newTab);
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsLoading(true);
    try {
      const dto = requestDtoMapper(data);
      await createInvoice(dto);
      console.log("Submitted invoice data:", dto);
      setIsModalOpen(true);
      //TODO: reset form if needed
    } catch (error) {
      console.error("Error submitting invoice:", error);
      //TODO: show some error toast message
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="invoice-form-content">
      <div className='invoice-form-content__wrapper'>
        <PaymentBar tab={tab} onChange={handleTabChange} />

        <section className='invoice-form-content__inputs-block'>
          <section className='invoice-form-content__inputs'>
            <h3 className='invoice-form-content__title'>Invoice details</h3>
            <FormFields inputs={INVOICE_DETAILS_INPUTS_DATA.inputs} />
          </section>

          <section className='invoice-form-content__inputs'>
            <h3 className='invoice-form-content__title'>{getInvoicePaymentMethodLabel(tab)}</h3>
            <FormFields inputs={PAYMENT_METHOD_INPUTS_DATA[tab].inputs} />
          </section>
        </section>
      </div>

      <div className='invoice-form-content__submit-button'>
        <ButtonMain
          label={isLoading ? "Submitting..." : "Submit Invoice"}
          type="submit"
          onClick={handleSubmit(onSubmit)}
          isDisabled={isLoading}
        />
      </div>

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
        >
          <div className='invoice-form-content__modal'>
            <div className='invoice-form-content__modal-header'>
              <h2 className='invoice-form-content__modal-header-title'>Invoice submitted successfully</h2>
              <div className='invoice-form-content__modal-header-description-block'>
                <p className='invoice-form-content__modal-header-description'>
                  Thank you for your submission. Our usual payment processing time is <strong>1–7 business days</strong>.
                </p>
                <p className='invoice-form-content__modal-header-description'>You’ll be notified once the payment is completed or if there’s any issue with your payment details.</p>
                <p className='invoice-form-content__modal-header-description'>We appreciate your collaboration and look forward to working together on upcoming campaigns.</p>
              </div>
            </div>
            <div className='invoice-form-content__modal-actions-block'>
              <h3 className='invoice-form-content__modal-actions-title'>Continue to:</h3>
              <div className='invoice-form-content__modal-actions'>
                <ButtonMain
                  label="Home Page"
                  onClick={() => {
                    navigate('/');
                    setIsModalOpen(false);
                  }}
                />
                <ButtonMain
                  label="My Invoices"
                  onClick={() => {
                    navigate('/influencer/invoices');
                    setIsModalOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};