export default interface CreateEnvironmentUptimeRequestInputInterfaceModel {
  environment: string;
  // Naive "YYYY-MM-DDTHH:mm" straight from a <input type="datetime-local">
  // field - interpreted server-side as CET/CEST (Europe/Berlin) wall-clock
  // time, never as UTC and never as the browser's own local time.
  fromAt: string;
  toAt: string;
  message?: string;
}
