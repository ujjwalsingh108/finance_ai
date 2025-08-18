import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function postAuthSetup(
  supabase: SupabaseClient,
  user: User,
  mode?: string
) {
  // 1. Check if user already has an org
  const { data: existingMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existingMember) return existingMember.organization_id;

  // 2. Determine workspace name
  const workspaceName =
    mode === "organization"
      ? `${user.email?.split("@")[0]}'s Company`
      : `${user.email?.split("@")[0]}'s Workspace`;

  // 3. Create org
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert([
      {
        name: workspaceName,
        metadata: { is_personal: mode !== "organization" },
      },
    ])
    .select()
    .single();

  if (orgError) throw new Error(orgError.message);

  // 4. Assign role
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", mode === "organization" ? "user" : "owner")
    .single();

  if (roleError) throw new Error(roleError.message);

  // 5. Add member
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert([
      {
        organization_id: org.id,
        user_id: user.id,
        role_id: role.id,
        is_owner: mode !== "organization",
      },
    ]);

  if (memberError) throw new Error(memberError.message);

  // 6. Merge existing profile metadata with new fields
  const { data: existingProfile, error: fetchProfileError } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", user.id)
    .single();

  if (fetchProfileError) throw new Error(fetchProfileError.message);

  const mergedMetadata = {
    ...(existingProfile?.metadata || {}), // keep old metadata
    organization_id: org.id,
    role: "owner",
    is_personal: mode !== "organization",
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      metadata: mergedMetadata, // assuming 'metadata' is a JSONB column
    })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  return org.id;
}
