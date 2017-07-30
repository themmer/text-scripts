import Ember from 'ember';

export default Ember.Controller.extend({

  sqlIndex: 0,

  bundleType: 'ui',

  createdTextList: Ember.A(),

  /**
   * This is not efficient, but shows the idea of computed properties (but not so much caching)
   * The problem is each change requires a complete loop through everything
   * This does make removal easier since there can be multiple for one add
   */
  csvList: Ember.computed('createdTextList.[]', {
    get() {
      const csvList = Ember.A();
      const createdTextList = this.get('createdTextList');
      createdTextList.forEach(textObject => {
        const key = `${textObject.base}${textObject.key}`;
        const csv = `"${key.replace(/"/g, '\\"')}","${textObject.text.replace(/"/g, '\\"')}",""`;
        csvList.pushObject(csv);
        if (textObject.hasRequired) {
          const keyName = `${textObject.base}${textObject.requiredPrefix}${textObject.key}${textObject.requiredSuffix}`;
          const csvRequired = `"${keyName.replace(/"/g, '\\"')}","${textObject.requiredErrorText.replace(/"/g, '\\"')}",""`;
          csvList.pushObject(csvRequired);
        }
        if (textObject.hasPlaceholder) {
          const placeholderKeyname = `${textObject.base}${textObject.key}${textObject.placeholderSuffix}`;
          const csvPlaceholder = `"${placeholderKeyname.replace(/"/g, '\\"')}","${textObject.placeholderText.replace(/"/g, '\\"')}",""`;
          csvList.pushObject(csvPlaceholder);
        }
      });
      return csvList;
    }
  }),

  /**
   * This is not efficient, but shows the idea of computed properties (but not so much caching)
   * The problem is each change requires a complete loop through everything
   * This does make removal easier since there can be multiple for one add
   */
  sqlList: Ember.computed('createdTextList.[]', 'bundleType', {
    get() {
      const sqlList = Ember.A();
      const createdTextList = this.get('createdTextList');
      const bundleType = this.get('bundleType');
      let queryCount = this.get('sqlIndex') || 0;
      createdTextList.forEach(textObject => {

        const key = `${textObject.base}${textObject.key}`;
        const insertSql = `INSERT INTO text_resource (id, created_ts, deleted, updated_ts, modified_by, modified_by_type, version, digest_value, name, local_value, bundle_id, company_id, locale_id)
  VALUES ((SELECT id+${queryCount} FROM id_seq WHERE tbl = 'text_resource'), CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, '${textObject.ticketNumber}', 'MIGRATE', 0, 'none', '${key}', '${textObject.text.replace(/'/g, "''")}', (SELECT id FROM resource_bundle WHERE name = '${bundleType}'), (SELECT id FROM company WHERE structure = 'ROOT'), (SELECT id FROM locale WHERE language_code = 'en' AND country_code is null));`;
        sqlList.pushObject(insertSql);
        queryCount++;
        if (textObject.hasRequired) {
          const requiredKeyName = `${textObject.base}${textObject.requiredPrefix}${textObject.key}${textObject.requiredSuffix}`;
          const csvRequired = `INSERT INTO text_resource (id, created_ts, deleted, updated_ts, modified_by, modified_by_type, version, digest_value, name, local_value, bundle_id, company_id, locale_id)
  VALUES ((SELECT id+${queryCount} FROM id_seq WHERE tbl = 'text_resource'), CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, '${textObject.ticketNumber}', 'MIGRATE', 0, 'none', '${requiredKeyName}', '${textObject.requiredErrorText.replace(/'/g, "''")}', (SELECT id FROM resource_bundle WHERE name = '${bundleType}'), (SELECT id FROM company WHERE structure = 'ROOT'), (SELECT id FROM locale WHERE language_code = 'en' AND country_code is null));`;

          sqlList.pushObject(csvRequired);
          queryCount++;
        }
        if (textObject.hasPlaceholder) {
          const placeholderKeyname = `${textObject.base}${textObject.key}${textObject.placeholderSuffix}`;
          const csvPlaceholder = `INSERT INTO text_resource (id, created_ts, deleted, updated_ts, modified_by, modified_by_type, version, digest_value, name, local_value, bundle_id, company_id, locale_id)
  VALUES ((SELECT id+${queryCount} FROM id_seq WHERE tbl = 'text_resource'), CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, '${textObject.ticketNumber}', 'MIGRATE', 0, 'none', '${placeholderKeyname}', '${textObject.placeholderText.replace(/'/g, "''")}', (SELECT id FROM resource_bundle WHERE name = '${bundleType}'), (SELECT id FROM company WHERE structure = 'ROOT'), (SELECT id FROM locale WHERE language_code = 'en' AND country_code is null));`;

          sqlList.pushObject(csvPlaceholder);
          queryCount++;
        }
      });

      // need final sql statement to add
      if (queryCount && createdTextList.length) {
        const finalQuery = `UPDATE id_seq set id = id+${queryCount} WHERE tbl='text_resource';`;
        sqlList.pushObject(finalQuery);
      }
      return sqlList;
    }
  })
});
