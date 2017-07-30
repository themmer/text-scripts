import Ember from 'ember';

export default Ember.Component.extend({
  classNames: 'padding-top',

  createdTextList: null,

  reversedCreatedTextList: Ember.computed('createdTextList.[]', {
    get() {
      const createdTextList = this.get('createdTextList.[]');
      // Return new array and reverse
      return [...createdTextList].reverse();
    }
  }),

  actions: {
    removeClicked(dataObject) {
      this.get('createdTextList').removeObject(dataObject);
    }
  }

});
