-- YAPÓ 3.0: optimización, integridad referencial y SearchHistory
-- Compatible con backend y frontend existentes.

-- VerificationToken: PK compuesta (requerido por Prisma @@id). Solo si aún no tiene PK.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'VerificationToken' AND c.contype = 'p'
  ) THEN
    ALTER TABLE "VerificationToken" ADD PRIMARY KEY ("identifier", "token");
  END IF;
END $$;

-- User: updatedAt
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Profile: createdAt, updatedAt
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Consent: índice userId + version
CREATE INDEX IF NOT EXISTS "Consent_userId_version_idx" ON "Consent"("userId", "version");

-- Session: índice userId + expires
CREATE INDEX IF NOT EXISTS "Session_userId_expires_idx" ON "Session"("userId", "expires");

-- Rating: FKs a User (integridad referencial)
ALTER TABLE "Rating" DROP CONSTRAINT IF EXISTS "Rating_fromUserId_fkey";
ALTER TABLE "Rating" DROP CONSTRAINT IF EXISTS "Rating_toUserId_fkey";
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Rating_fromUserId_toUserId_type_idx" ON "Rating"("fromUserId", "toUserId", "type");

-- Wallet: updatedAt
ALTER TABLE "Wallet" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- WalletTransaction: índice walletId + createdAt
CREATE INDEX IF NOT EXISTS "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- ProfesionalGeo: índices búsqueda por zona y usuario
CREATE INDEX IF NOT EXISTS "ProfesionalGeo_idBarrio_rubro_idx" ON "ProfesionalGeo"("id_barrio", "rubro");
CREATE INDEX IF NOT EXISTS "ProfesionalGeo_user_id_idx" ON "ProfesionalGeo"("user_id");

-- PedidoGeo: índice barrio + estado
CREATE INDEX IF NOT EXISTS "pedidos_id_barrio_estado_idx" ON "pedidos"("id_barrio", "estado");

-- SearchHistory: tabla para placeholder adaptativo y sugerencias por rol
CREATE TABLE IF NOT EXISTS "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" VARCHAR(500) NOT NULL,
    "role" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

ALTER TABLE "SearchHistory" DROP CONSTRAINT IF EXISTS "SearchHistory_userId_fkey";
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
