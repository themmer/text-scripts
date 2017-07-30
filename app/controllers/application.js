import Ember from 'ember';

export default Ember.Controller.extend({
  /**
   * Main error handling
   */
  errorList: Ember.A(),

  actions: {
    clearError() {
      const errorList = this.get('errorList');
      errorList.clear();
    }
  }
});
