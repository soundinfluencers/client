import './_contact-support.scss';
import { Breadcrumbs, Container } from "@/components";

export const ContactSupport = () => {
  return (
    <Container className="contact-support">
      <Breadcrumbs />

      <div className="contact-support__content">
        <h2 className="contact-support__title">Contact Support</h2>

        <ul className="contact-support__list">
          {CONTACT_SUPPORT_DATA.map((item, index) => (
            <li key={index} className="contact-support__item">
              <span className="contact-support__label">{item.label}</span>
              {item.type === 'email' ? (
                <a href={`mailto:${item.value}`} className="contact-support__value">{item.value}</a>
              ) : (
                <a href={item.value} target="_blank" rel="noopener noreferrer" className="contact-support__value">{item.value}</a>
              )}
            </li>
          ))}
        </ul>

      </div>
    </Container>
  );
}

const CONTACT_SUPPORT_DATA: IContactSupportData[] = [
  {
    type: 'email',
    label: 'Email',
    value: 'admin@soundinfluencers.com',
  },
  {
    type: 'link',
    label: 'WhatsApp',
    value: 'https://wa.me/message/V45DFREUPS3BA1',
  },
  {
    type: 'link',
    label: 'Telegram',
    value: 'https://telegram.me/soundinfluencers',
  },
];

export interface IContactSupportData {
  type: 'email' | 'link';
  label: string;
  value: string;
}