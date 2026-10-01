// Mirrors the backend's APIResponse<T> wrapper shape exactly.
export default interface APIResponseInterfaceModel<T> {
  status: boolean;
  message: string;
  data: T;
  errors: string[];
}
