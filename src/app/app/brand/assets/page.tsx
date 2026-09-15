import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Brand assets"
      description="Logos and creative stored via the storage abstraction (local / S3 / R2)."
      bullets={['Upload API lands with the media route.']}
    />
  );
}
