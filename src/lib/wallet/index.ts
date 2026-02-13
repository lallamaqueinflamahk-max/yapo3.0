/**
 * Wallet YAPÓ — lógica real, preparada para producción futura.
 * Núcleo: types, ledger, service, wallet.guard. Wallet + Escudos: getBalance, lock, unlock, transferWithGuard.
 * Modelo de datos canónico: wallet.types.ts (WalletId, TransactionId, EscudoId, Wallet, Transaction, Balance).
 * Legacy: domain, walletService, permissions (UI).
 */

// --- Modelo de datos (wallet.types.ts: producción, estricto) ---
export type {
  WalletId,
  TransactionId,
  EscudoId,
  WalletLimits,
  WalletEstado,
  TransactionType,
  TransactionStatus as TransactionStatusModel,
  Wallet as WalletData,
  Transaction as TransactionData,
  Balance as BalanceData,
} from "./wallet.types";

// --- Núcleo (lógica real, tipos legacy para ledger/service) ---
export type {
  Wallet,
  Transaction,
  TransactionStatus,
  BankConnection,
  Balance,
  Escudo,
  EscudoKind,
  EscudoBiometrico,
  EscudoTiempo,
  EscudoMonto,
  EscudoTerritorial,
} from "./types";

export {
  createWallet as createWalletCore,
  getWallet,
  recordTransaction,
  getTransaction,
  getTransactions,
  clearLedger,
  applyLock,
  applyUnlock,
} from "./ledger";

export {
  requestTransfer,
  holdTransaction,
  releaseTransaction,
  blockTransaction,
  getBalance,
  lock,
  unlock,
  transferWithGuard,
} from "./service";
export type {
  RequestTransferResult,
  HoldTransactionResult,
  ReleaseTransactionResult,
  BlockTransactionResult,
  TransferWithGuardResult,
} from "./service";

// --- Servicio canónico (wallet.service: tipos wallet.types, guard-gated apply) ---
export {
  getWalletByUser as getWalletByUserCanonical,
  getBalance as getBalanceByWalletId,
  createTransaction,
  applyTransaction,
  lockWallet,
  unlockWallet,
  getTransaction as getTransactionCanonical,
} from "./wallet.service";
export type {
  CreateTransactionInput,
  CreateTransactionResult,
  ApplyTransactionResult,
} from "./wallet.service";

export { walletGuard, guardResultToCerebroResult } from "./wallet.guard";
export type {
  WalletGuardContext,
  WalletGuardResult,
  WalletValidationType,
  RequiredBiometricLevel,
} from "./wallet.guard";

// --- Escudos (validación; no ejecuta transferencias) ---
export {
  validateEscudo,
  validateTransaction,
} from "./wallet.escudos";
export type {
  Escudo as EscudoShield,
  EscudoType,
  EscudoRules,
  EscudoRulesBiometric,
  EscudoRulesTimeDelay,
  EscudoRulesAmountLimit,
  EscudoRulesTerritorial,
  EscudoRulesRoleBased,
  EscudoValidationContext,
  EscudoValidationResult,
} from "./wallet.escudos";

// --- Cuenta e historial (modelo UI: WalletAccount, WalletTransaction) ---
export type { WalletAccount, WalletTransaction } from "./account.model";
export { getWalletAccount, getWalletTransactions } from "./account.model";

// --- Subsidios (no transferibles; balance protegido; auditable; listos para gobierno) ---
export type {
  Subsidy,
  SubsidySource,
  SubsidyStatus,
  SubsidyConditions,
  SubsidyAcceptance,
} from "./subsidy.types";
export {
  createSubsidy,
  getSubsidy,
  listSubsidies,
  listAvailableSubsidies,
  validateSubsidyEligibility,
  acceptSubsidy,
  getAcceptance,
  getAcceptancesByUser,
  getAcceptancesBySubsidy,
  getAcceptancesForAudit,
} from "./subsidy.service";
export type {
  CreateSubsidyInput,
  CreateSubsidyResult,
  ValidateEligibilityResult,
  AcceptSubsidyContext,
  AcceptSubsidyResult,
} from "./subsidy.service";

// --- Legacy (UI y otros módulos) ---
export * from "./validation";
export * from "./wallet-client";
export {
  createWalletService,
  type IWalletService,
  type WalletServiceOptions,
} from "./wallet-service";
export * from "./domain";
export {
  createWallet,
  getWalletByUser,
  getWalletById,
  getBalance as getBalanceLegacy,
  transfer,
  getLedgerTransfers,
  getTransfersForWallet,
} from "./walletService";
export {
  canUseWallet,
  WALLET_ACTIONS,
  type WalletActionId,
} from "./permissions";
