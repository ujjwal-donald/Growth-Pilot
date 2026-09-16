import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { uploadBrandAssetAction } from "@/server/actions/brand";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function BrandAssetsPage() {
  const ctx = await requireWorkspace();
  const assets = await prisma.brandAsset.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Assets" description="Logos and creative go through the storage adapter: local disk now, Amazon S3 + CloudFront when STORAGE_DRIVER=s3." />
      <form action={uploadBrandAssetAction} encType="multipart/form-data" className="mb-8 grid max-w-xl gap-3">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input name="name" placeholder="Primary logo" />
        </div>
        <div className="space-y-1">
          <Label>Type</Label>
          <select name="type" className="h-9 w-full rounded-lg border px-3 text-sm">
            <option value="LOGO">Logo</option>
            <option value="IMAGE">Image</option>
            <option value="FONT">Font</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <Input name="file" type="file" required />
        <Button type="submit">Upload</Button>
      </form>
      <ul className="space-y-2 text-sm">
        {assets.map((asset) => (
          <li key={asset.id}>
            <a className="text-indigo-600" href={asset.url ?? "#"}>
              {asset.name}
            </a>{" "}
            · {asset.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
