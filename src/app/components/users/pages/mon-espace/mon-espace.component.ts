import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandesComponent } from '../commande/commande.component';

@Component({
  selector: 'app-mon-espace',
  standalone: true,
  imports: [CommonModule,CommandesComponent],
  templateUrl: './mon-espace.component.html',
  styleUrls: ['./mon-espace.component.scss']
})
export class MonEspaceComponent {


}
