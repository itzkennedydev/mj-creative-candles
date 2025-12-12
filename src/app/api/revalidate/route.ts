import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { authenticateRequest } from "~/lib/auth";
import { cacheInvalidation } from "~/lib/cache";

export const dynamic = "force-dynamic";

/**
 * POST /api/revalidate
 *
 * Invalidates caches for specified resources
 * Requires admin authentication
 *
 * Body:
 * - type: "products" | "product" | "reviews" | "orders" | "analytics" | "settings" | "all"
 * - id?: string (for specific product/review invalidation)
 * - paths?: string[] (Next.js paths to revalidate)
 * - tags?: string[] (Next.js cache tags to revalidate)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request - admin only
    const auth = await authenticateRequest(request);

    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      type: string;
      id?: string;
      paths?: string[];
      tags?: string[];
    };

    const { type, id, paths, tags } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    // Invalidate server-side memory cache
    switch (type) {
      case "products":
        cacheInvalidation.products();
        break;

      case "product":
        if (!id) {
          return NextResponse.json(
            { error: "Product ID is required for product invalidation" },
            { status: 400 },
          );
        }
        cacheInvalidation.product(id);
        break;

      case "reviews":
        cacheInvalidation.reviews(id);
        break;

      case "orders":
        cacheInvalidation.orders();
        break;

      case "analytics":
        cacheInvalidation.analytics();
        break;

      case "settings":
        cacheInvalidation.settings();
        break;

      case "all":
        cacheInvalidation.all();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown cache type: ${type}` },
          { status: 400 },
        );
    }

    // Revalidate Next.js paths if provided
    if (paths && paths.length > 0) {
      for (const path of paths) {
        try {
          revalidatePath(path);
          console.log(`[Cache] Revalidated path: ${path}`);
        } catch (error) {
          console.error(`[Cache] Failed to revalidate path ${path}:`, error);
        }
      }
    }

    // Revalidate Next.js cache tags if provided
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        try {
          revalidateTag(tag);
          console.log(`[Cache] Revalidated tag: ${tag}`);
        } catch (error) {
          console.error(`[Cache] Failed to revalidate tag ${tag}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for: ${type}${id ? ` (${id})` : ""}`,
      invalidated: {
        type,
        id,
        paths: paths ?? [],
        tags: tags ?? [],
      },
    });
  } catch (error) {
    console.error("[Cache] Error in revalidation endpoint:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 },
    );
  }
}
