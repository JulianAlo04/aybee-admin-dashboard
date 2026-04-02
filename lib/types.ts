// Raw shapes from the Aybee Platform API
export interface Company {
  _id: string;
  name: string;
  nameLowercase?: string;
  status: "Registered" | "As you go" | "Package Customer" | "One-Off";
  numberCredits: number;
  allowOvercharge?: boolean;
  "OS Credit Package"?: string;
  "OS Schedule Renew"?: string;
  "Credit Packages"?: string[];
  "Credit Transactions"?: string[];
  Transactions?: string[];
}

export interface CreditPackage {
  _id: string;
  "OS Credit Package": "As you go" | "Business" | "Explorer" | "Team" | "Custom/Enterprise";
  "OS Credit Package Status": "Active" | "Done";
  initialCredits?: number;
  remainingCredits: number;
  creditPrice?: number;
  totalCost?: number;
  startDate?: string;
  renewalDate?: string;
  "OS Schedule Renew"?: string;
  companyNameLowercase?: string;
  "Company Search Satellite"?: string;
  "Credit Transactions"?: string[];
}

export interface CreditTransaction {
  _id: string;
  creditAmount: number;
  "CreditTransaction Type": "Buy" | "Use";
  Info?: string;
  Company?: string;
  User?: string;
  "Created Date": string;
  "Modified Date"?: string;
}

// Normalized shapes returned by internal API routes
export interface CompanyRow {
  id: string;
  name: string;
  status: string;
  creditBalance: number;
  packageTier: string;
}

export interface PackageRow {
  id: string;
  companyName: string;
  tier: string;
  status: string;
  initialCredits: number;
  remainingCredits: number;
  usedPercent: number;
  renewalDate?: string;
}

export interface BurnDataPoint {
  date: string; // "YYYY-MM-DD"
  creditsUsed: number;
  creditsBought: number;
}

// API route response envelopes
export interface CompaniesResponse {
  companies: CompanyRow[];
  totalCount: number;
}

export interface PackagesResponse {
  packages: PackageRow[];
  activeCount: number;
}

export interface TransactionsResponse {
  burnSeries: BurnDataPoint[];
  todayUsed: number;
  totalCreditsInSystem: number;
}
