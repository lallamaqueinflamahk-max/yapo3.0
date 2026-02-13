/**
 * API REST de billetera interna YAPÓ.
 * Balance y transferencias; store + crypto en backend.
 * NO dinero real.
 */

import express from "express";
import * as store from "./wallet-store.js";

const PORT = Number(process.env.WALLET_API_PORT) || 3002;
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "wallet-api" });
});

app.get("/balance/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId?.trim()) {
      return res.status(400).json({ error: "userId requerido" });
    }
    const balance = store.getWalletBalance(userId.trim());
    res.json(balance);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error interno" });
  }
});

app.get("/transactions/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    if (!userId?.trim()) {
      return res.status(400).json({ error: "userId requerido" });
    }
    const transactions = store.getTransactions(userId.trim(), limit);
    res.json({ transactions });
  } catch (e) {
    res.status(500).json({ error: e.message || "Error interno" });
  }
});

app.post("/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body || {};
    if (!fromUserId?.trim() || !toUserId?.trim()) {
      return res.status(400).json({ success: false, error: "fromUserId y toUserId requeridos" });
    }
    if (amount == null || amount === "") {
      return res.status(400).json({ success: false, error: "amount requerido" });
    }
    const result = store.transfer(
      String(fromUserId).trim(),
      String(toUserId).trim(),
      String(amount)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || "Error interno" });
  }
});

app.listen(PORT, () => {
  console.log(`Wallet API listening on http://localhost:${PORT}`);
});
