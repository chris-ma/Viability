-- CreateTable
CREATE TABLE "public"."biz_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'text',
    "title" TEXT,
    "rawText" TEXT NOT NULL,
    "brokerName" TEXT,
    "locationText" TEXT,
    "askingPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "analysisStatus" TEXT NOT NULL DEFAULT 'pending',
    "pipelineStage" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biz_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_extracted_fields" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValueText" TEXT,
    "fieldValueNum" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "sourceSnippet" TEXT,
    "extractionMethod" TEXT NOT NULL DEFAULT 'llm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_extracted_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_financial_metrics" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "periodType" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "sourceSnippet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_financial_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_classifications" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "industry" TEXT,
    "businessModel" TEXT,
    "customerType" TEXT,
    "deliveryMode" TEXT,
    "ownerModel" TEXT,
    "revenueModel" TEXT,
    "lifecycleStage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_risk_flags" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "flagCode" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceSnippet" TEXT,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_missing_info" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "missingCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "whyItMatters" TEXT,
    "suggestedQuestion" TEXT,
    "priority" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_missing_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_scores" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "completenessScore" DOUBLE PRECISION,
    "financialClarityScore" DOUBLE PRECISION,
    "businessQualityScore" DOUBLE PRECISION,
    "riskLevel" DOUBLE PRECISION,
    "valuationScore" DOUBLE PRECISION,
    "pursuitScore" DOUBLE PRECISION,
    "confidence" TEXT,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_valuations" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "profitBasis" TEXT,
    "impliedMultiple" DOUBLE PRECISION,
    "estimatedLow" DOUBLE PRECISION,
    "estimatedMid" DOUBLE PRECISION,
    "estimatedHigh" DOUBLE PRECISION,
    "pricePosition" TEXT,
    "aiSummary" TEXT,
    "positives" TEXT,
    "negatives" TEXT,
    "pricingView" TEXT,
    "nextSteps" TEXT,
    "ddQuestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biz_valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biz_notes" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biz_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "biz_classifications_listingId_key" ON "public"."biz_classifications"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "biz_scores_listingId_key" ON "public"."biz_scores"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "biz_valuations_listingId_key" ON "public"."biz_valuations"("listingId");

-- CreateIndex
CREATE INDEX "biz_listings_userId_idx" ON "public"."biz_listings"("userId");

-- AddForeignKey
ALTER TABLE "public"."biz_listings" ADD CONSTRAINT "biz_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_extracted_fields" ADD CONSTRAINT "biz_extracted_fields_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_financial_metrics" ADD CONSTRAINT "biz_financial_metrics_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_classifications" ADD CONSTRAINT "biz_classifications_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_risk_flags" ADD CONSTRAINT "biz_risk_flags_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_missing_info" ADD CONSTRAINT "biz_missing_info_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_scores" ADD CONSTRAINT "biz_scores_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_valuations" ADD CONSTRAINT "biz_valuations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biz_notes" ADD CONSTRAINT "biz_notes_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."biz_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
