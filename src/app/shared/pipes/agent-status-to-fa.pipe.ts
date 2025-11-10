import { Pipe, PipeTransform } from '@angular/core';
import { SecretAgentStatus } from '../../features/secret-agents/stores/secret-agent.interface';

@Pipe({
  name: 'SecretAgentStatusToFA'
})
export class SecretAgentStatusToFaPipe implements PipeTransform {

  transform(value: SecretAgentStatus): string {
    let output = 'question';

        switch (value) {
          case SecretAgentStatus.CONTAMINATED:
            output = 'disease';
            break;
          case SecretAgentStatus.HOSTAGE:
            output = 'person-rifle';
            break;
          case SecretAgentStatus.DECEASED:
            output = 'cross';
            break;
          case SecretAgentStatus.OPERATIONAL:
            output = 'user-tie';
            break;
          case SecretAgentStatus.REST:
            output = 'martini-glass';
            break;
          case SecretAgentStatus.UNKNOWN:
            output = 'question';
            break;
        }
        return output;
      }
  }
