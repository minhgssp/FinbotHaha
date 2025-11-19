
export enum Sender {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export type MessageType = 'text' | 'transaction_confirmation' | 'asset_liability_confirmation';

// Dữ liệu giao dịch được AI phân tích, đang chờ xác nhận
export interface PendingTransaction {
    description: string;
    amount: number;
    type: 'expense' | 'income';
    category: string;
    date?: string; // Thêm trường ngày (YYYY-MM-DD)
    frequency?: RecurringFrequency; // Thêm trường tần suất tùy chọn
}

export interface Message {
  id: string;
  sender: Sender;
  type: MessageType; // Phân biệt tin nhắn văn bản và các loại tin nhắn đặc biệt
  text?: string;
  choices?: string[];
  pendingTransaction?: PendingTransaction; // Dữ liệu cho thẻ xác nhận
  pendingAssetOrLiability?: PendingAssetAction; // Dữ liệu cho thẻ xác nhận tài sản/nợ
  relatedTransactionId?: string; // ID của giao dịch đã được tạo để hoàn tác
}


export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export enum OnboardingState {
  GREETING = 'GREETING',
  ASKING_INCOMES = 'ASKING_INCOMES',
  ASKING_GOALS = 'ASKING_GOALS',
  CONFIRMATION = 'CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

// --- Data Models for v0.0.3 ---

export enum AmountType {
  FIXED = 'FIXED',
  ESTIMATED = 'ESTIMATED',
  RANGE = 'RANGE',
}

export interface IncomeSource {
  source: string;
  amountType: AmountType;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
}

export enum GoalType {
  ACCUMULATE = 'ACCUMULATE',
  MONTHLY_SAVINGS = 'MONTHLY_SAVINGS',
  MONTHLY_BUDGET = 'MONTHLY_BUDGET',
}

export interface FinancialGoal {
  type: GoalType;
  targetAmount: number;
  currentAmount?: number;
  description: string;
}

// Generic response type from Gemini service - Refactored for v0.0.5
export interface GeminiResponse {
    responseText: string;
    choices?: string[];
    updatedIncomes?: IncomeSource[];
    updatedGoal?: FinancialGoal;
    isComplete?: boolean;
}

// --- New Data Models for v0.0.4 ---
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  date: string; // ISO 8601 format
  category: string; // Thêm trường category
}

// --- New Data Models for Recurring Transactions ---
export type RecurringFrequency = 'monthly'; // Start with monthly, can be extended

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  frequency: RecurringFrequency;
  startDate: string; // ISO 8601 format (date only)
  nextDueDate: string; // ISO 8601 format (date only)
}

// --- Advanced Data Models for Assets and Debts ---
export enum AssetType {
  CASH = 'Tiền mặt',
  INVESTMENT = 'Đầu tư', // Gold, stocks, crypto
  REAL_ESTATE = 'Bất động sản',
  OTHER = 'Khác'
}

export enum LiabilityType {
  LOAN = 'Khoản vay',
  CREDIT_CARD = 'Thẻ tín dụng',
  OTHER = 'Khác'
}

export interface Payment {
    id: string;
    date: string; // ISO 8601 format
    amount: number;
    note?: string;
}

// Represents a single buy or sell transaction for a trackable asset.
export interface AssetTransaction {
    id: string;
    date: string; // ISO 8601 format
    type: 'buy' | 'sell';
    quantity: number;
    totalValue: number; // The total monetary value of this specific transaction (cost for buys, proceeds for sells)
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number; // For cash: current balance. For investments: market value.
  quantity?: number; // Current total quantity held
  unit?: string;     // e.g., "chỉ"
  transactions?: AssetTransaction[]; // History of buys and sells
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  lender?: string; // Bên cho vay
  initialAmount: number; // Số tiền nợ ban đầu
  paymentHistory: Payment[]; // Lịch sử trả nợ
}


// --- Response type for Transaction AI Agent ---
export interface TransactionGeminiResponse {
    responseText: string;
    extractedTransaction?: PendingTransaction;
}

// --- New Types for Asset/Debt AI Agent ---

export enum AssetActionType {
    BUY = 'BUY',     // Mua tài sản
    SELL = 'SELL',    // Bán tài sản
    BORROW = 'BORROW', // Vay nợ
    REPAY = 'REPAY',  // Trả nợ
    UPDATE = 'UPDATE' // Cập nhật giá trị (ví dụ giá thị trường)
}

// Dữ liệu hành động liên quan đến tài sản/nợ, đang chờ xác nhận
export interface PendingAssetAction {
    action: AssetActionType;
    itemType: 'asset' | 'liability';
    name: string;
    amount: number; // Total transaction value for buy/sell; borrow/repay amount for liability
    type?: AssetType | LiabilityType; // Optional, mainly for creating new items
    lender?: string;
    quantity?: number; // For buy/sell asset
    unit?: string; // For buy/sell asset
}

// Cấu trúc response từ Gemini cho agent tài sản/nợ
export interface AssetDebtGeminiResponse {
    responseText: string;
    extractedData?: PendingAssetAction;
}
