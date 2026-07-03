    ## Plan: EventTech Ecosystem Expansion

    Extend the current Campus-Connect event platform into a multi-sided EventTech product without rewriting the working core. The recommended approach is to keep the existing event registration, ticketing, payments, feedback, and organizer analytics flows, then add first-class volunteer and sponsor domains plus the missing organizer tools around matching, hiring, budget tracking, communication, and certificates. I recommend treating volunteer and sponsor as explicit user roles so the existing auth/route guard pattern continues to work cleanly.

    **Steps**
    1. Establish the domain and auth contract first. Update the user role union and signup validation to support `volunteer` and `sponsor`, then thread those roles through token payloads, auth context, signup UI, sidebar navigation, and role-based guards. Keep `student`, `organizer`, and `admin` intact. *Depends on none.*
    2. Add the new backend data model layer for the missing modules. Create volunteer and sponsor collections plus any support collections needed for applications, assignments, achievements, sponsorship packages, matching, and ROI tracking. Extend the event schema only where it truly acts as shared coordination data, such as volunteer slots, sponsor package references, or certificate settings. *Depends on step 1.*
    3. Implement backend services and controllers around the new workflows. Add volunteer profile/application/assignment/score endpoints, sponsor marketplace and matching endpoints, certificate generation endpoints, budget tracking endpoints, and organizer communication endpoints. Reuse the existing service/controller pattern already used by events, registrations, payments, and analytics. *Depends on step 2.*
    4. Wire the new routes into the API surface and reuse the existing analytics/email infrastructure. Register the new route modules in `backend/src/routes/index.ts`, extend organizer analytics summaries to include volunteer and sponsor KPIs, and reuse `email.service.ts`, QR utilities, and payment/registration data where possible rather than introducing parallel logic. *Depends on step 3.*
    5. Build the frontend entry points for each persona. Add volunteer and sponsor onboarding/login flows, dedicated dashboards, and sidebar entries. Extend the organizer dashboard with sponsor discovery, volunteer hiring, budget, communication, and certificate actions, while preserving the current participant experience for registration, tickets, updates, feedback, and certificates. *Depends on step 1 and step 4.*
    6. Add the specialized UI for the new product promises. Create volunteer task allocation views, leadership board/achievement views, sponsor marketplace and event-matching views, budget analytics charts, communication panels, and certificate issuance views, using the existing shared UI library and organizer chart/table patterns as templates. *Depends on step 5.*
    7. Validate the integrated flow end to end. Confirm auth, routing, API typing, and dashboards still build for the existing student/organizer journeys, then verify the new volunteer/sponsor journeys and organizer workflows with focused backend/frontend checks. *Depends on steps 1 to 6.*

    **Relevant files**
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/models/User.ts` — expand the role contract.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/routes/auth.routes.ts` — widen signup validation.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/services/auth.service.ts` — persist and return the new roles.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/routes/index.ts` — mount volunteer/sponsor/certificate/budget routes.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/models/Event.ts` — add shared coordination fields only if needed.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/services/analytics.service.ts` — extend organizer KPIs.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/backend/src/services/email.service.ts` — reuse for notifications/certificates.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/lib/auth-context.tsx` — widen role types and auth state.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/lib/api.ts` — add typed endpoints for new modules.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/app/auth/signup/page.tsx` — add volunteer/sponsor signup paths.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/components/layout/sidebar.tsx` — add persona-specific navigation.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/app/organizer/page.tsx` — surface new organizer actions.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/components/organizer/*` — reuse chart/table patterns for new dashboards.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/app/volunteer/*` — new volunteer portal routes.
    - `c:/Users/varka/Desktop/Main Web Projects/Campus-Connect/frontend/app/sponsor/*` — new sponsor portal routes.

    **Verification**
    1. Run `npm run build` and `npm run lint` in `backend/` after backend changes.
    2. Run `npm run build` and `npm run lint` in `frontend/` after frontend changes.
    3. Exercise the existing student and organizer flows to ensure current event registration, ticketing, payments, check-in, and feedback still work.
    4. Exercise the new volunteer and sponsor flows end to end: signup, dashboard access, application/matching, task assignment, sponsor discovery, and certificate issuance.
    5. Confirm the API contract stays consistent by checking the typed client in `frontend/lib/api.ts` against the new backend routes and response envelopes.

    **Decisions**
    - Treat volunteers and sponsors as first-class roles instead of hiding them behind generic user profiles.
    - Keep the current participant and organizer modules stable; add new functionality around them rather than refactoring the working flows.
    - Prefer separate collections/services for volunteer and sponsor data so the platform can support matching, scoring, and ROI analytics without overloading the `Event` or `User` documents.
    - Reuse existing registration, payment, QR, feedback, analytics, and email code paths wherever possible.

    **Further Considerations**
    1. If you want sponsor access to be invite-only rather than self-service, the signup/auth step should split into public and invited sponsor onboarding.
    2. If volunteer leadership tracking needs more rigor, add a dedicated achievement/event-history model instead of computing scores on the fly from assignments.
    3. If budget tracking needs accounting-grade detail, define a separate budget ledger instead of a lightweight event budget summary.
