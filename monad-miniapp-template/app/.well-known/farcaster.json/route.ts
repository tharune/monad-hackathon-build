import { NextResponse } from "next/server";

const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  // TODO: Add your own account association from the Coinbase Developer portal
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    allowedAddresses: [] as string[],
  },
  miniapp: {
    version: "1",
    name: "Monad Farcaster MiniApp Template",
    subtitle: "Build on Monad",
    description:
      "A template for building Farcaster MiniApps on Monad.",
    screenshotUrls: [
      `${ROOT_URL}/images/feed.png`,
    ],
    iconUrl: `${ROOT_URL}/images/icon.png`,
    splashImageUrl: `${ROOT_URL}/images/splash.png`,
    splashBackgroundColor: "#ffffff",
    imageUrl: `${ROOT_URL}/images/feed.png`,
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "developer-tools",
    tags: ["monad", "farcaster", "miniapp", "template"],
    buttonTitle: "Launch Template",
    heroImageUrl: `${ROOT_URL}/images/feed.png`,
    tagline: "Monad Farcaster MiniApp Template",
    ogTitle: "Monad Farcaster MiniApp Template",
    ogDescription: "A template for building Farcaster MiniApps on Monad.",
    ogImageUrl: `${ROOT_URL}/images/feed.png`,
    castShareUrl: ROOT_URL,
    noindex: false,
  },
} as const;

export async function GET() {
  return NextResponse.json(minikitConfig);
}
