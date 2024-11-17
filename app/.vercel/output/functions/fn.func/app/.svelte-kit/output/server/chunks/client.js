import { createClient } from "@sanity/client";
const PUBLIC_SANITY_PROJECT_ID = "kijh3dc6";
const PUBLIC_SANITY_DATASET = "production";
function assertEnvVar(value, name) {
  if (value === void 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
const dataset = assertEnvVar(PUBLIC_SANITY_DATASET, "PUBLIC_SANITY_DATASET");
const projectId = assertEnvVar(PUBLIC_SANITY_PROJECT_ID, "PUBLIC_SANITY_PROJECT_ID");
const apiVersion = "2024-03-15";
const studioUrl = "http://localhost:3333";
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl
  }
});
export {
  assertEnvVar as a,
  client as c
};
