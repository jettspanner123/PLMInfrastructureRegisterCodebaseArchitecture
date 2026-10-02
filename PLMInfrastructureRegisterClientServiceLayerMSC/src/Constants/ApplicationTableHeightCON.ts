export default class ApplicationTableHeightCON {
  public static readonly EXTENDED: string = 'extended';
  public static readonly LIMITED: string = 'limited';
  public static readonly CUSTOM: string = 'custom';

  // The vertical space Limited mode (and Custom's floor) reserve for
  // everything above the table — must match index.css's
  // `calc(100vh - 12rem)` rule exactly, since this is how the Custom input's
  // live minimum is computed in JS.
  public static readonly RESERVED_VERTICAL_SPACE_PX: number = 192; // 12rem
}
