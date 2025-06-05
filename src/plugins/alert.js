// we need our modal component
import AwAlert from "../components/Alert.vue";
import { EventBus } from "../utils/event-bus.js";

const Alert = {
  // every plugin for Vue.js needs install method
  // this method will run after Vue.use(<your-plugin-here>) is executed
  install(app, options) {
    // We must create new Eventbus
    // which is just another Vue instance that will be listening for and emiting events from our main instance
    // this EventBus will be available as Modal.EventBus
    // making our modal component global
    app.component("aw-alert", AwAlert);

    // exposing global $modal object with method show()
    // method show() takes object params as argument
    // inside this object we can have modal title, text, styles... and also our callback confirm function
    app.config.globalProperties.$alert = {
      show(params) {
        // if we use this.$modal.show(params) inside our original Vue instance
        // we will emit 'show' event with parameters 'params'
        EventBus.emit("show", params);
      },
      success(params) {
        params.type='success';
        EventBus.emit("show", params);
      },
      warn(params) {
        params.type='warn';
        EventBus.emit("show", params);
      },
      error(params) {
        params.type='error';
        EventBus.emit("show", params);
      },
      info(params) {
        params.type='info';
        EventBus.emit("show", params);
      }
    };
  }
};

export default Alert;
