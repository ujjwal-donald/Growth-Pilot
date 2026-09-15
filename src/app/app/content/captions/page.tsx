import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Caption generator"
      description="Short-form captions using the same AI post pipeline and brand voice."
      bullets={['Reuse the post generator with a caption-length transform.', 'Save winning lines as drafts.']}
    />
  );
}
