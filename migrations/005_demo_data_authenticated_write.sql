-- Migration Version: 005_demo_data_authenticated_write
-- Description: Allow signed-in private-preview users to generate and clear only demo-trk-* demo records.

-- These policies intentionally do not grant broad write access. They only permit
-- authenticated users to manage records created by the SaaS demo data generator.
-- Existing user-created records remain governed by the admin-only write policies.

DROP POLICY IF EXISTS "Demo generator write risks" ON public.risks;
CREATE POLICY "Demo generator write risks" ON public.risks
FOR ALL TO authenticated
USING (
    id LIKE 'demo-trk-risk-%'
    AND title LIKE '[DEMO Trackier SaaS]%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    id LIKE 'demo-trk-risk-%'
    AND title LIKE '[DEMO Trackier SaaS]%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write risk relationships" ON public.risk_relationships;
CREATE POLICY "Demo generator write risk relationships" ON public.risk_relationships
FOR ALL TO authenticated
USING (
    parent_id LIKE 'demo-trk-risk-%'
    AND child_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    parent_id LIKE 'demo-trk-risk-%'
    AND child_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write risk fragilities" ON public.risk_fragilities;
CREATE POLICY "Demo generator write risk fragilities" ON public.risk_fragilities
FOR ALL TO authenticated
USING (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write assurance mappings" ON public.assurance_mappings;
CREATE POLICY "Demo generator write assurance mappings" ON public.assurance_mappings
FOR ALL TO authenticated
USING (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write controls" ON public.controls;
CREATE POLICY "Demo generator write controls" ON public.controls
FOR ALL TO authenticated
USING (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write kris" ON public.kris;
CREATE POLICY "Demo generator write kris" ON public.kris
FOR ALL TO authenticated
USING (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write actions" ON public.actions;
CREATE POLICY "Demo generator write actions" ON public.actions
FOR ALL TO authenticated
USING (
    id LIKE 'demo-trk-act-%'
    AND risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    id LIKE 'demo-trk-act-%'
    AND risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write trends" ON public.trend_logs;
CREATE POLICY "Demo generator write trends" ON public.trend_logs
FOR ALL TO authenticated
USING (
    risk_id LIKE 'demo-trk-risk-%'
    AND active_user = 'Demo Data Generator'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    risk_id LIKE 'demo-trk-risk-%'
    AND active_user = 'Demo Data Generator'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);

DROP POLICY IF EXISTS "Demo generator write risk to objectives" ON public.risk_to_objectives;
CREATE POLICY "Demo generator write risk to objectives" ON public.risk_to_objectives
FOR ALL TO authenticated
USING (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
)
WITH CHECK (
    risk_id LIKE 'demo-trk-risk-%'
    AND (
        organization_id = '00000000-0000-0000-0000-000000000000'::uuid
        OR organization_id = NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
    )
);
