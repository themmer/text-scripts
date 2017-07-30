import Ember from 'ember';

export default Ember.Controller.extend({

  insertQueryCount: 0,

  isClientOverrideAllowed: false,

  ticketNumber: null,

  bundleType: 'ui',

  // oldText: '',
  // newText: '',

  oldText: `# This is my comment that shouldn't matter
   "btn.cancel","Cancel",""
  "same","Same",""
  "update","update"
  "doublequote","double\\"",""`,

  newText: `"settings.alerts.btn.save","Save",""
   # Here is another comment
  "btn.save2","Save2",""
  "same","Same",""
  "update","updated!",""
  "apostrophe check","apost'rophe",""
  "doublequote","double\\"update",""
  "boringkey","double\\"insert",""`,

  oldTextMapComputed: Ember.computed('oldText', {
    get() {
      const oldTextMap = Ember.Map.create();
      oldTextMap.clear();
      const oldText = this.get('oldText');

      oldText.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.indexOf(',') > -1 && trimmedLine.indexOf('#') !== 0) {
          const valuesArray = trimmedLine.split('","');
          let key;
          let value;
          if (valuesArray.length > 1 && valuesArray[0].length > 1) {
            key = valuesArray[0].substring(valuesArray[0].indexOf('"') + 1).trim();
            value = valuesArray[1].replace(/\\"/g, '"').trim();
          }

          if (key) {
            oldTextMap.set(key, value);
          }
        }
      });
      return oldTextMap;
    }
  }),

  newTextMapComputed: Ember.computed('newText', {
    get() {
      const newTextMap = Ember.Map.create();
      const newText = this.get('newText');

      newText.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.indexOf(',') > -1 && trimmedLine.indexOf('#') !== 0) {
          const valuesArray = trimmedLine.split('","');
          let key;
          let value;
          if (valuesArray.length > 1 && valuesArray[0].length > 1) {
            key = valuesArray[0].substring(valuesArray[0].indexOf('"') + 1).trim();
            value = valuesArray[1].replace(/\\"/g, '"').trim();
          }

          if (key) {
            newTextMap.set(key, value);
          }
        }
      });

      return newTextMap;
    }
  }),

  addList: Ember.A(),
  updateList: Ember.A(),
  deleteList: Ember.A(),
  sameList: Ember.A(),

  allList: Ember.computed('sqlList', {
    get() {
      const addList = this.get('addList');
      const updateList = this.get('updateList');
      const deleteList = this.get('deleteList');
      const sameList = this.get('sameList');

      return addList.concat(updateList, deleteList, sameList);
    }
  }),

  sqlList: Ember.computed('oldTextMapComputed.[]', 'newTextMapComputed.[]', 'insertQueryCount', 'isClientOverrideAllowed', 'ticketNumber', 'bundleType', {
    get() {
      const addList = this.get('addList');
      const updateList = this.get('updateList');
      const deleteList = this.get('deleteList');
      const sameList = this.get('sameList');
      const bundleType = this.get('bundleType');

      addList.clear();
      updateList.clear();
      deleteList.clear();
      sameList.clear();

      const newTextMapComputed = this.get('newTextMapComputed');
      const oldTextMapComputed = this.get('oldTextMapComputed');
      const isClientOverrideAllowed = this.get('isClientOverrideAllowed');
      const ticketNumber = this.get('ticketNumber');
      const deleteSqlList = Ember.A();
      const insertSqlList = Ember.A();
      const updateSqlList = Ember.A();

      if (newTextMapComputed.size > 0 || oldTextMapComputed.size > 0) {
        let insertQueryCount = this.get('insertQueryCount');

        newTextMapComputed.forEach((value, key) => {
          const oldValue = oldTextMapComputed.get(key);

          if (oldValue === undefined) {
            addList.pushObject(`ADD,${key},${value}`);
            const sql = `INSERT INTO text_resource (id, created_ts, deleted, updated_ts, modified_by, modified_by_type, version, digest_value, name, local_value, bundle_id, company_id, locale_id)
      VALUES ((select id+${insertQueryCount} FROM id_seq where tbl = 'text_resource'), CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, '${ticketNumber}', 'MIGRATE', 0, 'none', '${key}', '${value.replace(/'/g, "''")}', (SELECT id FROM resource_bundle WHERE name = '${bundleType}'), (SELECT id FROM company WHERE structure = 'ROOT'), (SELECT id FROM locale WHERE language_code = 'en' AND country_code is null));\n`;
            insertSqlList.pushObject(sql);
            insertQueryCount++;
          } else if (oldValue === value) {
            // do nothing
            sameList.pushObject(`SAME,${key},${oldValue}`);
          } else {
            let overrideClientSQL = '';
            if (!isClientOverrideAllowed) {
              overrideClientSQL = `AND local_value=\'${oldValue}\' `;
            }
            updateList.pushObject(`UPDATE,${key},${value}`);
            const sql = `UPDATE text_resource
      SET local_value = '${value.replace(/'/g, "''")}', modified_by = '${ticketNumber}', version = version + 1, updated_ts = CURRENT_TIMESTAMP, modified_by_type = 'MIGRATE'
      WHERE name = '${key}' ${overrideClientSQL}AND locale_id = (SELECT id FROM locale where language_code = 'en') AND bundle_id =  (SELECT id FROM resource_bundle WHERE name = '${bundleType}');\n`;
            updateSqlList.pushObject(sql);
          }
        });

        // need final sql statement to add
        if (insertQueryCount) {
          const finalQuery = `UPDATE id_seq set id = id+${insertQueryCount} WHERE tbl='text_resource';\n`;
          insertSqlList.pushObject(finalQuery);
        }

        oldTextMapComputed.forEach((value, key) => {
          if (!newTextMapComputed.has(key)) {
            deleteList.pushObject(`REMOVE,${key},${value}`);
            const sql = `DELETE FROM text_resource WHERE name = '${key}' AND bundle_id = (SELECT id FROM resource_bundle WHERE name = '${bundleType}');`;
            deleteSqlList.pushObject(sql);
          }
        });
      }
      return insertSqlList.concat(updateSqlList, deleteSqlList);
    }
  })
});
