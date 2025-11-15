import moment from "moment";
import i18n from "../i18n";
import { helpers } from "../utils/helpers";

export function leftpad(value, number = 4) {
  return value != null ? value.toString().padStart(number, "0") : "";
}

export function count(value) {
  if (value != undefined && value != null) {
    return value.length;
  }
  return 0;
}

export function uppercase(value) {
  if (value != undefined && value != null) {
    return value.toUpperCase();
  }
  return value;
}

export function capitalize(value) {
  if (value != undefined && value != null && value !== "") {
    return value[0].toUpperCase() + value.substring(1, value.length);
  }
  return value;
}

export function date(value, format) {
  if (!value) return "";

  const momentValue = moment(value);
  if (!momentValue.isValid()) return "";

  return format ? momentValue.format(format) : momentValue;
}

export function number(value) {
  if (value < "999") {
    return value;
  }
  if (value < "999999") {
    const thousand = value / 1000;
    return thousand.toFixed(1).replace(".", ",") + " K";
  }
  if (value < 999999999) {
    const million = value / 1000000;
    return million.toFixed(1).replace(".", ",") + " M";
  }
  return value;
}

export function round(value, digits = 2) {
  if (value % 1 === 0) {
    return value;
  }

  return parseFloat(value)
    .toFixed(digits)
    .replace(".", ",");
}

export function percentage(value, digits = 1) {
  const percValue = value * 100;

  return (
    parseFloat(percValue)
      .toFixed(digits)
      .replace(".", ",") + "%"
  );
}

export function time_ago(value) {
  if (!value) return "";
  return moment(value).locale("it").fromNow();
}

export function on_empty(value, message) {
  if (!value) return message;
  return value;
}

export function translate(key) {
  const locale = i18n.locale;
  const messages = i18n.messages[locale];
  return helpers.deepPick(messages, key) || key;
}

export function week_date(week, year = moment().year()) {
  if (!week) return "";
  const weekAsMoment = moment().day("Sunday").year(year).week(week);
  return {
    start: weekAsMoment.startOf("week").format("L"),
    end: weekAsMoment.endOf("week").format("L"),
  };
}

export function prettify(value, lang) {
  switch (lang) {
    case "json":
      return JSON.stringify(value, null, "\t");
    default:
      return value;
  }
}

export function json(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function truncate(text, length, clamp = "...") {
  if (!length || !text) {
    return text;
  }

  const node = document.createElement("div");
  node.innerHTML = text;
  const content = node.textContent || "";
  return content.length > length ? content.slice(0, length) + clamp : content;
}

const filters = {
  leftpad,
  count,
  uppercase,
  capitalize,
  date,
  number,
  round,
  percentage,
  time_ago,
  on_empty,
  translate,
  week_date,
  prettify,
  json,
  truncate,
};

export default filters;
