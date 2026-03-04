-- CreateTable
CREATE TABLE "Channel"
(
    "id"               TEXT         NOT NULL,
    "youtubeChannelId" TEXT         NOT NULL,
    "title"            TEXT         NOT NULL,
    "description"      TEXT,
    "thumbnailUrl"     TEXT,
    "customUrl"        TEXT,
    "publishedAt"      TIMESTAMP(3) NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelSnapshot"
(
    "id"              TEXT         NOT NULL,
    "channelId"       TEXT         NOT NULL,
    "subscriberCount" INTEGER      NOT NULL,
    "viewCount"       BIGINT       NOT NULL,
    "videoCount"      INTEGER      NOT NULL,
    "recordedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video"
(
    "id"             TEXT         NOT NULL,
    "youtubeVideoId" TEXT         NOT NULL,
    "channelId"      TEXT         NOT NULL,
    "title"          TEXT         NOT NULL,
    "description"    TEXT,
    "thumbnailUrl"   TEXT,
    "publishedAt"    TIMESTAMP(3) NOT NULL,
    "duration"       TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSnapshot"
(
    "id"           TEXT         NOT NULL,
    "videoId"      TEXT         NOT NULL,
    "viewCount"    BIGINT       NOT NULL,
    "likeCount"    INTEGER      NOT NULL,
    "commentCount" INTEGER      NOT NULL,
    "recordedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_youtubeChannelId_key" ON "Channel" ("youtubeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeVideoId_key" ON "Video" ("youtubeVideoId");

-- AddForeignKey
ALTER TABLE "ChannelSnapshot"
    ADD CONSTRAINT "ChannelSnapshot_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video"
    ADD CONSTRAINT "Video_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSnapshot"
    ADD CONSTRAINT "VideoSnapshot_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
