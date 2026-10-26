export const config = {
  port: Number(process.env.PORT) || 3000,
  isProd: process.env.NODE_ENV === 'production',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS) || 7,
  paymentProvider: process.env.PAYMENT_PROVIDER || 'dummy',
  taxRate: 0.11, // PPN 11%
  company: {
    name: 'PT Artha Pramana Prakasa',
    email: 'ptarthapramanaprakasa@gmail.com',
    phone: '087796084428',
    whatsapp: '6287796084428',
  },
};
