import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecretAgent } from '../../../secret-agents/stores/secret-agent.interface';
import { SecretMission } from '../../stores/mission.interface';

export interface ReplacementDialogData {
  mission: SecretMission;
  currentAgent: SecretAgent;
  newAgent: SecretAgent;
  dropDate: Date;
}

@Component({
  selector: 'app-agent-replacement-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-replacement-dialog.html',
  styleUrl: './agent-replacement-dialog.scss',
})
export class AgentReplacementDialog {

  // Inputs
  data = input.required<ReplacementDialogData>();

  // Outputs
  confirm = output<void>();
  cancel = output<void>();

  /**
   * Formate une date
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Fermer si on clique sur le backdrop
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
