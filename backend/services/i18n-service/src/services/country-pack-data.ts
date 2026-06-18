export interface CountryPackSeed {
  countryCode: string;
  name: string;
  currency: string;
  locale: string;
  taxRules: Record<string, unknown>;
  compliancePack: Record<string, unknown>;
}

export const COUNTRY_PACK_SEEDS: CountryPackSeed[] = [
  {
    countryCode: 'IN',
    name: 'India',
    currency: 'INR',
    locale: 'en-IN',
    taxRules: {
      gst: { standardRate: 18, reducedRate: 5, exemptCategories: ['healthcare_diagnostics'] },
      tds: { section194J: 10 },
      invoiceFormat: 'GST_INVOICE',
    },
    compliancePack: {
      regulator: 'NABL',
      dataResidency: 'IN',
      languages: ['en', 'hi'],
    },
  },
  {
    countryCode: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    locale: 'ar-AE',
    taxRules: {
      vat: { standardRate: 5, exemptCategories: ['healthcare'] },
      invoiceFormat: 'VAT_INVOICE',
    },
    compliancePack: {
      regulator: 'DHA',
      dataResidency: 'AE',
      languages: ['ar', 'en'],
    },
  },
  {
    countryCode: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    locale: 'ar-SA',
    taxRules: {
      vat: { standardRate: 15, exemptCategories: ['healthcare'] },
      zakat: { applicable: false },
      invoiceFormat: 'ZATCA_EINVOICE',
    },
    compliancePack: {
      regulator: 'SFDA',
      dataResidency: 'SA',
      languages: ['ar', 'en'],
    },
  },
  {
    countryCode: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    locale: 'en-SG',
    taxRules: {
      gst: { standardRate: 9, exemptCategories: ['healthcare'] },
      invoiceFormat: 'GST_INVOICE',
    },
    compliancePack: {
      regulator: 'HSA',
      dataResidency: 'SG',
      languages: ['en', 'zh'],
    },
  },
  {
    countryCode: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    locale: 'en-GB',
    taxRules: {
      vat: { standardRate: 20, reducedRate: 5, exemptCategories: ['healthcare'] },
      invoiceFormat: 'VAT_INVOICE',
    },
    compliancePack: {
      regulator: 'CQC',
      dataResidency: 'GB',
      languages: ['en'],
    },
  },
];
