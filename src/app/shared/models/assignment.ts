import { SecretAgent } from '../../features/secret-agents/stores/secret-agent.interface';
import { SecretMission } from '../../features/missions/stores/mission.interface';

export interface Period {
  startDate: Date;
  endDate?: Date;
}

export interface Assigment {
  agent: SecretAgent;
  mission: SecretMission;
  period: Period;
}
