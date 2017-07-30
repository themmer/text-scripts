import Ember from 'ember';

export default Ember.Component.extend({

  availableValuesList: null,
  isAvailableValuesEnabled: true,

  availableKey: null,
  availableValue: null,

  actions: {
    copyAvailable() {
      const availableKey = this.get('availableKey');
      this.set('availableValue', availableKey);
    },
    addAvailableValue() {
      const availableValuesList = this.get('availableValuesList');
      const key = this.get('availableKey');
      const value = this.get('availableValue');
      if (key && value) {
        availableValuesList.pushObject({ key, value });
        this.set('availableKey', null);
        this.set('availableValue', null);
      }
    },
    removeAvailable(availableValue) {
      const availableValuesList = this.get('availableValuesList');
      availableValuesList.removeObject(availableValue);
    }
  }
});
