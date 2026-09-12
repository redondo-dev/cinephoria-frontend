// src/environments/environment.ci.ts
export const environment = {
  production: true,
  // ✅ localhost:3000 fonctionne car Cypress tourne sur le host
  // et le port 3000 est exposé dans docker-compose.ci.yml
  apiUrl: 'http://localhost:3000',
  hcaptchaSiteKey: '10000000-ffff-ffff-ffff-000000000001',
  stripePublicKey: 'pk_test_51...',
  forceProdApi: false,
};
