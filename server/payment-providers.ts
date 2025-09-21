import { randomUUID } from "crypto";

// Nigerian Payment Provider Interface
export interface IPaymentProvider {
  name: string;
  supportedMethods: ('bank_account' | 'mobile_money' | 'card')[];
  
  // Basic operations
  validateBankAccount(accountNumber: string, bankCode: string): Promise<{ valid: boolean; accountName?: string; error?: string }>;
  initializePayment(amount: number, email: string, reference?: string): Promise<{ success: boolean; authorization_url?: string; reference?: string; error?: string }>;
  verifyPayment(reference: string): Promise<{ success: boolean; status?: string; amount?: number; error?: string }>;
  
  // Payout operations
  createTransferRecipient(accountNumber: string, bankCode: string, accountName: string): Promise<{ success: boolean; recipient_code?: string; error?: string }>;
  initiateTransfer(amount: number, recipientCode: string, reference?: string): Promise<{ success: boolean; transfer_code?: string; error?: string }>;
  verifyTransfer(reference: string): Promise<{ success: boolean; status?: string; error?: string }>;
  
  // Bank operations
  getBankList(): Promise<{ success: boolean; banks?: Array<{ name: string; code: string; slug?: string }>; error?: string }>;
  resolveAccountNumber(accountNumber: string, bankCode: string): Promise<{ success: boolean; account_name?: string; error?: string }>;
}

// Nigerian Bank Codes (Top banks)
export const NIGERIAN_BANKS = {
  '044': 'Access Bank',
  '014': 'Afribank Nigeria Plc',
  '050': 'Ecobank Nigeria',
  '070': 'Fidelity Bank',
  '011': 'First Bank',
  '214': 'FCMB',
  '058': 'Guaranty Trust Bank',
  '030': 'Heritage Bank',
  '082': 'Keystone Bank',
  '076': 'Polaris Bank',
  '221': 'Stanbic IBTC Bank',
  '068': 'Standard Chartered Bank',
  '232': 'Sterling Bank',
  '033': 'United Bank For Africa',
  '032': 'Union Bank',
  '035': 'Wema Bank',
  '057': 'Zenith Bank',
  '215': 'Unity Bank',
  '090175': 'Rubies MFB', // Mobile money
  '100002': 'Paga', // Mobile money
  '120001': 'Opay', // Mobile money
  '999991': 'PalmPay', // Mobile money
  '50515': 'Kuda Bank', // Digital bank
};

// Paystack Provider Implementation
export class PaystackProvider implements IPaymentProvider {
  name = "Paystack";
  supportedMethods: ('bank_account' | 'mobile_money' | 'card')[] = ['bank_account', 'card'];
  private secretKey: string;
  private publicKey: string;
  
  constructor(secretKey: string = 'sk_test_placeholder', publicKey: string = 'pk_test_placeholder') {
    this.secretKey = secretKey;
    this.publicKey = publicKey;
  }

  async validateBankAccount(accountNumber: string, bankCode: string): Promise<{ valid: boolean; accountName?: string; error?: string }> {
    // Placeholder implementation - would use actual Paystack API
    try {
      // Basic validation
      if (!accountNumber || !bankCode) {
        return { valid: false, error: "Account number and bank code are required" };
      }
      
      if (accountNumber.length < 10 || accountNumber.length > 10) {
        return { valid: false, error: "Account number must be exactly 10 digits" };
      }
      
      if (!NIGERIAN_BANKS[bankCode as keyof typeof NIGERIAN_BANKS]) {
        return { valid: false, error: "Invalid bank code" };
      }
      
      // Simulate API call
      const accountName = `Test Account ${accountNumber.slice(-4)}`;
      return { valid: true, accountName };
    } catch (error) {
      return { valid: false, error: "Bank validation failed" };
    }
  }

  async initializePayment(amount: number, email: string, reference?: string): Promise<{ success: boolean; authorization_url?: string; reference?: string; error?: string }> {
    try {
      const paymentReference = reference || `ref-${randomUUID()}`;
      
      // Placeholder - would make actual API call to Paystack
      return {
        success: true,
        authorization_url: `https://checkout.paystack.com/${paymentReference}`,
        reference: paymentReference
      };
    } catch (error) {
      return { success: false, error: "Payment initialization failed" };
    }
  }

  async verifyPayment(reference: string): Promise<{ success: boolean; status?: string; amount?: number; error?: string }> {
    try {
      // Placeholder - would verify with Paystack API
      return {
        success: true,
        status: 'success',
        amount: 100000 // Example amount in kobo
      };
    } catch (error) {
      return { success: false, error: "Payment verification failed" };
    }
  }

  async createTransferRecipient(accountNumber: string, bankCode: string, accountName: string): Promise<{ success: boolean; recipient_code?: string; error?: string }> {
    try {
      // Validate inputs
      const validation = await this.validateBankAccount(accountNumber, bankCode);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Placeholder - would create actual recipient
      const recipientCode = `RCP_${randomUUID().replace(/-/g, '').substring(0, 10)}`;
      return { success: true, recipient_code: recipientCode };
    } catch (error) {
      return { success: false, error: "Recipient creation failed" };
    }
  }

  async initiateTransfer(amount: number, recipientCode: string, reference?: string): Promise<{ success: boolean; transfer_code?: string; error?: string }> {
    try {
      const transferReference = reference || `tf-${randomUUID()}`;
      
      // Placeholder - would initiate actual transfer
      return {
        success: true,
        transfer_code: `TRF_${randomUUID().replace(/-/g, '').substring(0, 10)}`
      };
    } catch (error) {
      return { success: false, error: "Transfer initiation failed" };
    }
  }

  async verifyTransfer(reference: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      // Placeholder - would verify transfer status
      return { success: true, status: 'success' };
    } catch (error) {
      return { success: false, error: "Transfer verification failed" };
    }
  }

  async getBankList(): Promise<{ success: boolean; banks?: Array<{ name: string; code: string; slug?: string }>; error?: string }> {
    try {
      const banks = Object.entries(NIGERIAN_BANKS).map(([code, name]) => ({
        name,
        code,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }));
      
      return { success: true, banks };
    } catch (error) {
      return { success: false, error: "Failed to fetch bank list" };
    }
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<{ success: boolean; account_name?: string; error?: string }> {
    try {
      const validation = await this.validateBankAccount(accountNumber, bankCode);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      return { success: true, account_name: validation.accountName };
    } catch (error) {
      return { success: false, error: "Account resolution failed" };
    }
  }
}

// Flutterwave Provider Implementation (placeholder)
export class FlutterwaveProvider implements IPaymentProvider {
  name = "Flutterwave";
  supportedMethods: ('bank_account' | 'mobile_money' | 'card')[] = ['bank_account', 'mobile_money', 'card'];
  private secretKey: string;
  private publicKey: string;
  
  constructor(secretKey: string = 'FLWSECK_TEST-placeholder', publicKey: string = 'FLWPUBK_TEST-placeholder') {
    this.secretKey = secretKey;
    this.publicKey = publicKey;
  }

  // Similar implementation as Paystack but with Flutterwave API endpoints
  async validateBankAccount(accountNumber: string, bankCode: string): Promise<{ valid: boolean; accountName?: string; error?: string }> {
    try {
      if (!accountNumber || !bankCode) {
        return { valid: false, error: "Account number and bank code are required" };
      }
      
      if (accountNumber.length !== 10) {
        return { valid: false, error: "Account number must be exactly 10 digits" };
      }
      
      if (!NIGERIAN_BANKS[bankCode as keyof typeof NIGERIAN_BANKS]) {
        return { valid: false, error: "Invalid bank code" };
      }
      
      const accountName = `Flutterwave Account ${accountNumber.slice(-4)}`;
      return { valid: true, accountName };
    } catch (error) {
      return { valid: false, error: "Bank validation failed" };
    }
  }

  async initializePayment(amount: number, email: string, reference?: string): Promise<{ success: boolean; authorization_url?: string; reference?: string; error?: string }> {
    const paymentReference = reference || `flw-ref-${randomUUID()}`;
    return {
      success: true,
      authorization_url: `https://checkout.flutterwave.com/${paymentReference}`,
      reference: paymentReference
    };
  }

  async verifyPayment(reference: string): Promise<{ success: boolean; status?: string; amount?: number; error?: string }> {
    return { success: true, status: 'successful', amount: 100000 };
  }

  async createTransferRecipient(accountNumber: string, bankCode: string, accountName: string): Promise<{ success: boolean; recipient_code?: string; error?: string }> {
    const validation = await this.validateBankAccount(accountNumber, bankCode);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    return { success: true, recipient_code: `FLW_${randomUUID().replace(/-/g, '').substring(0, 10)}` };
  }

  async initiateTransfer(amount: number, recipientCode: string, reference?: string): Promise<{ success: boolean; transfer_code?: string; error?: string }> {
    return { success: true, transfer_code: `FLW_TRF_${randomUUID().replace(/-/g, '').substring(0, 10)}` };
  }

  async verifyTransfer(reference: string): Promise<{ success: boolean; status?: string; error?: string }> {
    return { success: true, status: 'successful' };
  }

  async getBankList(): Promise<{ success: boolean; banks?: Array<{ name: string; code: string; slug?: string }>; error?: string }> {
    const banks = Object.entries(NIGERIAN_BANKS).map(([code, name]) => ({
      name,
      code,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }));
    
    return { success: true, banks };
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<{ success: boolean; account_name?: string; error?: string }> {
    const validation = await this.validateBankAccount(accountNumber, bankCode);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    return { success: true, account_name: validation.accountName };
  }
}

// Payment Provider Factory
export class PaymentProviderFactory {
  private static providers: Map<string, IPaymentProvider> = new Map();
  
  static registerProvider(name: string, provider: IPaymentProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }
  
  static getProvider(name: string): IPaymentProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }
  
  static listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
  
  static initialize() {
    // Register default providers
    this.registerProvider('paystack', new PaystackProvider());
    this.registerProvider('flutterwave', new FlutterwaveProvider());
  }
}

// Initialize providers
PaymentProviderFactory.initialize();

// Naira formatting utilities
export const formatNaira = (amountInKobo: number): string => {
  const amountInNaira = amountInKobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountInNaira);
};

export const parseNairaAmount = (formattedAmount: string): number => {
  // Remove currency symbol and convert to kobo
  const cleanAmount = formattedAmount.replace(/[₦,\s]/g, '');
  const nairaAmount = parseFloat(cleanAmount);
  return Math.round(nairaAmount * 100); // Convert to kobo
};

// Bank account validation for Nigerian banks
export const validateNigerianBankAccount = (accountNumber: string, bankCode: string): { valid: boolean; error?: string } => {
  if (!accountNumber || !bankCode) {
    return { valid: false, error: "Account number and bank code are required" };
  }
  
  // Check if it's a valid 10-digit account number
  if (!/^\d{10}$/.test(accountNumber)) {
    return { valid: false, error: "Account number must be exactly 10 digits" };
  }
  
  // Check if bank code exists in our list
  if (!NIGERIAN_BANKS[bankCode as keyof typeof NIGERIAN_BANKS]) {
    return { valid: false, error: "Invalid Nigerian bank code" };
  }
  
  return { valid: true };
};

// Simple encryption utilities (for development - use proper encryption in production)
export const encryptSensitiveData = (data: string): string => {
  // Simple obfuscation for development - replace with proper encryption
  return Buffer.from(data).toString('base64').split('').reverse().join('');
};

export const decryptSensitiveData = (encryptedData: string): string => {
  // Simple deobfuscation for development - replace with proper decryption
  try {
    const reversed = encryptedData.split('').reverse().join('');
    return Buffer.from(reversed, 'base64').toString('utf8');
  } catch {
    return '';
  }
};