import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SecretAgentListComponent } from './features/secret-agents/components/secret-agent-list/secret-agent-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('operation-cra');
}
