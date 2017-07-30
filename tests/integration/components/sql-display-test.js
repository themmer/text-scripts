import { moduleForComponent, test } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sql-display', 'Integration | Component | sql display', {
  integration: true
});

test('it renders', function (assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{sql-display}}`);
  assert.equal(this.$().text().trim(), '');

  // Template block usage:" + EOL +
  this.render(hbs`
    {{#sql-display}}
      template block text
    {{/sql-display}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
