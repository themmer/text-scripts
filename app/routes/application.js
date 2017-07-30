import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    error(error, errorList) {
      // TODO get error list from controller
      errorList = ['route error !!!!'];
      errorList.pushObjects(errorList);
    }
  }
});
