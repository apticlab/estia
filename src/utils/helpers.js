import _ from 'lodash'
import moment from 'moment'
moment.locale('it')

const helpers = {
  getNestedField,
  getInfoFromOptions,
  clone,
  sleep,
  deepFind,
  getColor,
  createRandomArray,
  evaluateCondition,
  dateFromConditionValue,
  deepPick,
  moment,
  getDayWeekNumber,
  getVisibleItemsByRole,
  itemIsVisible
}

export { helpers }

function getDayWeekNumber(_date) {
  return this.moment(_date).day()
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getNestedField(resource, field) {
  if (!field) {
    return ''
  }

  var fields = field.split('.')

  for (var i = 0; i < fields.length; i++) {
    if (resource != null) {
      resource = resource[fields[i]]
    }
  }

  return resource
}

function getInfoFromOptions(resource, header, infoType) {
  let tagId = getNestedField(resource, header.value)
  let tagField = 'name'
  let currentTag = {}

  if (
    header.option &&
    header.option.options &&
    !header.option.options.resource
  ) {
    tagField =
      (header.option.text ? header.option.text : header.field_name) || 'name'
    let optionList = header.option.options.list || []

    currentTag = optionList.find(e => e.id == tagId)
  } else {
    currentTag = tagId
  }

  switch (infoType) {
    case 'color':
      return currentTag ? currentTag.color : '#888'

    case 'text':
      return currentTag ? currentTag[tagField] : ''
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function deepFind(obj, path) {
  var paths = path.split('.')
  var current = obj
  var i

  if (!current) {
    return ''
  }

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined
    } else {
      current = current[paths[i]]
    }
  }

  return current
}

function getColor(colorString) {
  if (!Array.isArray(colorString)) {
    colorString = colorString || 'gray-400'
    let elem = document.querySelector('.color-swatch.bg-' + colorString)
    return elem != null ? getComputedStyle(elem).backgroundColor : ''
  }

  return colorString.map(color => {
    color = color || 'gray-400'
    let elem = document.querySelector('.color-swatch.bg-' + color)
    return elem != null ? getComputedStyle(elem).backgroundColor : ''
  })
}

function createRandomArray(min, max, number) {
  let array = []

  for (var i = 0; i < number; i++) {
    array.push(Math.round(Math.random() * max) + min)
  }

  return array
}

function deepPick(object, nestedField) {
  if (nestedField == '.') {
    return object
  }

  return _.get(object, nestedField)
}

/*
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
      conditionIsMet = conditionFieldValue != conditionValue;
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
*/

function evaluateCondition(condition, object, reference = null) {
  const conditionValueDefaults = {
    NULL: null,
    UNDEFINED: undefined,
    FALSE: false,
    TRUE: true
  }

  let conditionIsMet = true;

  // se è un oggetto contente il campo operator and condition verifico il valore del campo `operator` e di `condition`
  if (condition.operator && condition.condition) {
    let conditions = condition.condition;

    conditionIsMet = false;
    for (let i = 0; i < conditions.length; i++) {
      let _condition = conditions[i];

      switch (condition.operator) {
        case 'OR':
          console.log('sto facendo un OR');
          conditionIsMet = conditionIsMet || evaluateCondition(_condition, object, reference);
          console.log('risulta', conditionIsMet);
          break;
        case 'AND':
          console.log('AND');
          conditionIsMet = conditionIsMet && evaluateCondition(_condition, object, reference)
      }
    }

    return conditionIsMet;
  }

  // se il primo campo è un array allora sono altre condizioni da valutare separatamente
  if (_.isArray(condition[0])) {
    let conditions = condition;

    for (let i = 0; i < conditions.length; i++) {
      let condition = conditions[i];
      conditionIsMet = conditionIsMet && evaluateCondition(condition, object, reference)
    }

    return conditionIsMet;

  }



  // condition: [<field>, <operator>, <value>]
  let conditionFieldValue = deepPick(object, condition[0])
  let conditionOperator = condition[1]
  let conditionValue = condition[2]


  if (conditionValue in conditionValueDefaults) {
    conditionValue = conditionValueDefaults[conditionValue]
  }

  if (condition[2]) {
    if (condition[2][0] == '$') {
      // Pick the value from the object not from the actual string value
      let conditionValueField = condition[2].substring(1)
      conditionValue = deepPick(reference, conditionValueField)
    }
  }

  if (_.isFunction(conditionOperator)) {
    conditionIsMet = conditionOperator(conditionFieldValue, conditionValue)
  } else {
    switch (conditionOperator) {
      case '>':
        conditionIsMet = Number(conditionFieldValue) > Number(conditionValue);
        break;
      case '<':
        conditionIsMet = Number(conditionFieldValue) < Number(conditionValue);
        break;
      case '>=':
        conditionIsMet = Number(conditionFieldValue) >= Number(conditionValue);
        break;
      case '<=':
        conditionIsMet = Number(conditionFieldValue) <= Number(conditionValue);
        break;
      case '=':
        conditionIsMet = conditionFieldValue == conditionValue;
        break
      case '!=':
        // !!conditionFieldValue is for ensuring conditionFieldValue is not null or undefined
        conditionIsMet =
          !!conditionFieldValue && conditionFieldValue != conditionValue
        break
      case 'IN':
        var conditionValueTokens = []

        // Use both string separated arrays and normal js arrays
        if (Array.isArray(conditionValue)) {
          conditionValueTokens = conditionValue
        } else {
          if (typeof conditionValue && conditionValue.indexOf(',') != -1) {
            conditionValueTokens = conditionValue.split(',')
          }
        }

        conditionIsMet =
          !!conditionFieldValue &&
          conditionValueTokens.indexOf('' + conditionFieldValue) > -1
        break
      case 'NOT IN':
        var conditionValueTokens = []

        // Use both string separated arrays and normal js arrays
        if (Array.isArray(conditionValue)) {
          conditionValueTokens = conditionValue
        } else {
          if (typeof conditionValue && conditionValue.indexOf(',') != -1) {
            conditionValueTokens = conditionValue.split(',')
          }
        }

        conditionIsMet =
          !!conditionFieldValue &&
          !conditionValueTokens.includes('' + conditionFieldValue)
        break
      case 'NULL':
        conditionIsMet =
          conditionFieldValue == null || conditionFieldValue == undefined
        break
      case 'AFTER':
        conditionValue = dateFromConditionValue(conditionValue)
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isAfter(conditionValue) : true
        break
      case 'BEFORE':
        conditionValue = dateFromConditionValue(conditionValue)
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isBefore(conditionValue) : true
        break
      case 'AFTER_OR_EQUAL':
        conditionValue = dateFromConditionValue(conditionValue)
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isSameOrAfter(
          conditionValue
        ) : true
        break
      case 'BEFORE_OR_EQUAL':
        conditionValue = dateFromConditionValue(conditionValue)
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isSameOrBefore(
          conditionValue
        ) : true
        break
      case 'LIKE':
        return !!String(conditionFieldValue).match(conditionValue)

    }
  }

  // console.log(conditionFieldValue, conditionOperator, conditionValue, conditionIsMet);
  return conditionIsMet
}

function dateFromConditionValue(dateString) {
  let date = null

  switch (dateString) {
    case 'TODAY':
      date = moment().startOf('day')
      break
    case 'YESTERDAY':
      date = moment()
        .add(-1, 'days')
        .startOf('day')
      break
    case 'TOMORROW':
      date = moment()
        .add(1, 'days')
        .startOf('day')
      break
    default:
      if (dateString) {
        date = moment(dateString)
      }
  }

  return date
}

function getVisibleItemsByRole(items, user) {
  return items.filter(item => {
    return !item.roles || item.roles.includes(user.role.code)
  })
}

function itemIsVisible(item, reference, other = null) {
  if (!item.visible || !Array.isArray(item.visible)) {
    return true
  }

  let isVisible = true

  item.visible.forEach(condition => {
    isVisible = isVisible && this.evaluateCondition(condition, reference, other)
  })

  return isVisible
}
