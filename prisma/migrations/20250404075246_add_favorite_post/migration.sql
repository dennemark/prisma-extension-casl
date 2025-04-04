-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "favoriteId" INTEGER,
    CONSTRAINT "User_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id") SELECT "email", "id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_favoriteId_key" ON "User"("favoriteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
