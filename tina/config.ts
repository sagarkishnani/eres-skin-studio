import { defineConfig } from "tinacms";
import { globalCollection } from "./collections/global";
import { homeCollection } from "./collections/home";
import { aboutCollection } from "./collections/about";
import { postCollection } from "./collections/post";
import { formConfigCollection } from "./collections/formConfig";
import { dynamicFormsCollection } from "./collections/dynamicForms";
import { shopCollection } from "./collections/shop";
import { maintenanceCollection } from "./collections/maintenance";
import { cookieConsentCollection } from "./collections/cookieConsent";

export default defineConfig({
  // Baked into the generated client at build time; NOT read at runtime.
  branch: process.env.TINA_BRANCH || "staging",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      globalCollection,
      homeCollection,
      aboutCollection,
      postCollection,
      formConfigCollection,
      dynamicFormsCollection,
      shopCollection,
      maintenanceCollection,
      cookieConsentCollection,
    ],
  },
});
