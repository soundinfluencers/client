import './_invoice-page.scss'
import { Breadcrumbs, Container, Form } from "../../../components";
import { InvoiceFormContent } from './components/invoice-form-content/InvoiceFormContent';
import { invoicePayloadSchema } from './components/invoice-form-content/validation/schema';

export const InvoicePage = () => {
  return (
    <Container className="invoice-page">
      <Breadcrumbs />

      <h2 className="invoice-page__title">Payment method</h2>

      <Form
        className='invoice-page__form'
        schema={invoicePayloadSchema as any}
      >
        <InvoiceFormContent />
      </Form>
    </Container>
  );
};