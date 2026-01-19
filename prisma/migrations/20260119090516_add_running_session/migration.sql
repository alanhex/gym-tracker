-- CreateTable
CREATE TABLE "RunningSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workoutId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "distance" REAL,
    "avgPace" INTEGER,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "avgCadence" INTEGER,
    "calories" INTEGER,
    "elevationGain" INTEGER,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RunningSession_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RunningSession_workoutId_key" ON "RunningSession"("workoutId");
