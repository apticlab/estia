import CodiceFiscale from "codice-fiscale-js";
import { checkVAT, italy } from "jsvat";
export default {
  email(value, context) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
  },
  fiscal_code(value, context) {
    if (!value) {
      return false;
    }

    console.log(value);

    try {
      let codiceFiscale = new CodiceFiscale(value);
      console.log("codice fiscale: ", codiceFiscale);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  vat_number(value, context) {
    if (!value) {
      return false;
    }

    return checkVAT(value, [italy]);
  },
  min(value, min) {
    return value > min
  },
  max(value, max) {
    return value < max
  }
};
