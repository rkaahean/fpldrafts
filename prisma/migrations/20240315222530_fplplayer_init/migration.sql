-- CreateTable
CREATE TABLE "FPLPlayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team" INTEGER NOT NULL,
    "webName" TEXT NOT NULL,
    "teamCode" INTEGER NOT NULL,
    "elementType" INTEGER NOT NULL,

    CONSTRAINT "FPLPlayer_pkey" PRIMARY KEY ("id")
);
