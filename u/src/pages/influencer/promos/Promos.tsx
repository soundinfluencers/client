import './_promos.scss';

import { Container } from "../../../components/container/container";
import { NewPromos } from './new-promos/NewPromos';
import { Distributing } from './distributing/Distributing';
import { Completed } from './completed/Completed';

export const Promos = () => {
  return (
    <Container className="promos-page">
      <div style={{ marginBottom: 40 }}>Breadcrumbs</div>

      {/* <NewPromos /> */}
      <Distributing />
      {/* <Completed /> */}
    </Container>
  );
}