declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ASSETS?: Fetcher;
    CMS_OWNER_EMAIL?: string;
    CMS_AUTH_PEPPER?: string;
    CMS_OWNER_SETUP_HASH?: string;
    CMS_OWNER_SETUP_EXPIRES?: string;
    BAJAJ_NETLIFY_GATEWAY_SECRET?: string;
  }
}
