// we need our modal component
import DialogModal from "../components/DialogModal.vue";
import mitt from 'mitt';

const Dialog = {
  // every plugin for Vue.js needs install method
  // this method will run after app.use(<your-plugin-here>) is executed
  install(app, options) {
    // We must create new Eventbus
    // using mitt instead of Vue instance
    this.EventBus = mitt();

    // making our modal component global
    app.component("modal-dialog", DialogModal);

    // exposing global $modal object with method show()
    // method show() takes object params as argument
    // inside this object we can have modal title, text, styles... and also our callback confirm function
    app.config.globalProperties.$dialog = {
      show(params) {
        // if we use this.$modal.show(params) inside our original Vue instance
        // we will emit 'show' event with parameters 'params'
        Dialog.EventBus.emit("show", params);
      },
      hide(params) {
        Dialog.EventBus.emit("hide", params);
      }
    };
  }
};

export default Dialog;
