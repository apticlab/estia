import moment from "moment";
import i18n from "../i18n";
import { helpers } from "../utils/helpers";

export default {
  leftpad: function(value, number = 4) {
    return value.toString().padStart(number, "0");
  },
  count: function(value) {
    if (value != undefined && value != null) {
      return value.length;
    }
    return 0;
  },
  uppercase: function(value) {
    if (value != undefined && value != null) {
      return value.toUpperCase();
    }
  },
  capitalize: function(value) {
    if (value != undefined && value != null && value != "") {
      return value[0].toUpperCase() + value.substring(1, value.length);
    }
  },
  date: function(value, format) {
    if (!value) return "";

    var date = moment(value);

    if (!date.isValid()) return "";
    return format ? date.format(format) : date;
  },
  number: function(value) {
    let number;
    if (value < "999") {
      return value;
    }
    if (value < "999999") {
      number = value / 1000;
      return number.toFixed(1).replace(".", ",") + " K";
    }
    if (value < 999999999) {
      number = value / 1000000;
      return number.toFixed(1).replace(".", ",") + " M";
    }
  },
  round: function(value, digits = 2) {
    // Round only if it is float
    if (value % 1 === 0) {
      return value;
    }

    // TODO: round locale wise
    return parseFloat(value)
      .toFixed(digits)
      .replace(".", ",");
  },
  percentage: function(value, digits = 1) {
    let percValue = value * 100;

    // TODO: round locale wise
    let parsePercValue = parseFloat(percValue)
      .toFixed(digits)
      .replace(".", ",");

    return parsePercValue + "%";
  },
  time_ago: function(value) {
    if (!value) return "";
    return moment(value)
      .locale("it")
      .fromNow();
  },
  on_empty(value, message) {
    if (!value) return message;
    return value;
  },
  translate(key) {
    const locale = i18n.locale;
    const messages = i18n.messages[locale];
    return helpers.deepPick(messages, key) || key;
  },
  week_date(week, year = moment().year()) {
    if (!week) return "";
    const week_as_string = moment()
      .day("Sunday")
      .year(year)
      .week(week);
    return {
      start: week_as_string.startOf("week").format("L"),
      end: week_as_string.endOf("week").format("L")
    };
  },
  prettify(value, lang) {
    switch (lang) {
      case "json":
        return JSON.stringify(value, null, "\t");
      default:
        return value;
    }
  },
  json(value) {
    /* value = value
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t'); */
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  truncate(text, length, clamp = '...') {
    if(!length) {
      return text;
    }

    var node = document.createElement('div');
    node.innerHTML = text;
    var content = node.textContent;
    return content.length > length ? content.slice(0, length) + clamp : content;
  }
};
