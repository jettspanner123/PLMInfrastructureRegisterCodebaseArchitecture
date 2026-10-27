export default class EnvironmentNameListUtility {
  public static current: EnvironmentNameListUtility = new EnvironmentNameListUtility();

  // EnvironmentOverviewNexus.Environment sometimes stores multiple names on
  // one row, newline-separated (e.g. "24x OOTB\n25x OOTB") - splits every
  // row's value into individual names, trims, drops blanks, de-duplicates,
  // and sorts, so a dropdown built from this always lists one real
  // environment name per option.
  public splitToIndividualEnvironmentNames(rawEnvironmentValues: string[]): string[] {
    const individualNames = rawEnvironmentValues
      .flatMap((value) => value.split('\n'))
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    return Array.from(new Set(individualNames)).sort((a, b) => a.localeCompare(b));
  }
}
