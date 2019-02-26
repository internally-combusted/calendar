/*  New Lunisolar Calendar Date Conversion
    (c) Ryan McGowan, 2019
    
    A script providing a function to convert Gregorian dates to a novel calendrical system.
    See https://internally-combusted.net/ for more info.
*/

// A simple object for storing lunisolar date information, with a toString method for pretty printing.
// Example: "1 Primus 966, Era 2"
class LunisolarDate {
    constructor(era, year, month, day) {
        this.era = era;
        this.year = year;
        this.month = month;
        this.day = day;
    }

    toString() {
        return this.day + " " + this.month + " " + this.year + ", Era " + this.era;
    }
}

// Returns a LunisolarDate object corresponding to the given Gregorian date.
function getLunisolarDate(gregorianDate) {
    "use strict";

    /*  There are multiple ways to do this.
     *  I've opted to precalculate the constants and store them in variables or arrays as appropriate.
     *  It would also be possible to have functions that calculate the values on the fly.
     *
     *  I chose to perform the calculations here when possible instead of hardcoding them as constants.
     *  This displays the logic of the calendar and the conversion process more clearly, instead of
     *  just having arrays of numbers with no indication as to how they were derived.
     *
     */

    // Literal constants: the fundamental values that define the calendar.
    const EPOCH = 1733175,  // The Julian Day of the calendar's epoch, set at March 5, AD 33.
          DAYS_HOLLOW_COMMONMONTH = 29, // The number of days in a normal hollow month.
          DAYS_FULL_COMMONMONTH = 30, // The number of days in a normal full month.
          DAYS_HOLLOW_LEAPMONTH = 30, // The number of days in a hollow leap month.
          DAYS_FULL_LEAPMONTH = 31, // The number of days in a full leap month.
          YEARS_METONICCYCLE = 19, // The number of years in each Metonic cycle.
          YEARS_SHORTCYCLE = 11, // The number of years in each short cycle.
          METONICCYCLE_LEAPYEARS = [3, 6, 9, 11, 14, 17, 19], // The years in each Metonic cycle that are leap years.
          SHORTCYCLE_LEAPYEARS = [3, 5, 8, 11], // The years in each short cycle that are leap years.
          CYCLES_ERA_METONICGROUPS = [16, 18, 18], // The number of Metonic cycles in each of the three groups of Metonic cycles.
          DAYS_ERA_CENTENNIALS = 10, // The number of Centennial Days in each era.
          SHORTCYCLES_ERA = 3, // The number of short cycles in each era.
          MONTH_NAMES = ["Primus", "Secundus", "Tertius", "Quartus", "Quintus", "Sextus",
                        "Septimus", "Octavus", "Nonus", "Decimus", "Undecimus", "Duodecimus",
                        "Extremus", "Saeculi"];

    // Derived constants: values that can be derived from the fundamentals.
    // I could hardcode many of these - there are always 372,912 days in an era, for instance.
    // I chose to calculate them instead to better show the logic of the calendar and the conversion process.

    // The calendar alternates between 29-day (hollow) and 30-day (full) months and Metonic cycles consequently alternate
    // in length as well. The exact length of a month or a cycle is therefore not fixed, so some calculations are simplified by
    // counting month or cycle *pairs*, which do have fixed lengths.

    const DAYS_MONTHPAIR = DAYS_HOLLOW_COMMONMONTH + DAYS_FULL_COMMONMONTH, // The number of days in any pair of consecutive normal (not leap) months.
          DAYS_COMMONYEAR = 6 * DAYS_FULL_COMMONMONTH + 6 * DAYS_HOLLOW_COMMONMONTH,
          DAYS_LONG_LEAPYEAR = DAYS_COMMONYEAR + DAYS_FULL_LEAPMONTH,
          DAYS_SHORT_LEAPYEAR = DAYS_COMMONYEAR + DAYS_HOLLOW_LEAPMONTH,
          DAYS_SHORTCYCLE = 7 * DAYS_COMMONYEAR + 2 * DAYS_LONG_LEAPYEAR + 2 * DAYS_SHORT_LEAPYEAR,
          DAYS_SHORT_METONICCYCLE = 12 * DAYS_COMMONYEAR + 3 * DAYS_LONG_LEAPYEAR + 4 * DAYS_SHORT_LEAPYEAR,
          DAYS_LONG_METONICCYCLE = 12 * DAYS_COMMONYEAR + 4 * DAYS_LONG_LEAPYEAR + 3 * DAYS_SHORT_LEAPYEAR,
          DAYS_METONICYCLE_PAIR = DAYS_SHORT_METONICCYCLE + DAYS_LONG_METONICCYCLE, // Days in any pair of consecutive Metonic cycles.
          DAYS_ERA_METONICGROUPS = CYCLES_ERA_METONICGROUPS.map( (cycles) => { return parseInt(cycles / 2) * DAYS_METONICYCLE_PAIR } ),
          DAYS_ERA = CYCLES_ERA_METONICGROUPS.reduce( (sum, groupCycles) => { return sum + groupCycles / 2 * DAYS_METONICYCLE_PAIR }, 0 )
                        + SHORTCYCLES_ERA * DAYS_SHORTCYCLE + DAYS_ERA_CENTENNIALS;

    // The year in the era each cycle group begins.
    var cycleGroupFirstYears = [1];
    cycleGroupFirstYears.push(cycleGroupFirstYears[0] + CYCLES_ERA_METONICGROUPS[0] * YEARS_METONICCYCLE);
    cycleGroupFirstYears.push(cycleGroupFirstYears[1] + YEARS_SHORTCYCLE);
    cycleGroupFirstYears.push(cycleGroupFirstYears[2] + CYCLES_ERA_METONICGROUPS[1] * YEARS_METONICCYCLE);
    cycleGroupFirstYears.push(cycleGroupFirstYears[3] + YEARS_SHORTCYCLE);
    cycleGroupFirstYears.push(cycleGroupFirstYears[4] + CYCLES_ERA_METONICGROUPS[2] * YEARS_METONICCYCLE);

    // Returns an array specifying whether each year in the given cycle type is short or long, leap or common.
    // `cycleType` should be one of "Short Metonic", "Long Metonic", or "Short".
    // Array elements are objects of the form {isLong, isCommon}.
    function precalcYearTypes(cycleType) {
        var common = true,
            long = cycleType.startsLong,
            numYears = (cycleType.isMetonic) ? YEARS_METONICCYCLE : YEARS_SHORTCYCLE,
            leapYears = (cycleType.isMetonic) ? METONICCYCLE_LEAPYEARS : SHORTCYCLE_LEAPYEARS,
            yearTypes = new Array();

        for (let i = 0; i < numYears; i++) {
            common = !leapYears.includes(i + 1);
            yearTypes[i] = {isLong: long, isCommon: common};

            // The value of `long` is based on whether a year begins with a full or hollow month,
            // so it doesn't change after years with an even number of months; only leap years, which have
            // thirteen months.
            if (!common) {
                common = true;
                long = !long;
            }
        }
        return yearTypes;
    }

    const YEARTYPES_LONGMETONIC = precalcYearTypes({isMetonic: true, startsLong: true}),
          YEARTYPES_SHORTMETONIC = precalcYearTypes({isMetonic: true, startsLong: false}),
          YEARTYPES_SHORTCYCLE = precalcYearTypes({isMetonic: false, startsLong: true});

    // Returns an array of size 10 containing the day numbers of the Centennial Days in each era.
    function precalcCentennials() {
        var centennials = new Array(10).fill(0),
            metonicYears = 0,
            completedShortCycles = 0,
            remainderDays = 0,
            completedMetonicCycles,
            completedLongMetonicCycles,
            completedShortMetonicCycles,
            priorCentennials,
            remainderYears;

        for (let i = 100; i <= 1000; i += 100) {
            completedShortCycles = 0;
            metonicYears = i;

            // Check whether we've passed any short cycles.
            // The final short cycle begins in 1011 and the final Centennial Day is in 1000,
            // so we only worry about the first two short cycles.
            if (cycleGroupFirstYears[2] <= i) { metonicYears -= YEARS_SHORTCYCLE; completedShortCycles++; };
            if (cycleGroupFirstYears[4] <= i) { metonicYears -= YEARS_SHORTCYCLE; completedShortCycles++; };

            // Because long and short Metonic cycles alternate, starting with a long cycle,
            // when there's an odd number of cycles, the extra one is always long.
            completedMetonicCycles = parseInt(metonicYears / YEARS_METONICCYCLE);
            completedLongMetonicCycles = completedShortMetonicCycles = parseInt(completedMetonicCycles / 2);
            if (completedMetonicCycles % 2 === 1) { completedLongMetonicCycles++; }

            remainderYears = i - completedShortCycles * YEARS_SHORTCYCLE - completedMetonicCycles * YEARS_METONICCYCLE;
            remainderDays = remainderYears * DAYS_COMMONYEAR;
            for (let j = 0; remainderYears >= METONICCYCLE_LEAPYEARS[j]; j++) {
                remainderDays += DAYS_HOLLOW_LEAPMONTH;

                // The leap month is one day longer in long leap years.
                // Odd Metonic cycles are long and even ones are short.
                // In a long Metonic cycle, the first, third, fifth, and seventh leap years are long;
                // in a short Metonic cycle, the second, fourth, and sixth are long.
                // So if odd cycle AND even leap year, add a day;
                // if even Metonic AND odd leap year, add a day.
                //
                // Note that the *current* cycle is `completedMetonicCycles` plus 1, so the test is
                // for even && even or odd && odd, instead of odd && even as described above.
                remainderDays += (completedMetonicCycles % 2 === j % 2) ? 1 : 0;
            }

            priorCentennials = i / 100 - 1;

            // The number of prior Centennial Days just happens to coincide with this array index.
            centennials[priorCentennials] += completedLongMetonicCycles * DAYS_LONG_METONICCYCLE;
            centennials[priorCentennials] += completedShortMetonicCycles * DAYS_SHORT_METONICCYCLE;
            centennials[priorCentennials] += completedShortCycles * DAYS_SHORTCYCLE;
            centennials[priorCentennials] += priorCentennials;
            centennials[priorCentennials] += remainderDays;
            centennials[priorCentennials] += 1;
        }

        return centennials;
    }

    // Day numbers for the ten Centennial Days.
    const CENTENNIAL_DAYS = precalcCentennials();

    // The days in an era on which each cycle group begins.
    var cycleGroupFirstDays = [1];
    cycleGroupFirstDays.push(cycleGroupFirstDays[0] + DAYS_ERA_METONICGROUPS[0]);
    cycleGroupFirstDays[1] += centennialDaysPassed(cycleGroupFirstDays[1]);

    cycleGroupFirstDays.push(cycleGroupFirstDays[1] + DAYS_SHORTCYCLE);

    cycleGroupFirstDays.push(cycleGroupFirstDays[2] + DAYS_ERA_METONICGROUPS[1]);
    cycleGroupFirstDays[3] += centennialDaysPassed(cycleGroupFirstDays[3]) - centennialDaysPassed(cycleGroupFirstDays[1]);

    cycleGroupFirstDays.push(cycleGroupFirstDays[3] + DAYS_SHORTCYCLE);

    cycleGroupFirstDays.push(cycleGroupFirstDays[4] + DAYS_ERA_METONICGROUPS[2]);
    cycleGroupFirstDays[5] += centennialDaysPassed(cycleGroupFirstDays[5]) - centennialDaysPassed(cycleGroupFirstDays[3]);

    // Generates an array containing the day number on which each year in a Metonic cycle begins.
    // `length` should be one of "long" or "short", indicating which type of cycle the array is being generated for.
    function precalcMetonicYearFirstDays(length) {
        var days = [1],
            long = (length === "long") ? 1 : 0,
            nextValue = 0,
            leapCount = 0;

        for (let i = 1; i < 19; i++) {
            nextValue = days[i - 1] + DAYS_COMMONYEAR;
            if (METONICCYCLE_LEAPYEARS.includes(i)) {
                leapCount++;
                nextValue += DAYS_HOLLOW_LEAPMONTH;

                // Odd leap years in long cycles are long, as are even leap years in short cycles.
                if (leapCount % 2 === long) { nextValue++; }
            }
            days.push(nextValue);
        }
        return days;
    }

    // As above. Should probably be collapsed into precalcMetonicYearFirstDays at some point.
    function precalcShortFirstDays() {
        var days = [1];
        var nextValue = 0, leapCount = 0;
        for (let i = 1; i < 11; i++) {
            nextValue = days[i - 1] + DAYS_COMMONYEAR;
            if (SHORTCYCLE_LEAPYEARS.includes(i)) {
                leapCount++;
                if (leapCount % 2 === 0) {
                    nextValue += DAYS_HOLLOW_LEAPMONTH;
                } else {
                    nextValue += DAYS_FULL_LEAPMONTH;
                }
            }
            days.push(nextValue);
        }
        return days;
    }

    // The days in a cycle on which each year begins.
    const YEAR_START_DAYS_LONGMETONIC = precalcMetonicYearFirstDays("long");
    const YEAR_START_DAYS_SHORTMETONIC = precalcMetonicYearFirstDays("short");
    const YEAR_START_DAYS_SHORTCYCLE = precalcShortFirstDays();

    // Returns the Julian day number for a given Gregorian date.
    function getJulianDay(gregorianDate) {
        var year = gregorianDate.getFullYear(),
            month = gregorianDate.getMonth() + 1, // Javascript's Date month field is 0-based for some reason
            day = gregorianDate.getDate();

        // A term that is repeated in the conversion formula.
        // Doing this just makes things a little more readable.
        var M = parseInt((month - 14) / 12);

        // The internet said that these all have to be integer divisions.
        return parseInt((1461 * (year + 4800 + M)) / 4) + parseInt((367 * (month - 2 - 12 * M)) / 12)
                - parseInt((3 * ((year + 4900 + M + 100) / 100)) / 4) + day - 32075 - 1;
    }

    /* Returns the cycle group, number, year, and day for the given day as an object of the form {group, cycle, year, day}.
    `group` will be in [1, 6].
    `cycle` will be in [1, 18].
    `year` will be in [1, years in cycle].
    `day` will be in [1, days in year].

    Note that the day value returned here DOES NOT ACCOUNT FOR CENTENNIAL DAYS.
    */
    function getCycleForDay(day) {
        var cycleDay = day,
            nextCycleGroupIndex = cycleGroupFirstDays.findIndex( (cycleBeginDay) => { return cycleBeginDay > cycleDay; } );

        // If we couldn't find a cycle group starting at a day later than the current day, we must be in the last cycle group.
        // `nextCycleGroupIndex` should never be 0, so there's no possibility of a negative array index with the subtraction here.

        // nextCycleGroupIndex - 1 to get current index, + 1 to get real number from index
        var cycleGroup = (nextCycleGroupIndex === -1) ? 6 : nextCycleGroupIndex;
        cycleDay = cycleDay - cycleGroupFirstDays[cycleGroup - 1] + 1;

        var cycleNumber;
        // Cycle groups 2, 4, and 6 are short cycles with only one cycle in the group.
        if (cycleGroup % 2 === 0) { cycleNumber = 1; }
        else {
            cycleNumber = parseInt(cycleDay / DAYS_METONICYCLE_PAIR) * 2 + 1;
            if (cycleDay % DAYS_METONICYCLE_PAIR > DAYS_LONG_METONICCYCLE) { cycleNumber++; }

            cycleDay = cycleDay % DAYS_METONICYCLE_PAIR;
            if (cycleDay > DAYS_LONG_METONICCYCLE) { cycleDay -= DAYS_LONG_METONICCYCLE };
        }

        // Load up the correct cycle starting day information for the current type of cycle.
        var currentCycleFirstDays;
        if (cycleGroup % 2 === 0) { currentCycleFirstDays = YEAR_START_DAYS_SHORTCYCLE; } else {
            if (cycleNumber % 2 === 1) {
                currentCycleFirstDays = YEAR_START_DAYS_LONGMETONIC;
            } else { currentCycleFirstDays = YEAR_START_DAYS_SHORTMETONIC; }
        }

        var cycleYear = currentCycleFirstDays.findIndex( (startDay) => { return cycleDay < startDay } );
        cycleDay = cycleDay - currentCycleFirstDays[cycleYear - 1] + 1;

        return {group: cycleGroup, cycle: cycleNumber, year: cycleYear, day: cycleDay};
    }

    // Returns the number of Centennial Days that have occurred by the given day in the era.
    function centennialDaysPassed(day) {
        var daysPassed = CENTENNIAL_DAYS.findIndex( (centennialDay) => { return centennialDay >= day; } );
        if (daysPassed === -1) { daysPassed = CENTENNIAL_DAYS.length; }
        return daysPassed;
    }

    // Returns how many Centennial Days are contained in the given span of years.
    // This implementation isn't accurate for every case, but it works for this application.
    // (Specifically, the span 900-901 contains one Centennial, but this function would return 0.)
    // We're only using this to find the number of centennials in each cycle group, so it all works out.
    function numberOfCentennialsInSpan(startYear, endYear) { return parseInt(endYear / 100) - parseInt(startYear / 100); }

    // Returns the corresponding lunisolar calendar date for a given Gregorian date.
    // The return value is a LunisolarDate object.
    // All values are 1-based (the first era is 1, not 0).
    function convertToLunisolar(gregorianDate) {
        var julianDay = getJulianDay(gregorianDate),
            dayFromEpoch = julianDay - EPOCH,
            era = parseInt(dayFromEpoch / DAYS_ERA) + 1,
            dayInEra = dayFromEpoch - (era - 1) * DAYS_ERA + 1,
            cycleData = getCycleForDay(dayInEra),
            year = cycleGroupFirstYears[cycleData.group - 1] + (cycleData.cycle - 1) * YEARS_METONICCYCLE + cycleData.year - 1;

        cycleData.day -= numberOfCentennialsInSpan(cycleGroupFirstYears[cycleData.group - 1], year);

        var currentCycleYearTypes;
        if (cycleData.group % 2 === 0) {
            currentCycleYearTypes = YEARTYPES_SHORTCYCLE;
        } else {
            currentCycleYearTypes = (cycleData.cycle % 2 === 1) ? YEARTYPES_LONGMETONIC : YEARTYPES_SHORTMETONIC;
        }

        var yearType = currentCycleYearTypes[cycleData.year];
        var completedMonthPairs = parseInt(cycleData.day / DAYS_MONTHPAIR);
        var month = completedMonthPairs * 2 + 1;
        var firstMonthEndingDay = (yearType.isLong) ? DAYS_FULL_COMMONMONTH : DAYS_HOLLOW_COMMONMONTH;
        var day = cycleData.day - completedMonthPairs * DAYS_MONTHPAIR;
        if (day > firstMonthEndingDay) {
            day -= firstMonthEndingDay;
            month++;
        };

        return new LunisolarDate(era, year, MONTH_NAMES[month - 1], day);
    }

    return convertToLunisolar(gregorianDate);
}

function lunisolar_today() {
    document.write(getLunisolarDate(new Date(Date.now())));
}
