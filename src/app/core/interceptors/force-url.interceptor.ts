import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export const forceUrlInterceptor: HttpInterceptorFn = (req, next) => {
  let finalUrl = req.url;

  // Si l'URL est relative (/api/films)
  if (req.url.startsWith('/api')) {
    finalUrl = `${environment.apiUrl}${req.url}`;
  }
  // Si l'URL contient localhost
  else if (req.url.includes('localhost')) {
    finalUrl = req.url.replace(/http:\/\/localhost:\d+/, environment.apiUrl);
  }
  // Si l'URL ne commence pas par https://cinephoria-backend
  else if (!req.url.startsWith(environment.apiUrl)) {
    finalUrl = req.url.replace(/^https?:\/\/[^/]+/, environment.apiUrl);
  }

  console.log('🔗 [FORCE URL] Original:', req.url);
  console.log('🔗 [FORCE URL] Final:', finalUrl);

  const correctedReq = req.clone({ url: finalUrl });
  return next(correctedReq);
};
