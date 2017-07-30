import Ember from 'ember';

const DEFAULT_UNIQUE_TYPE = 'NONE';
const DEFAULT_BIG_DECIMAL = 'BIG_DECIMAL';

export default Ember.Controller.extend({
  ticketNumber: null,

  id: null,

  hasParent: false,

  parent: null,

  parentValueForVisibility: null,

  title: null,

  description: null,

  valueType: DEFAULT_BIG_DECIMAL,
  valueTypes: Ember.A(['BIG_DECIMAL', 'BIG_INTEGER', 'BOOLEAN', 'BYTE', 'DATE', 'DATE_ONLY', 'DATE_TIME', 'DECIMAL', 'DOUBLE', 'DURATION', 'EXPRESSION', 'FLOAT', 'IMAGE_NAME', 'INTEGER', 'LONG', 'OBSCURED', 'PERCENT', 'RESOURCE', 'SHORT', 'STRING', 'TIME_ONLY', 'URL']),
  availableValuesList: Ember.A(),
  isAvailableValuesEnabled: Ember.computed('valueType', {
    get() {
      const valueType = this.get('valueType');
      return valueType === 'STRING';
    }
  }),

  defaultValue: null,

  displayOrder: null,

  isDisplayable: false,

  isSystemOwnerOnly: false,

  groupName: null,
  groupNames: Ember.A([null, 'Accounts', 'Login', 'Admin Login', 'Dashboard', 'Messages', 'Security', 'Settings', 'System']),

  sectionName: null,
  sectionNames: Ember.A([null, 'Accounts', 'Alerts', 'Authentication', 'Login', 'Biometric Authentication', 'Categories', 'Data Retention', 'Alerts', 'Encryption', 'Forgot Password', 'General', 'Generic Alerts', 'Goals', 'Hide Accounts', 'Inactive Users', 'Internal User Alerts', 'Authentication', 'Locations Search', 'Adapters', 'Messages', 'Mobile', 'Password', 'Password Reset', 'Profile', 'RSA', 'Rules', 'Security', 'Self Enrollment', 'Self Service', 'Settings', 'Support Information', 'Synchronization', 'System Alerts', 'User Account Change', 'User Attributes', 'User Enrollment', 'User Name', 'User Session']),

  uniqueType: DEFAULT_UNIQUE_TYPE,
  uniqueTypes: Ember.A([DEFAULT_UNIQUE_TYPE, 'GLOBAL']),

  validationPattern: null,

  validationPatterns: Ember.A([null, '[ -~]{0,10}', '[ -~]{0,16}', '[ -~]{0,20}', '[ -~]{0,23}', '[ -~]{0,80}', '[ ]*([1-9]+[0-9]*[dhms][ ])*([1-9]+[0-9]*[dhms])[ ]*', '[0-9]{9}', '[0-9]*(|\.[0-9]{0,2})', '[0-9A-Za-z]{10}', '^([0-9]|0[0-9]|1[0-2]):[0-5][0-9] [aApP][mM]$|^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$']),

  validationMin: null,

  validationMax: null,

  jsonDefinition: Ember.computed('id', 'hasParent', 'parent', 'parentValueForVisibility', 'title', 'description', 'valueType',
    'availableValuesList.[]', 'defaultValue', 'displayOrder', 'isDisplayable', 'isSystemOwnerOnly',
    'groupName', 'sectionName', 'uniqueType', 'validationPattern', 'validationMin', 'validationMax', {
      get() {
        const id = this.get('id');
        const parent = this.get('parent');
        const parentValueForVisibility = this.get('parentValueForVisibility');
        const title = this.get('title');
        const description = this.get('description');
        const valueType = this.get('valueType');
        const availableValuesList = this.get('availableValuesList');
        const defaultValue = this.get('defaultValue');
        const displayOrder = this.get('displayOrder') ? Number(this.get('displayOrder')) : null;
        const isDisplayable = this.get('isDisplayable');
        const isSystemOwnerOnly = this.get('isSystemOwnerOnly');
        const groupName = this.get('groupName');
        const sectionName = this.get('sectionName');
        const uniqueType = this.get('uniqueType');
        const validationPattern = this.get('validationPattern');
        const validationMin = this.get('validationMin');
        const validationMax = this.get('validationMax');

        return {
          id,
          groupName,
          sectionName,
          title,
          description,
          valueType,
          displayOrder,
          isDisplayable,
          isSystemOwnerOnly,
          parentValueForVisibility,
          availableValues: availableValuesList,
          validationPattern,
          validationMin,
          validationMax,
          uniqueType,
          parent,
          defaultValue
        };
      }
    }),

  jsonDefinitionString: Ember.computed('jsonDefinition', {
    get() {
      const jsonDefinition = this.get('jsonDefinition');
      return JSON.stringify(jsonDefinition,
        (key, value) => {
          if ((Array.isArray(value) && !value.length) || value === null) {
            return null;
          } else if (key === 'availableValues') {
            const availableValuesObject = {};
            jsonDefinition.availableValues.forEach(availableValue => {
              availableValuesObject[availableValue.key] = availableValue.value;
            });
            return availableValuesObject;
          } else if (key === 'parent') {
            return { id: value };

          } else if (typeof value === 'string') {
            return value.replace(/"/g, '\\"');
          }
          return value;
        },
        2
      );
    }
  }),

  sqlDisplayString: Ember.computed('jsonDefinition', 'ticketNumber', {
    get() {
      const ticketNumber = this.get('ticketNumber');
      const originalJsonDefinition = this.get('jsonDefinition');

      const jsonString = JSON.stringify(originalJsonDefinition,
        (key, value) => {
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "\'\'")}'`;
          }
          return value;
        },
        2
      );
      const jsonDefinition = JSON.parse(jsonString);
      let sqlDisplayString;

      sqlDisplayString = `INSERT INTO comp_attribute_definition (created_ts,deleted,modified_by,modified_by_type,updated_ts,version,parent_name,name,group_name,section_name,title,description,display_order,is_displayable,system_owner_only,validation_pattern,validation_min,validation_max,value_type,definition_type,unique_type,parent_value_for_visibility)
  VALUES (CURRENT_TIMESTAMP,0,'${ticketNumber}','MIGRATE',CURRENT_TIMESTAMP,0,${jsonDefinition.parent},${jsonDefinition.id},${jsonDefinition.groupName},${jsonDefinition.sectionName},${jsonDefinition.title},${jsonDefinition.description},${jsonDefinition.displayOrder},${jsonDefinition.isDisplayable ? '1' : '0'},${jsonDefinition.isSystemOwnerOnly ? '1' : '0'},${jsonDefinition.validationPattern},${jsonDefinition.validationMin},${jsonDefinition.validationMax},${jsonDefinition.valueType},${jsonDefinition.uniqueType},${jsonDefinition.parentValueForVisibility});`;

      // loop through available values
      if (jsonDefinition.availableValues) {
        jsonDefinition.availableValues.forEach(availableValue => {
          sqlDisplayString = `${sqlDisplayString}\nINSERT INTO comp_attribute_values (definition_id,name,description)
  VALUES (${jsonDefinition.id},${availableValue.key},${availableValue.value});`;
        });
      }

      sqlDisplayString = `${sqlDisplayString}\nINSERT INTO comp_attribute (created_ts,deleted,modified_by,modified_by_type,updated_ts,version,id,value_string,company_id,definition)
  VALUES (CURRENT_TIMESTAMP,0,'${ticketNumber}','MIGRATE',CURRENT_TIMESTAMP,0,(SELECT id FROM id_seq WHERE tbl='comp_attribute'),${jsonDefinition.defaultValue},(SELECT id FROM company WHERE structure = 'ROOT'),${jsonDefinition.id});`;
      sqlDisplayString = `${sqlDisplayString}\nUPDATE id_seq SET id=id+1 WHERE tbl='comp_attribute';\n`;

      return sqlDisplayString;
    }
  }),

  actions: {
    selectHasParent(hasParent) {
      const props = {
        hasParent
      };
      if (!hasParent) {
        props.parent = null;
        props.parentValueForVisibility = null;
      }
      this.setProperties(props);
    },
    selectValueType(valueType) {
      this.set('valueType', valueType);
    },
    selectGroupName(groupName) {
      this.set('groupName', groupName);
    },
    selectSectionName(sectionName) {
      this.set('sectionName', sectionName);
    },
    selectValidationPattern(validationPattern) {
      this.set('validationPattern', validationPattern);
    },
    selectUniqueType(uniqueType) {
      this.set('uniqueType', uniqueType);
    }
  }

});
