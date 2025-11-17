// we need our modal component
import AwAlert from "../components/Alert.vue";
import mitt from 'mitt';

const Alert = {
  // every plugin for Vue.js needs install method
  // this method will run after app.use(<your-plugin-here>) is executed
  install(app, options) {
    // We must create new Eventbus
    // using mitt instead of Vue instance
    this.EventBus = mitt();

    // making our modal component global
    app.component("aw-alert", AwAlert);

    // exposing global $modal object with method show()
    // method show() takes object params as argument
    // inside this object we can have modal title, text, styles... and also our callback confirm function
    app.config.globalProperties.$alert = {
      show(params) {
        // if we use this.$modal.show(params) inside our original Vue instance
        // we will emit 'show' event with parameters 'params'
        Alert.EventBus.emit("show", params);
      },
      success(params) {
        params.type='success';
        Alert.EventBus.emit("show", params);
      },
      warn(params) {
        params.type='warn';
        Alert.EventBus.emit("show", params);
      },
      error(params) {
        params.type='error';
        Alert.EventBus.emit("show", params);
      },
      info(params) {
        params.type='info';
        Alert.EventBus.emit("show", params);
      }
    };
  }
};

export default Alert;
