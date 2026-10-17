/** Kendi profiline gidince düzenleme, başkasınınkine gidince keşif şablonu. */
export function openProfile(
  router: { push: (href: any) => void },
  currentUserId: string | null | undefined,
  targetUserId: string | null | undefined
) {
  if (!targetUserId) return;
  if (currentUserId && currentUserId === targetUserId) {
    router.push("/settings" as any);
    return;
  }
  router.push(`/profile/${targetUserId}` as any);
}
