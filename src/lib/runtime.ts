export class MissingCredentialError extends Error {
  constructor(
    public readonly service: string,
    public readonly envVars: string[],
  ) {
    super(`${service} is not configured. Set ${envVars.join(", ")}.`);
    this.name = "MissingCredentialError";
  }
}

export function isRealMode() {
  return process.env.OPERATOR_MODE === "real";
}

export function envFlag(name: string, defaultValue = false) {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function requiredEnv(service: string, ...names: string[]) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new MissingCredentialError(service, missing);
}
