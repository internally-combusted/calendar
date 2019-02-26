//
//  DateTextField.m
//  Calendar
//
//  (c) 2019 Ryan McGowan
//

#import "DateTextField.h"


@implementation DateTextField

- (void) update
{
	NSCalendar *gregorian = [[NSCalendar alloc] initWithCalendarIdentifier:NSGregorianCalendar];
	NSDateComponents *components = [gregorian components:(NSYearCalendarUnit | NSMonthCalendarUnit | NSDayCalendarUnit) fromDate:[selectedDate dateValue]];
	
	NSInteger M1 = ([components month]-14)/12;
	NSInteger Y1 = [components year] + 4800;
	NSInteger JD = 1461*(Y1+M1)/4 + 367*([components month]-2-12*M1)/12 - (3*((Y1+M1+100)/100))/4 + [components day] - 32075 - 1;
	NSLog([NSString stringWithFormat:@"%d",JD]);
	// Calculate Aovren day number.
	
	NSInteger AovrenDate = JD - 1733176;
	if (AovrenDate >= 0)
	{
		AovrenDate = AovrenDate + 1;
	}
	
	if (AovrenDate > 0)
	{
		NSInteger Era = 1;
		NSInteger Day = 0;
		NSInteger Month = 1;
		NSInteger Year = 1;
		NSInteger YearInCycle = 1;
		NSInteger Cycle = 1;
		NSInteger MaxDays = 30;
		NSInteger MaxMonths = 12;
		NSInteger MaxYears = 19;
		
		BOOL Leap = NO;
		BOOL Full = YES;
		BOOL Centurial = NO;
		
		NSInteger i;
		
		for(i = 1; i <= AovrenDate; i = i + 1)
		{
			Day = Day + 1; // Increment day.
			
			// Handle month changeover.
			if (Day > MaxDays)
			{
				Day = 1; // Reset day.
				Month = Month + 1; // Increment month.
				
				// Handle year changeover.
				if (Month > MaxMonths)
				{
					Month = 1; // Reset month.
					Year = Year + 1; // Increment year.
					YearInCycle = YearInCycle + 1; // Increment year in cycle.
					
					MaxMonths = 12; // Reset maximum months.
					if (Year % 100 == 0)
					{
						MaxMonths = MaxMonths + 1;
					}
					
					if (YearInCycle > MaxYears)
					{
						YearInCycle = 1; // Reset year in cycle.
						Cycle = Cycle + 1; // Increment cycle.
						
						if (Cycle == 17 || Cycle == 36 || Cycle == 55)
						{
							MaxYears = 11;
						}
						else
						{
							MaxYears = 19;
						}
					}
					
					if ((MaxYears == 11) && ((YearInCycle == 3) || (YearInCycle == 5) || (YearInCycle == 8) || (YearInCycle == 11)))
					{
						MaxMonths = MaxMonths + 1;
						Leap = YES;
					}		
					else if ((MaxYears == 19) && ((YearInCycle == 3) || (YearInCycle == 6) || (YearInCycle == 9) || (YearInCycle == 11) || (YearInCycle == 14) || (YearInCycle == 17) || (YearInCycle == 19)))
					{
						MaxMonths = MaxMonths + 1;
						Leap = YES;
					}
					else
						Leap = NO;
				}
				
				if (Month == 14) {
					MaxDays = 1;
					Centurial = YES;
				}
				else if (Month == 13 && !Leap) {
					MaxDays = 1;
					Centurial = YES;
				}
				else
				{
					Centurial = NO;
					
					if (Full)
						Full = NO;
					else
						Full = YES;
					
					MaxDays = Full ? 30 : 29;
					
					if (Month == 13)
						MaxDays = MaxDays + 1;
				}
				
				if (Year > 1021)
				{
					// Reset all for the new era.
					Year = 1;
					YearInCycle = 1;
					Month = 1;
					Cycle = 1;
					MaxDays = 30;
					MaxMonths = 12;
					MaxYears = 19;					
					Era = Era + 1;
				}
			}
		}
		
		NSString *MonthString;
		
		if (Month == 1)
			MonthString = @"primus";
		else if (Month == 2) 
			MonthString = @"secundus";
		else if (Month == 3) 
			MonthString = @"tertius";
		else if (Month == 4) 
			MonthString = @"quartus";
		else if (Month == 5) 
			MonthString = @"quintus";
		else if (Month == 6) 
			MonthString = @"sextus";
		else if (Month == 7) 
			MonthString = @"septimus";
		else if (Month == 8) 
			MonthString = @"octavus";
		else if (Month == 9) 
			MonthString = @"nonus";
		else if (Month == 10) 
			MonthString = @"decimus";
		else if (Month == 11) 
			MonthString = @"undecimus";
		else if (Month == 12) 
			MonthString = @"duodecimus";
		else if (Month == 13 && Leap) 
			MonthString = @"extremus";
		else 
			MonthString = @"saeculi";		
		
		
		[avMonthType setStringValue:((Centurial) ? @"centurial" : ((Full) ? @"full" : @"hollow"))];
		[avYearType setStringValue:((Leap) ? @"leap" : @"common" )];
		[self setStringValue:[NSString stringWithFormat:@"%d %@ %d (Era %d)", Day, MonthString, Year, Era]];
	}
}

@end
