import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import ProductDetail from "@/components/shop/ProductDetail";

export const revalidate = 10;

export async function generateMetadata(
  props: PageProps<"/shop/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await getProductByHandle(handle);
  if (!product) return {};
  // Strip HTML for description
  const desc = product.bodyHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return {
    title: product.title,
    description: desc || `${product.title} at Moving Mobiles Tech`,
  };
}

export default async function ShopProductPage(
  props: PageProps<"/shop/[handle]">,
) {
  const { handle } = await props.params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
