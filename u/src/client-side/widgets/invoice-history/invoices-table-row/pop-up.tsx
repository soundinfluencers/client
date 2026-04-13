import React from "react";
import { Modal } from "@/components/ui/modal-fix/Modal";
import logo from './assets/logo.png'
import mail from './assets/mail.svg'
import phone from './assets/phone.svg'
import bank from './assets/image 20.png'
import card from './assets/image 20 (1).png'
import paypal from './assets//image 20 (2).png'
import { getInvoiceById, patchInvoiceById } from "@/api/client/invoice/invoice.api";
import { toast } from "react-toastify";
import './_table-row.scss'
import {formatFollowers} from "@/utils/functions/formatFollowers.ts";
type InvoiceDetails = {
    invoiceId: string;
    creationDate: string;
    amount: string;
    fullName: string;
    country: string;
    address: string;
    campaignName: string;
    company: string;
    poNumber: string;
    campaignFollowers: number
};
type Props = {
    invoiceId: string;
    onClose: () => void;
    onSaved?: () => void;
};

type InvoiceForm = {
    poNumber: string;
    company: string;
    address: string;
    country: string;
    vatNumber: string
};

export const EditInvoiceModal = ({ invoiceId, onClose, onSaved }: Props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [invoice, setInvoice] = React.useState<InvoiceDetails | null>(null);
    const [initialForm, setInitialForm] = React.useState<InvoiceForm>({
        poNumber: "",
        company: "",
        address: "",
        country: "",
        vatNumber: ""
    });

    const [form, setForm] = React.useState<InvoiceForm>({
        poNumber: "",
        company: "",
        address: "",
        country: "",
        vatNumber: ""
    });
    const isChanged =
        form.poNumber !== initialForm.poNumber ||
        form.company !== initialForm.company ||
        form.address !== initialForm.address ||
        form.country !== initialForm.country ||
        form.vatNumber !== initialForm.vatNumber;
    React.useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getInvoiceById(invoiceId);
                console.log(data,'datadatadata');
                if (!mounted) return;

                setInvoice(data);

                const nextForm = {
                    poNumber: data?.poNumber ?? "",
                    company: data?.company ?? "",
                    address: data?.address ?? "",
                    country: data?.country ?? "",
                    vatNumber: data?.vatNumber ?? "",
                };

                setForm(nextForm);
                setInitialForm(nextForm);
            } catch (error) {
                console.log(error);
                toast.error("Failed to load invoice");
                onClose();
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [invoiceId, onClose]);

    const setField = (field: keyof InvoiceForm, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const onSubmit = async () => {
        if (!isChanged) {
            onClose();
            return;
        }

        try {
            setIsSaving(true);

            await patchInvoiceById(invoiceId, {
                poNumber: form.poNumber,
                company: form.company,
                address: form.address,
                country: form.country,
                vatNumber: form.vatNumber
            });

            toast.success("Invoice updated successfully");
            onSaved?.();
            onClose();
        } catch (error) {
            console.log(error);
            toast.error("Failed to update invoice");
        } finally {
            setIsSaving(false);
        }
    };
    const header = [
        "Item Description",
        "Project",
        "PO",
        "Reach",
        "Total",
    ];
    const bankDetails = [
        {
            region: "USA",
            fields: [
                { label: "Account number", value: "210854303917" },
                { label: "Routing number", value: "101019644" },
            ],
        },
        {
            region: "UK",
            fields: [
                { label: "Account number", value: "17299128" },
                { label: "Sort code", value: "04-00-75" },
            ],
        },
        {
            region: "EU / International",
            fields: [
                { label: "IBAN", value: "GB47REVO000996994280983" },
                { label: "BIC", value: "REVOGB21" },
            ],
        },
    ];
    const paymentDetails = [
        {
            icon: card,
            title: "Card Payments details",
            fields: [
                {
                    label: "Revolut link",
                    value: "https://revolut.me/technotvltd",
                },
            ],
        },
        {
            icon: paypal,
            title: "Paypal Payment details",
            fields: [
                {
                    label: "Paypal Email",
                    value: "admin@soundinfluencers.com",
                },
            ],
        },
    ];
    const items = React.useMemo(() => {
        if (!invoice) return [];

        return [
            {
                id: invoice.invoiceId ?? "1",
                description: "Influencer Marketing Campaign",
                brand: form.company || invoice.company || "—",
                project: invoice.campaignName || "—",
                poNumber: form.poNumber || "—",
                reach: invoice.campaignFollowers || "—",
                total: invoice.amount ? `${invoice.amount}€` : "—",
            },
        ];
    }, [invoice, form.company, form.poNumber]);
    const renderValue = (value: string) => {
        if (!value) return "-";


        if (value.includes("@") && !value.startsWith("http")) {
            return (
                <a href={`mailto:${value}`} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            );
        }


        if (value.startsWith("http")) {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            );
        }

        return value;
    };
    return (
        <Modal onClose={onSubmit} >
           <div className='edit-invoicePopUp'>
               <div className='edit-invoicePopUp__logo'>
                   <img src={logo} alt=""/>
               </div>
               <div className='edit-invoicePopUp__header'>
                   <h2>INVOICE</h2>
                   <p>{invoice?.creationDate ?? "—"}</p>
               </div>
               <div className='edit-invoicePopUp__first'>
                   <div className='edit-invoicePopUp__from'>
                       <h3>From:</h3>
                      <div className='edit-invoicePopUp__flex'>

                          <h4>Techno TV Ltd</h4>
                          <p>124 City Road</p>
                          <p>London, EC1V 2NX</p>
                          <p>United Kingdom</p>
                          <p>Company No: 10458319</p>
                          <div className='edit-invoicePopUp__from-iconWrapper'>
                              <img src={mail} alt=""/>
                              <p>
                                  Email:{" "}
                                  <a href="mailto:admin@soundinfluencers.com">
                                      admin@soundinfluencers.com
                                  </a>
                              </p>
                          </div>
                          <div className='edit-invoicePopUp__from-iconWrapper'>
                              <img src={phone} alt=""/>
                              <p>
                                  Phone:{" "}
                                  <a href="tel:+447537129190">
                                      +44 7537 129190
                                  </a>
                              </p>
                          </div>
                      </div>
                   </div>
                   <div className='edit-invoicePopUp__to'>
                       <h3>To:</h3>
                       <div className='edit-invoicePopUp__flex'>
                           <input
                               value={form.company}
                               onChange={(e) => setField("company", e.target.value)}
                               placeholder="Company"
                           />
                           <input
                               value={form.address}
                               onChange={(e) => setField("address", e.target.value)}
                               placeholder="Address"
                           />
                           <input
                               value={form.country}
                               onChange={(e) => setField("country", e.target.value)}
                               placeholder="Country"
                           />
                           <input
                               value={form.vatNumber}
                               onChange={(e) => setField("vatNumber", e.target.value)}
                               placeholder="vatNumber"
                           />
                       </div>
                   </div>
               </div>
               <div className='edit-invoicePopUp__balance'>
                   <div className='edit-invoicePopUp__balance-due-balance'>
                       <h2>Balance Due</h2>
                       <p>Upon Receipt</p>
                   </div>
                   <div className='edit-invoicePopUp__balance-total'>
                       <h4>Total Due:</h4>
                       <p>{invoice?.amount ? `${invoice.amount}€` : "—"}</p>
                   </div>
               </div>
               <div className="invoice-grid">

                   <div className="edit-invoicePopUp__grid header-edit">
                       {header.map((h) => (
                           <div key={h}><p>{h}</p></div>
                       ))}

                   </div>
                   <div className='popup-edit-row'></div>
                    <div className="content-edit-popup">
                        {items.map((item) => (
                            <div key={item.id} className="edit-invoicePopUp__grid ">
                                <div><p>{item.description}</p></div>
                                <div><p>{item.project}</p></div>
                                <div className="po">
                                    <input
                                        value={form.poNumber}
                                        onChange={(e) => setField("poNumber", e.target.value)}
                                    />
                                </div>
                                <div><p>{formatFollowers(item.reach)}</p></div>
                                <div><p>{item.total}</p></div>
                            </div>
                        ))}
                    </div>


                   <div className='popup-edit-row'></div>
                   <div className="invoice-total-edit">
                       <span>Total:</span>
                       <span>{invoice?.amount ? `${invoice.amount}€` : "—"}</span>
                   </div>
               </div>
               <div className='edit-invoicePopUp-payment'>
                   <h2>Payment Information</h2>
                   <div className='edit-invoicePopUp-payment-block'>
                       <div className='edit-invoicePopUp-payment-block-iconWrapper'>
                           <img src={bank} alt=""/>
                           <h4>Bank Transfer details:</h4>
                       </div>
                       <div className='edit-invoicePopUp-payment-block-recipient'>
                           <div className='edit-invoicePopUp-payment-block-recipient-first'>
                               <p>Recipient:</p>
                               <p>Recipient address:</p>
                           </div>
                           <div className='edit-invoicePopUp-payment-block-recipient-second'>
                               <p>TECHNO TV LTD</p>
                               <p>124 City Road, City Road, EC1V 2NX, London, United Kingdom</p>
                           </div>
                       </div>
                       <div className='edit-invoicePopUp-payment-block-cards'>
                           {bankDetails.map((item,i) => (
                               <div key={i} className='edit-invoicePopUp-payment-block-cards-card'>
                                   <h3>{item.region}</h3>
                                   <ul>
                                       {item.fields.map((item,i) => (
                                           <li key={i}>{item.label}: <span>{item.value}</span></li>
                                       ))}
                                   </ul>
                               </div>
                           ))}
                       </div>
                   </div>
                   <div className='edit-invoicePopUp-payment-footer'>
                       {paymentDetails.map((item,i) => (
                           <div key={i} className='edit-invoicePopUp-payment-footer-card'>
                               <div className='edit-invoicePopUp-payment-footer-card-iconWrapper'>
                                   <img src={item.icon} alt=""/>
                                   <p>{item.title}:</p>
                               </div>
                               <ul>
                                   {item.fields.map((item,i) => (
                                       <li key={i}>
                                           {item.label}: <span>{renderValue(item.value)}</span>
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
        </Modal>
    );
};