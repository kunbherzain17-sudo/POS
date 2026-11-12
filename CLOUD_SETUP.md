# Asaan POS cloud setup

The app is being moved from browser-local records to Supabase Auth and Postgres. Each account owns one store; store data is held in a tenant-scoped JSON snapshot protected by row-level security and revision checks.

## Configure Supabase

1. Create a Supabase project and keep its database password and service-role key private.
2. Apply both migrations in `supabase/migrations/` in order: first `202611120001_cloud_saas.sql`, then `202611120002_product_images.sql`.
3. Configure Authentication for email/password sign-in, the deployed site URL, and allowed redirect URLs. Configure email confirmation and test the confirmation flow before inviting customers.
4. Copy `.env.example` to `.env.local` for development and set:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

   Only the project URL and public anon/publishable key belong in frontend configuration. Never put a service-role key, database password, or payment secret in the browser or source control.
5. Run `npm run lint`, `npm run build`, and `npm run dev`. For deployment, configure those same two public variables in the hosting provider and serve the Vite single-page app over HTTPS with SPA route fallback.

## Important: billing is not live

New stores are provisioned with `pending_payment` status. The app deliberately blocks store access until a trusted payment integration changes the entitlement to `active`; the database save function also rejects writes for inactive stores. This repository does **not** yet include a payment checkout, recurring subscription management, verified payment webhook, cancellation/dunning flow, or secure activation endpoint. Do not collect customer payments or advertise the subscription as operational until those parts are implemented and tested.

The migration stores prices as **PKR 40,000 setup + PKR 3,000/month**. For Pakistan, the recommended first release is a hosted checkout through a locally supported payment aggregator, with a verified server webhook. Treat each monthly renewal as a customer-initiated invoice/payment link unless the selected merchant provider confirms that it supports authorized recurring mandates for the customer's chosen bank/wallet method. Do not promise automatic wallet or bank debits until verified with the provider. Payment provider, merchant account, public domain, support contact, and tax/invoice requirements still need to be decided.

## Move an existing store

Before replacing the old device-local app, use its Administration page to download an Asaan POS JSON backup when possible. On the same browser/origin, after signing in to an active cloud store, the new app offers **Import previous device data** when the cloud store is empty; it validates and copies the legacy records without deleting the local source. You can also use **Administration → Restore from JSON** to validate and import a backup. Both imports are written to the cloud before success is reported.

## Before production

- Implement hosted checkout and a server/edge-function webhook that verifies the provider signature and idempotently records setup/subscription payments before activating a store. Keep provider secrets in hosted server secrets, never in `VITE_*` variables.
- Confirm the currency, supported gateway, billing terms, and how failed renewals/cancellations affect access.
- Test signup/email confirmation, two-account tenant isolation, concurrent edits/conflict recovery, cloud save failures, backups/restores, and mobile/desktop checkout against a real test project.
- Configure backups, monitoring, privacy/retention terms, customer support, and a production domain.

The first version supports one owner account per store. Staff invitations and multi-user role management are not implemented.

## Product photos and business categories

Product records support optional JPG, PNG, or WebP photos up to 5 MB. Photos are stored in the `product-images` Supabase Storage bucket under each store's folder; the bucket is public so product photos load without expiring signed links. Upload and modification policies restrict writes to the authenticated owner/admin of an active store. Do not upload private medical records, patient data, or other sensitive images as product photos.

Categories are customizable, so product catalogs can be organized for garments, bakery items, pharmacy stock, clinic supplies, services, and other businesses. This generic catalog does not yet include specialized workflows such as garment size/color variants, pharmacy batch/expiry tracking, or clinic appointments and patient records.

## Public product demo

Append `?demo=1` to the deployed app URL to open the interactive Asaan POS demo (for example, `https://your-domain.example/?demo=1`). It uses sample data in the visitor's current browser session, does not create an account or contact Supabase, and does not persist changes. Refreshing or leaving the demo restores the sample data. Share this link only after deploying the app; `localhost` links work only on your own machine.
