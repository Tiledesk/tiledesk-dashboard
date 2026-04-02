export const MOCK_BRAND = {
  BRAND_NAME: 'TestBrand',
  CUSTOM_COMPANY_HOME_LOGO: '',
  BASE_LOGO_NO_TEXT: '',
  'display-news-and-documentation': 'true',
  CONTACT_SALES_EMAIL: 'sales@test.local'
};

export class BrandServiceStub {
  getBrand() {
    return { ...MOCK_BRAND };
  }
}
