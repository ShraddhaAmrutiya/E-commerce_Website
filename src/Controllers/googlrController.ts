import GoogleReview from "../Models/googleReview";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ApifyClient } from "apify-client";

dotenv.config();


const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export const fetchAndSaveGoogleReviews = async () => {
  try {
    const actorId = process.env.APIFY_ACTOR_ID;
    console.log("actorId: ", actorId);

    const input = {
      // Put your actor's actual input here
      placeIds: ["ChIJja8aWHwpXDkRXLfrojbwu3k"],
      maxReviews: 100,
    };

    console.log("🚀 Starting Apify...");

    console.log("apifyClient: ", apifyClient);
    const run = await apifyClient.actor(actorId as string).call(input);

    console.log("✅ Apify finished:", run.id);

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();


    const reviews = items as any[];

    const operations = reviews
      .filter((review) => review.reviewUrl)
      .map((review) => {
        const placeId = review.url?.match(/query_place_id=([^&]+)/)?.[1] || "";

        return {
          updateOne: {
            filter: {
              reviewId: review.reviewUrl,
            },

            update: {
              $set: {
                reviewId: review.reviewUrl,
                placeId,
                businessName: review.title || "",
                reviewerName: review.name || "",
                rating: review.stars || 0,
                text: review.text || "",
                reviewUrl: review.reviewUrl,
                businessUrl: review.url || "",
                lastSyncedAt: new Date(),
              },
            },

            upsert: true,
          },
        };
      });

    const result = await GoogleReview.bulkWrite(operations);


    return {
      totalFromApify: reviews.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Google review sync error:", error);
    throw error;
  }
};

export const getGoogleReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await GoogleReview.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Google reviews fetched successfully",
      result: reviews,
    });
  } catch (error: any) {
    console.error("Get Google reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Google reviews",
      error: error.message,
    });
  }
};