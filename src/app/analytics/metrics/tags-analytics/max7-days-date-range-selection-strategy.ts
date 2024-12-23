import { Injectable } from '@angular/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';

@Injectable()
export class Max7DaysDateRangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  constructor(private dateAdapter: DateAdapter<D>) {}

  // Called when user selects a date
  selectionFinished(date: D | null): DateRange<D> {
    return this.create7DayRange(date);
  }

  // Called when user adjusts the date range
  createPreview(activeDate: D | null): DateRange<D> {
    return this.create7DayRange(activeDate);
  }

  // Logic to restrict range to 7 days and not go beyond today
  private create7DayRange(date: D | null): DateRange<D> {
    if (date) {
      const today = this.dateAdapter.today(); // Current day
      const endDate = this.dateAdapter.addCalendarDays(date, 6); // Add 7 days to the start date
      const limitedEndDate = this.dateAdapter.compareDate(endDate, today) > 0 ? today : endDate;

      return new DateRange(date, limitedEndDate);
    }
    return new DateRange<D>(null, null);
  }
}
