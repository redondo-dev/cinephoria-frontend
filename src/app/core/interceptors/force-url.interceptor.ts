import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const PROD_API = 'https://cinephoria-backend-i6be.onrender.com';

export const forceUrlInterceptor: HttpInterceptorFn = (req, next) => {
  let url = req.url;

  // Forcer TOUJOURS l'URL de production
  if (url.includes('localhost') || url.startsWith('/api')) {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    url = `${PROD_API}${path}`;
    console.log('✅ [FORCE URL] Corrigé:', url);
    console.log('📦 [FORCE URL] Params conservés:', req.params.toString());
  }
  return next(req.clone({ url }));
};
