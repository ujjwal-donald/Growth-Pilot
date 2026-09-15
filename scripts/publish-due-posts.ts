import "dotenv/config";
import { runPublishDuePosts } from "../src/server/jobs/publish-scheduled-posts";

runPublishDuePosts()
  .then((result) => {
    console.log(result);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
