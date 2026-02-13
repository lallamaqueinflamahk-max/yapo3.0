-- CreateEnum
CREATE TYPE "NivelAlerta" AS ENUM ('Verde', 'Amarillo', 'Rojo');

-- CreateEnum
CREATE TYPE "PedidoEstado" AS ENUM ('abierto', 'cerrado', 'fallido');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionPlanId" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePyG" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'month',
    "maxOffers" INTEGER,
    "maxTransfers" INTEGER,
    "benefits" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semaphore" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semaphore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geografia_py" (
    "idBarrio" SERIAL NOT NULL,
    "slug" VARCHAR(80),
    "departamento" VARCHAR(120) NOT NULL,
    "ciudad" VARCHAR(120) NOT NULL,
    "barrio_nombre" VARCHAR(120) NOT NULL,
    "latitud_centro" DECIMAL(10,7) NOT NULL,
    "longitud_centro" DECIMAL(10,7) NOT NULL,
    "geofence_poly" TEXT,

    CONSTRAINT "geografia_py_pkey" PRIMARY KEY ("idBarrio")
);

-- CreateTable
CREATE TABLE "metricas_semaforo" (
    "id" TEXT NOT NULL,
    "id_barrio" INTEGER NOT NULL,
    "rubro" VARCHAR(80) NOT NULL,
    "densidad_prof" INTEGER NOT NULL,
    "demanda_activa" INTEGER NOT NULL,
    "nivel_alerta" "NivelAlerta" NOT NULL,

    CONSTRAINT "metricas_semaforo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubro" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfesionalGeo" (
    "id_profesional" TEXT NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "rubro" VARCHAR(80) NOT NULL,
    "id_barrio" INTEGER,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "sello_mbareté" BOOLEAN NOT NULL DEFAULT false,
    "calidad" INTEGER NOT NULL DEFAULT 0,
    "precio" DECIMAL(12,2),
    "user_id" TEXT,

    CONSTRAINT "ProfesionalGeo_pkey" PRIMARY KEY ("id_profesional")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" TEXT NOT NULL,
    "id_rubro" TEXT NOT NULL,
    "id_barrio" INTEGER NOT NULL,
    "estado" "PedidoEstado" NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_slug_key" ON "SubscriptionPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Semaphore_zone_key" ON "Semaphore"("zone");

-- CreateIndex
CREATE UNIQUE INDEX "geografia_py_slug_key" ON "geografia_py"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "metricas_semaforo_id_barrio_rubro_key" ON "metricas_semaforo"("id_barrio", "rubro");

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_nombre_key" ON "Rubro"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_slug_key" ON "Rubro"("slug");

-- AddForeignKey
ALTER TABLE "metricas_semaforo" ADD CONSTRAINT "metricas_semaforo_id_barrio_fkey" FOREIGN KEY ("id_barrio") REFERENCES "geografia_py"("idBarrio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfesionalGeo" ADD CONSTRAINT "ProfesionalGeo_id_barrio_fkey" FOREIGN KEY ("id_barrio") REFERENCES "geografia_py"("idBarrio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfesionalGeo" ADD CONSTRAINT "ProfesionalGeo_rubro_fkey" FOREIGN KEY ("rubro") REFERENCES "Rubro"("nombre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_barrio_fkey" FOREIGN KEY ("id_barrio") REFERENCES "geografia_py"("idBarrio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_rubro_fkey" FOREIGN KEY ("id_rubro") REFERENCES "Rubro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
