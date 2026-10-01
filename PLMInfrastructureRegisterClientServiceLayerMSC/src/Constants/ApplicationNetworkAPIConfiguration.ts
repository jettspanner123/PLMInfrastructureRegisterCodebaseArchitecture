export default class ApplicationNetworkAPIConfiguration {
  public static readonly API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5114';
}
