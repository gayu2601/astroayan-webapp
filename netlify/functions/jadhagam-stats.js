// netlify/functions/jadhagam-stats.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function handler(event) {
  const totalCalls = await redis.get("jadhagam:call_count");

  // Get last 10 call timestamps
  const recentCalls = await redis.lrange("jadhagam:call_log", 0, 9);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      total_calls: totalCalls || 0,
      recent_calls: recentCalls,
    }),
  };
}