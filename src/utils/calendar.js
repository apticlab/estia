import { api } from "./api.js";

const days = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

const hourToIndex = {
  8: 0,
  10: 1,
  14: 2,
  16: 3
};

export default class Calendar {
  constructor(
    date = -1,
    dateIndex = null,
    dateSelected = null,
    dateToSelect = null,
    hourToSelect = null
  ) {
    this.dateIndex = date;
    this.date = dateIndex;
    this.dateSelected = dateSelected;
    this.dateToSelect = dateToSelect;
    this.hourToSelect = hourToSelect;
  }

  static getDateSession(userId) {
    let dateSessions = [];

    for (var i = 0; i < 3; i++) {
      dateSessions.push(null);
    }

    return dateSessions;
  }

  static getSelectedDate() {
    let dateObject = {
      date: this.dateToSelect ? new Date(this.dateToSelect).getTime() : -1,
      hour: this.hourToSelect ? hourToIndex[this.hourToSelect] : -1
    };

    return dateObject;
  }

  static getSelectedDateAndIndex() {
    let dateObject = {
      date: this.date,
      index: this.dateIndex
    };

    this.date = null;
    this.dateIndex = null;

    return dateObject;
  }

  static setIndex(index) {
    this.dateIndex = index;
  }

  static setSelectedDate(date) {
    let selectedDate = new Date(date);

    this.hourToSelect = selectedDate.getHours();

    selectedDate.setHours(0, 0, 0, 0);

    this.dateToSelect = selectedDate;
  }

  static setDate(date) {
    this.dateToSelect = null;
    this.hourToSelect = null;

    this.date = date;
  }

  static saveAvailabilities(weeks, coach) {
    let availabilities = [];

    weeks.forEach(week => {
      week.forEach(day => {
        if (day.hasChanges) {
          let utcDate = new Date(day.timestamp);
          const utcOffsetMillis = utcDate.getTimezoneOffset() * -1 * 60 * 1000;

          utcDate = new Date(day.timestamp + utcOffsetMillis);

          availabilities.push({
            id: day.id,
            coach: {
              id: coach.id
            },
            date: utcDate,
            has_available: day.hasAvailable,
            hour_1_available: day.hours[1].available,
            hour_2_available: day.hours[2].available,
            hour_3_available: day.hours[3].available,
            hour_4_available: day.hours[4].available
          });
        }
      });
    });

    const resource = {
      id: coach.id,
      availabilities: availabilities
    };

    return new Promise((resolve, reject) => {
      api.create("resource/coaches", resource).then(
        data => {
          resolve(data);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  static getCalendarArray(coach, month, year) {
    return new Promise((resolve, reject) => {
      api
        .list("resource/availabilities", {
          filter: {}
        })
        .then(
          data => {
            const avails = data.resources.resources;

            let calendar = this.createCalendarGrid(month, year, avails);
            resolve(calendar);
          },
          err => {
            reject(err);
          }
        );
    });
  }

  static createCalendarGrid(month, year, avails) {
    let firstDay = new Date(year, month).getDay();
    let daysInMonth = this.getDaysInMonth(month, year);

    let date = 1;
    let weekIndex = 0;

    let weeks = [];
    let legend = [];

    days.forEach(day => {
      legend.push({
        value: day,
        legend: true
      });
    });

    weeks.push(legend);

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    while (date <= daysInMonth) {
      let week = [];

      for (let j = 0; j < 7; j++) {
        let dayObj = {
          hasSessions: false,
          value: -1,
          selectable: true,
          disabled: false,
          timestamp: -1
        };

        if ((weekIndex === 0 && j < firstDay) || date > daysInMonth) {
          dayObj.disabled = true;
          dayObj.selectable = false;
        } else {
          dayObj.value = date;
          dayObj.timestamp = new Date(year, month, date).getTime();

          let actualDate = new Date(year, month, date);

          if (j == 0) {
            dayObj.disabled = true;
            dayObj.selectable = false;
          }

          if (actualDate.getTime() < today.getTime()) {
            // Disable all days before this BUT
            // keep em selectable
            dayObj.disabled = true;
            dayObj.selectable = true;
          }

          dayObj.hours = {
            1: {
              available: false,
              session: null
            },
            2: {
              available: false,
              session: null
            },
            3: {
              available: false,
              session: null
            },
            4: {
              available: false,
              session: null
            }
          };

          // DB Dates lookup
          avails.find(_date => {
            let savedDate = new Date(_date.date);
            savedDate.setHours(0, 0, 0, 0);

            if (savedDate.getTime() == dayObj.timestamp) {
              // Update day with DB info
              dayObj.hasAvailable = !!_date.has_available;
              dayObj.id = _date.id;

              [1, 2, 3, 4].forEach(hour => {
                dayObj.hours[hour].available = !!_date[
                  "hour_" + hour + "_available"
                ];

                if (_date["hour_" + hour + "_session"]) {
                  dayObj.hasSessions = true;
                  dayObj.hours[hour].session =
                    _date["hour_" + hour + "_session"];
                }
              });
            }
          });

          date++;
        }

        week.push(dayObj);
      }

      weeks.push(week);
      weekIndex++;
    }

    return weeks;
  }

  static getDaysInMonth(month, year) {
    return 32 - new Date(year, month, 32).getDate();
  }
}
