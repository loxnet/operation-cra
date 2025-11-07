import { Pipe, PipeTransform } from '@angular/core';
import { SecretAgentStatus } from '../../features/secret-agents/stores/secret-agent.interface';

@Pipe({
  name: 'agentStatus',
})
export class PictoFromAgentStatusPipe implements PipeTransform {
  transform(value: SecretAgentStatus): string {
    let output = '⭕';

    switch (value) {
      case SecretAgentStatus.CONTAMINATED:
        output = '☣️';
        break;
      case SecretAgentStatus.HOSTAGE:
        output = '⛓️';
        break;
      case SecretAgentStatus.DECEASED:
        output = '☠️';
        break;
      case SecretAgentStatus.OPERATIONAL:
        output = '✅';
        break;
      case SecretAgentStatus.REST:
        output = '🏖️';
        break;
      case SecretAgentStatus.UNKNOWN:
        output = '❓';
        break;
    }
    return output;
  }
}
