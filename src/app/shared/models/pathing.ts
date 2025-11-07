import { SecretAgent } from '../../features/secret-agents/stores/secret-agent.interface';
import { Period } from './assignment';

export interface Movement {
  agentNickname: string;
  date: Date;
  location?: Geolocation;
}

export interface Pathing {
  movements: Movement[];
  period: Period;
}

export interface PathingPeriod {
  paths: Pathing[];
}
