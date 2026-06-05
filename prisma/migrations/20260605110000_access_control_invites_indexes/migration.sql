-- CreateTable
CREATE TABLE "ProjectInvite" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'DEVELOPER',
    "project_id" TEXT NOT NULL,
    "issuer_id" TEXT NOT NULL,
    "used_by_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvite_token_hash_key" ON "ProjectInvite"("token_hash");

-- CreateIndex
CREATE INDEX "Project_owner_id_idx" ON "Project"("owner_id");

-- CreateIndex
CREATE INDEX "ProjectUser_project_id_idx" ON "ProjectUser"("project_id");

-- CreateIndex
CREATE INDEX "Task_project_id_idx" ON "Task"("project_id");

-- CreateIndex
CREATE INDEX "Task_assignee_id_idx" ON "Task"("assignee_id");

-- CreateIndex
CREATE INDEX "Task_project_id_status_idx" ON "Task"("project_id", "status");

-- CreateIndex
CREATE INDEX "Task_project_id_priority_idx" ON "Task"("project_id", "priority");

-- CreateIndex
CREATE INDEX "Comment_task_id_idx" ON "Comment"("task_id");

-- CreateIndex
CREATE INDEX "Comment_author_id_idx" ON "Comment"("author_id");

-- CreateIndex
CREATE INDEX "Token_user_id_idx" ON "Token"("user_id");

-- CreateIndex
CREATE INDEX "Log_user_id_idx" ON "Log"("user_id");

-- CreateIndex
CREATE INDEX "ProjectInvite_project_id_idx" ON "ProjectInvite"("project_id");

-- CreateIndex
CREATE INDEX "ProjectInvite_issuer_id_idx" ON "ProjectInvite"("issuer_id");

-- CreateIndex
CREATE INDEX "ProjectInvite_used_by_id_idx" ON "ProjectInvite"("used_by_id");

-- CreateIndex
CREATE INDEX "ProjectInvite_expires_at_idx" ON "ProjectInvite"("expires_at");

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_used_by_id_fkey" FOREIGN KEY ("used_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
