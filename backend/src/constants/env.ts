export const ENV = {
    POLYGON_API_KEY: 'POLYGON_API_KEY',
    RAPIDAPI_KEY:    'RAPIDAPI_KEY',
    RAPIDAPI_HOST:   'RAPIDAPI_HOST',
    CURRENCY_API_KEY: 'CURRENCY_API_KEY',
  } as const;
  
  export function getEnv(key: keyof typeof ENV): string {
    const v = process.env[ENV[key]];
    if (!v) throw new Error(`Missing env var: ${ENV[key]}`);
    return v;
  }
  