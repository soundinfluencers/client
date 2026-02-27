import './_contact-support.scss';
import { Breadcrumbs, Container } from "@/components";

export const ContactSupport = () => {
  const normalizeEmail = (s: string) => s.trim().replace(/\s+/g, "");
  const buildMailto = (email: string) => `mailto:${normalizeEmail(email)}`;
  // mailto:admin@soundinfluencers.com?subject=Support%20Request
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
                <a
                  href={buildMailto(item.value)}
                  className="contact-support__value"
                  onClick={(e) => {
                    // Prevent default mailto behavior to ensure it works across all browsers
                    e.preventDefault();
                    if (e.defaultPrevented) {
                      window.location.href = buildMailto(item.value);
                    }
                    // console.log("mailto click", { defaultPrevented: e.defaultPrevented });
                  }}
                >
                  {item.value}
                </a>
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