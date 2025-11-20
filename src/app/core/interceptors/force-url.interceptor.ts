import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const forceUrlInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚨 [FORCE URL INTERCEPTOR] URL originale:', req.url);

  // CORRECTION FORCÉE - Si l'URL contient localhost:3000
  if (req.url.includes('localhost:3000')) {
    const correctedUrl = req.url.replace(
      'http://localhost:3000',
      environment.apiUrl
    );

    console.log('🚨 [FORCE URL INTERCEPTOR] URL CORRIGÉE:', correctedUrl);

    const correctedReq = req.clone({
      url: correctedUrl,
    });

    return next(correctedReq);
  }

  // CORRECTION 2 - Si l'URL commence par /api mais n'a pas le bon domaine
  if (req.url.startsWith('/api') && !req.url.includes('cinephoria-backend')) {
    const correctedUrl = `${environment.apiUrl}${req.url}`;

    console.log('🚨 [FORCE URL INTERCEPTOR] URL API CORRIGÉE:', correctedUrl);

    const correctedReq = req.clone({
      url: correctedUrl,
    });

    return next(correctedReq);
  }

  return next(req);
};
