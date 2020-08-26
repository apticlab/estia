import _ from "lodash";
import moment from "moment";
moment.locale("it");

const helpers = {
  getNestedField: getNestedField,
  getInfoFromOptions: getInfoFromOptions,
  clone: clone,
  sleep: sleep,
  deepFind,
  getColor,
  createRandomArray,
  evaluateCondition,
  deepPick,
  moment,
  getDayWeekNumber,
  getVisibleActionsByRole,
  actionIsVisible,
  actOnRow
};

export { helpers };

function getDayWeekNumber(_date) {
  return this.moment(_date).day();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getNestedField(resource, field) {
  if (!field) {
    return "";
  }

  var fields = field.split(".");

  for (var i = 0; i < fields.length; i++) {
    if (resource != null) {
      resource = resource[fields[i]];
    }
  }

  return resource;
}

function getInfoFromOptions(resource, header, infoType) {
  let tagId = getNestedField(resource, header.value);
  let tagField = "name";
  let currentTag = {};

  if (
    header.option &&
    header.option.options &&
    !header.option.options.resource
  ) {
    tagField =
      (header.option.text ? header.option.text : header.field_name) || "name";
    let optionList = header.option.options.list || [];

    currentTag = optionList.find(e => e.id == tagId);
  } else {
    currentTag = tagId;
  }

  switch (infoType) {
    case "color":
      return currentTag ? currentTag.color : "#888";

    case "text":
      return currentTag ? currentTag[tagField] : "";
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function deepFind(obj, path) {
  var paths = path.split("."),
    current = obj,
    i;

  if (!current) {
    return "";
  }

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }

  return current;
}

function getColor(colorString) {
  if (!Array.isArray(colorString)) {
    colorString = colorString ? colorString : "gray-400";
    let elem = document.querySelector(".color-swatch.bg-" + colorString);
    return elem != null ? getComputedStyle(elem).backgroundColor : "";
  }

  return colorString.map(color => {
    color = color ? color : "gray-400";
    let elem = document.querySelector(".color-swatch.bg-" + color);
    return elem != null ? getComputedStyle(elem).backgroundColor : "";
  });
}

function createRandomArray(min, max, number) {
  let array = [];

  for (var i = 0; i < number; i++) {
    array.push(Math.round(Math.random() * max) + min);
  }

  return array;
}

function deepPick(object, nestedField) {
  if (nestedField == ".") {
    return object;
  }

  return _.get(object, nestedField);
}

function evaluateCondition(condition, object, reference = null) {
  const conditionValueDefaults = {
    NULL: null,
    UNDEFINED: undefined,
    FALSE: false,
    TRUE: true
  };

  // condition: [<field>, <operator>, <value>]
  let conditionIsMet = false;
  let conditionFieldValue = this.deepPick(object, condition[0]);
  let conditionOperator = condition[1];
  let conditionValue = condition[2];

  if (conditionValue in conditionValueDefaults) {
    conditionValue = conditionValueDefaults[conditionValue];
  }

  if (condition[2]) {
    if (condition[2][0] == "$") {
      // Pick the value from the object not from the actual string value
      let conditionValueField = condition[2].substring(1);
      conditionValue = this.deepPick(reference, conditionValueField);
    }
  }

  switch (conditionOperator) {
    case "=":
      conditionIsMet = conditionFieldValue == conditionValue;
      break;
    case "!=":
      // !!conditionFieldValue is for ensuring conditionFieldValue is not null or undefined
      conditionIsMet =
        !!conditionFieldValue && conditionFieldValue != conditionValue;
      break;
    case "IN":
      var conditionValueTokens = [];

      // Use both string separated arrays and normal js arrays
      if (Array.isArray(conditionValue)) {
        conditionValueTokens = conditionValue;
      } else {
        if (typeof conditionValue && conditionValue.indexOf(",") != -1) {
          conditionValueTokens = conditionValue.split(",");
        }
      }

      conditionIsMet =
        !!conditionFieldValue &&
        conditionValueTokens.indexOf("" + conditionFieldValue) > -1;
      break;
    case "NOT IN":
      var conditionValueTokens = [];

      // Use both string separated arrays and normal js arrays
      if (Array.isArray(conditionValue)) {
        conditionValueTokens = conditionValue;
      } else {
        if (typeof conditionValue && conditionValue.indexOf(",") != -1) {
          conditionValueTokens = conditionValue.split(",");
        }
      }

      conditionIsMet =
        !!conditionFieldValue &&
        !conditionValueTokens.includes("" + conditionFieldValue);
      break;
    case "NULL":
      conditionIsMet =
        conditionFieldValue == null || conditionFieldValue == undefined;
      break;
  }

  return conditionIsMet;
}

function getVisibleActionsByRole(actions, user) {
  return actions.filter(action => {
    return !action.roles || action.roles.includes(user.role.code);
  });
}

function actOnRow(event) {
  let action = event.action;
  let index = event.index;

  if (this[action.callback]) {
    let row = this.rows[index];
    this[action.callback](row);
  }
}

function actionIsVisible(action) {
  if (action.visible == undefined) {
    return true;
  }

  let isVisible = true;

  action.visible.forEach(condition => {
    isVisible = isVisible && this.evaluateCondition(condition, this.mission);
  });

  return isVisible;
}
