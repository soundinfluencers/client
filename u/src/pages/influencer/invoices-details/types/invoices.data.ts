import type { IInvoiceDetailsItem } from "./invoice";

//generate mock data for invoice details table
export const mockInvoiceDetailsData: IInvoiceDetailsItem[] = [
  {
    invoiceId: 'INV-1001',
    dateIssued: '2024-01-15',
    paymentMethod: 'Credit Card',
    amount: 150000, // $1500.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1002',
    dateIssued: '2024-02-10',
    paymentMethod: 'PayPal',
    amount: 75000, // $750.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1003',
    dateIssued: '2024-03-05',
    paymentMethod: 'Bank Transfer',
    amount: 200000, // $2000.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1004',
    dateIssued: '2024-04-12',
    paymentMethod: 'Credit Card',
    amount: 50000, // $500.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1005',
    dateIssued: '2024-05-20',
    paymentMethod: 'PayPal',
    amount: 120000, // $1200.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1006',
    dateIssued: '2024-06-18',
    paymentMethod: 'Bank Transfer',
    amount: 300000, // $3000.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1007',
    dateIssued: '2024-07-22',
    paymentMethod: 'Credit Card',
    amount: 90000, // $900.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1008',
    dateIssued: '2024-08-30',
    paymentMethod: 'PayPal',
    amount: 110000, // $1100.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1009',
    dateIssued: '2024-09-14',
    paymentMethod: 'Bank Transfer',
    amount: 250000, // $2500.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1010',
    dateIssued: '2024-10-05',
    paymentMethod: 'Credit Card',
    amount: 130000, // $1300.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
  {
    invoiceId: 'INV-1011',
    dateIssued: '2024-11-11',
    paymentMethod: 'PayPal',
    amount: 80000, // $800.00
    status: 'submitted',
    description: 'Payment Due: 7 days (subject to approval)'
  },
];