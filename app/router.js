import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('create', { path: '/' });
  this.route('import', { path: '/import' });
  this.route('company-attribute', { path: '/companyAttribute' });
});

export default Router;
