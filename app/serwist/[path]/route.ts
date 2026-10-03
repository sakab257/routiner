import { createSerwistRoute } from "@serwist/turbopack";

/** Every page of the app is static and reads its data from localStorage, so all of them are precached. */
const APP_ROUTES = [
  "/",
  "/bienvenue",
  "/activite",
  "/reglages",
  "/modeles",
  "/habitudes",
  "/habitudes/nouvelle",
  "/habitudes/modifier",
  "/habitude",
  "/defis",
  "/defis/nouveau",
  "/defis/modifier",
  "/defi",
  "/~offline",
];

// One revision per build: the HTML shells are re-fetched whenever a new version is deployed.
const revision = crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "app/sw.ts",
  additionalPrecacheEntries: APP_ROUTES.map((url) => ({ url, revision })),
  useNativeEsbuild: true,
});
