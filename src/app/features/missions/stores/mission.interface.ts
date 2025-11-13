export enum MissionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ABORTED = 'ABORTED',
  OVER = 'OVER'
}

export interface SecretMission {
  id: string;
  codeName: string;
  geolocation: GeolocationCoordinates;
  summary: string;
  status: MissionStatus;
  startDate: string; // ISO format pour faciliter sérialisation JSON
  endDate: string; // ISO format
  assignedAgentNickname: string | null; // Un seul agent, référencé par son nickname
  durationWeeks: number; // Durée en semaines
}

export interface MissionState {
  missions: SecretMission[];
  isLoading: boolean;
  error: string | null;
  selectedMissionId: string | null;
}
