export function composePublishText(post: {
  copy: string;
  cta: string | null;
  hashtags: string[];
}) {
  const tags = post.hashtags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
  return [post.copy, post.cta, tags].filter((part) => part && part.trim()).join("\n\n");
}
