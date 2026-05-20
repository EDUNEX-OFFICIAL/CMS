export type DevQuickLogin = {
  label: string;
  email: string;
  password: string;
};

function isDevQuickLogin(value: unknown): value is DevQuickLogin {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.label === "string" &&
    entry.label.length > 0 &&
    typeof entry.email === "string" &&
    entry.email.length > 0 &&
    typeof entry.password === "string" &&
    entry.password.length > 0
  );
}

export function getDevQuickLogins(): DevQuickLogin[] {
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  const raw = process.env.NEXT_PUBLIC_DEV_QUICK_LOGINS;
  if (!raw?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("[dev-credentials] NEXT_PUBLIC_DEV_QUICK_LOGINS must be a JSON array");
      return [];
    }
    return parsed.filter(isDevQuickLogin);
  } catch {
    console.warn("[dev-credentials] Failed to parse NEXT_PUBLIC_DEV_QUICK_LOGINS");
    return [];
  }
}
