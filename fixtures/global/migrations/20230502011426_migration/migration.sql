-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "passwordToken" TEXT,
    "passwordTokenExpirationDate" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
