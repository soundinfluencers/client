import './_invoice-page.scss'
import { Breadcrumbs, Container, Form } from "../../../components";
import { InvoiceFormContent } from './components/invoice-form-content/InvoiceFormContent';
import { ButtonMain } from '../../../components/ui/buttons-fix/ButtonFix';

/*
  TODO: 2) Change button in form component
        3) Add validation to form inputs
        4) Implement form submission logic
        5) Add content for modal message after form submission
        need fix structure + types, add button submit, connect api.
*/
export const InvoicePage = () => {
  return (
    <Container className="invoice-page">
      <Breadcrumbs />

      <h2 className="invoice-page__title">Payment method</h2>

      <Form
        className='invoice-page__form'
        submitButton={<ButtonMain label="Submit Invoice" type="submit" />}
        onSubmit={() => { }}
      >
        <InvoiceFormContent />
      </Form>
    </Container>
  );
};