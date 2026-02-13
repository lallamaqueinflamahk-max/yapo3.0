/**
 * WalletService: acepta Identity, permite operaciones mock,
 * bloquea transferencias reales si !verified o rol no permitido.
 */

import type { Identity } from "@/lib/auth";
import { ACTIONS } from "@/lib/auth";
import { hasPermissionForAction } from "@/lib/auth";
import type {
  WalletBalance,
  Transaction,
  TransferRequest,
  TransferResult,
} from "./types";
import { fetchBalance, fetchTransactions, transfer as apiTransfer } from "./wallet-client";

export interface WalletServiceOptions {
  /** Si true, balance/transactions/transfer son mock (sin llamar API). */
  useMock?: boolean;
}

function canTransfer(identity: Identity): { allowed: boolean; error?: string } {
  if (!identity.verified) {
    return {
      allowed: false,
      error: "Usuario no verificado. No podés transferir.",
    };
  }
  const check = hasPermissionForAction(identity.roles, ACTIONS.wallet_transfer);
  if (!check.allowed) {
    const roleNames =
      check.requiredRoles?.map((r) => getRoleName(r)).join(", ") ??
      "Cliente, PyME o Enterprise";
    return {
      allowed: false,
      error: `Tu rol no permite transferir. Se requiere: ${roleNames}.`,
    };
  }
  return { allowed: true };
}

/** Balance mock para operaciones de desarrollo. */
function mockBalance(userId: string): WalletBalance {
  return {
    userId,
    balance: "1000.00",
    currency: "YAP",
    updatedAt: new Date().toISOString(),
  };
}

/** Historial mock. */
function mockTransactions(userId: string, _limit: number): Transaction[] {
  return [];
}

/** Transferencia mock: simula éxito sin llamar API. */
function mockTransfer(
  fromUserId: string,
  toUserId: string,
  amount: string
): TransferResult {
  return {
    success: true,
    transaction: {
      id: `mock-tx-${Date.now()}`,
      fromUserId,
      toUserId,
      amount,
      currency: "YAP",
      signature: "mock",
      createdAt: new Date().toISOString(),
      status: "completed",
    },
  };
}

export interface IWalletService {
  getIdentity(): Identity;
  getBalance(): Promise<WalletBalance | null>;
  getTransactions(limit?: number): Promise<Transaction[]>;
  transfer(request: Omit<TransferRequest, "fromUserId">): Promise<TransferResult>;
}

export function createWalletService(
  identity: Identity,
  options: WalletServiceOptions = {}
): IWalletService {
  const { useMock = false } = options;

  return {
    getIdentity() {
      return identity;
    },

    async getBalance(): Promise<WalletBalance | null> {
      if (useMock) {
        return Promise.resolve(mockBalance(identity.userId));
      }
      return fetchBalance(identity.userId);
    },

    async getTransactions(limit = 50): Promise<Transaction[]> {
      if (useMock) {
        return Promise.resolve(mockTransactions(identity.userId, limit));
      }
      return fetchTransactions(identity.userId, limit);
    },

    async transfer(
      request: Omit<TransferRequest, "fromUserId">
    ): Promise<TransferResult> {
      const fullRequest: TransferRequest = {
        ...request,
        fromUserId: identity.userId,
      };

      if (useMock) {
        return Promise.resolve(
          mockTransfer(
            identity.userId,
            fullRequest.toUserId,
            fullRequest.amount
          )
        );
      }

      const { allowed, error } = canTransfer(identity);
      if (!allowed) {
        return { success: false, error };
      }

      return apiTransfer(fullRequest);
    },
  };
}
