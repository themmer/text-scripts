import Ember from 'ember';

const bundleTypeDefault = 'ui';

export default Ember.Component.extend({
  bundleType: bundleTypeDefault,
  bundleTypes: Ember.A([bundleTypeDefault, 'server', 'mobile', 'watch']),

  actions: {
    selectBundleType(bundleType) {
      this.set('bundleType', bundleType);
    }
  }
});
