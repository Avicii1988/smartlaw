let app: any;
let appError: any;

try {
  app = require('../server/src/index').default;
} catch (e: any) {
  appError = e;
}

export default function handler(req: any, res: any) {
  if (appError || !app) {
    return res.status(500).json({
      error: 'App failed to initialize',
      message: appError?.message ?? 'unknown',
      stack: appError?.stack?.split('\n').slice(0, 5) ?? [],
    });
  }
  return app(req, res);
}
