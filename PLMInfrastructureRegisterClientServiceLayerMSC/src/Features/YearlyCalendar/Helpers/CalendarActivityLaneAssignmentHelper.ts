import type { YearMonthDay } from '../Constants/YearlyCalendarCON';
import type CalendarActivityInterfaceModel from '../../../Models/CalendarActivityInterfaceModel';

// A fetched CalendarActivityInterfaceModel plus the display state the
// controller derives client-side (color by creation order, "Backdated") and
// its start/end clipped to CET wall-clock YearMonthDay terms - see
// data-model.md's "derived, non-persisted display state".
export interface CalendarActivityWithDisplayState {
  activity: CalendarActivityInterfaceModel;
  startYmd: YearMonthDay;
  endYmd: YearMonthDay;
  colorKey: 'blue' | 'green' | 'amber';
  isBackdated: boolean;
}

export interface WeekActivityLaneAssignment {
  activity: CalendarActivityInterfaceModel;
  colorKey: 'blue' | 'green' | 'amber';
  isBackdated: boolean;
  laneIndex: number;
  startColumn: number; // 0-6, this activity's first visible column within the given week
  columnSpan: number; // 1-7, how many columns within the week this activity occupies
}

function toComparable(ymd: YearMonthDay): number {
  return ymd.year * 10000 + ymd.monthIndex * 100 + ymd.day;
}

// Packs every activity touching a given week into the lowest-numbered
// display lane such that no two activities sharing a lane overlap on any
// shared day within that week - a greedy interval-packing pass, recomputed
// fresh per week row, with no fixed maximum lane count (specs/015-yearly-
// calendar research.md §6 / specs/016-calendar-activity-backend research.md
// §6 - capping to 3 + "Show +X More" happens at the render site, not here).
// An activity spanning multiple weeks is clipped to each week's own 7
// columns and may land in a different lane in each week it touches, since
// each week row is laid out independently.
export default class CalendarActivityLaneAssignmentHelper {
  public static current: CalendarActivityLaneAssignmentHelper = new CalendarActivityLaneAssignmentHelper();

  public assignLanesForWeek(
    week: YearMonthDay[],
    activities: CalendarActivityWithDisplayState[]
  ): WeekActivityLaneAssignment[] {
    const weekStart = toComparable(week[0]);
    const weekEnd = toComparable(week[6]);

    const touching = activities.filter((entry) => {
      const activityStart = toComparable(entry.startYmd);
      const activityEnd = toComparable(entry.endYmd);
      return activityStart <= weekEnd && activityEnd >= weekStart;
    });

    const clipped = touching
      .map((entry) => {
        const activityStart = toComparable(entry.startYmd);
        const activityEnd = toComparable(entry.endYmd);
        const startColumn = week.findIndex((day) => toComparable(day) >= Math.max(activityStart, weekStart));
        const endColumn = 6 - [...week].reverse().findIndex((day) => toComparable(day) <= Math.min(activityEnd, weekEnd));
        return {
          activity: entry.activity,
          colorKey: entry.colorKey,
          isBackdated: entry.isBackdated,
          startColumn,
          columnSpan: endColumn - startColumn + 1,
        };
      })
      .sort((a, b) => a.startColumn - b.startColumn || b.columnSpan - a.columnSpan);

    const laneLastEndColumn: number[] = [];
    const assignments: WeekActivityLaneAssignment[] = [];

    for (const entry of clipped) {
      let laneIndex = laneLastEndColumn.findIndex((lastEndColumn) => lastEndColumn < entry.startColumn);
      if (laneIndex === -1) {
        laneIndex = laneLastEndColumn.length;
        laneLastEndColumn.push(entry.startColumn + entry.columnSpan - 1);
      } else {
        laneLastEndColumn[laneIndex] = entry.startColumn + entry.columnSpan - 1;
      }
      assignments.push({ ...entry, laneIndex });
    }

    return assignments;
  }
}
