import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-engagements-ecologiques',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page">
      <h1>Nos engagements écologiques</h1>
      <p class="intro">Le cinéma est un plaisir à partager, et nous voulons qu'il le reste pour les générations futures.</p>
      <section class="grille">
        <article class="carte">
          <h2>🎟️ Billets 100 % numériques</h2>
          <p>Vos billets sont dématérialisés : plus de tickets papier, moins de déchets.</p>
        </article>
        <article class="carte">
          <h2>💡 Projection économe</h2>
          <p>Projecteurs laser et éclairages LED, bien moins gourmands en énergie.</p>
        </article>
        <article class="carte">
          <h2>♻️ Tri et recyclage</h2>
          <p>Bacs de tri dans nos halls et emballages recyclables ou compostables.</p>
        </article>
        <article class="carte">
          <h2>🌱 Énergie responsable</h2>
          <p>Nous privilégions un fournisseur d'électricité d'origine renouvelable.</p>
        </article>
      </section>
      <p class="cta">Prêt pour une séance responsable ? <a routerLink="/films">Découvrez nos films</a>.</p>
    </main>
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; padding: 48px 20px; color: #e5e5e5; }
    h1 { color: #e50914; margin-bottom: 8px; }
    .intro { color: #bdbdbd; max-width: 700px; }
    .grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin: 32px 0; }
    .carte { background: #1f1f1f; border: 1px solid #333; border-radius: 10px; padding: 20px; }
    .carte h2 { font-size: 1.1rem; margin: 0 0 8px; }
    .carte p { margin: 0; color: #bdbdbd; line-height: 1.5; }
    a { color: #e50914; }
  `],
})
export class EngagementsEcologiquesComponent {}
