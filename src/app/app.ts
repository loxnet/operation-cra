import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SecretAgentListComponent } from './features/secret-agents/components/secret-agent-list/secret-agent-list.component';
import { HeaderComponent } from "./features/navigation/header/header.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('operation-cra');
}
