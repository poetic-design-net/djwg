export interface Partner {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description?: string;
  logo?: {
    asset: {
      _ref: string;
      _type: 'reference';
      url?: string;
    };
  };
  video?: {
    asset: {
      _ref: string;
      _type: 'reference';
      url?: string;
    };
  };
  website?: string;
  showWebsiteWithoutBadge?: boolean;
  discountCode?: string;
  discountDescription?: string;
  email?: string;
  emailSubject?: string;
  emailBody?: string;
  isActive: boolean;
  orderRank?: number;
}