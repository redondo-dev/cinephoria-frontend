import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employes-dashboard',
  standalone:true,
  imports: [RouterModule],
  templateUrl: './employes-dashboard.component.html',
  styleUrls: ['./employes-dashboard.component.scss'],
})
export class EmployesDashboardComponent {}
