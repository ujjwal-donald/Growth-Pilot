/**
 * Background publisher skeleton.
 * Run on a cron (every minute) or a queue worker:
 *   1. Find SocialPost where status=SCHEDULED and scheduledAt <= now()
 *   2. Mark PUBLISHING
 *   3. Decrypt tokens, call getSocialAdapter(platform).publish()
 *   4. Mark PUBLISHED or FAILED and store lastError
 */
export const PUBLISH_JOB = "publish-scheduled-posts";
