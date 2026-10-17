export default interface UpdateUptimeScheduleRequestInterfaceModel {
  // Already-composed by the frontend (Mode/Status/days/times folded into
  // one string) - same value the generic Field endpoint's own
  // "CurrentUptimeSchedule" case used to receive.
  currentUptimeSchedule: string | null;
  // Optional - the raw text from the modal's own Notes textarea.
  uptimeScheduleNote: string | null;
}
