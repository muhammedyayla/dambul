const AUTH_KEY = "dambul_authed_v1";

export function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === "1";
}

export function setAuthed(value: boolean) {
  if (value) {
    localStorage.setItem(AUTH_KEY, "1");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

