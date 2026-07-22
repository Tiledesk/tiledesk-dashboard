import { ColumnType, ConditionOperator } from 'app/models/data-tables.model';

export interface FilterOperatorOption {
  value: ConditionOperator;
  labelKey: string;
}

const STRING_OPERATORS: FilterOperatorOption[] = [
  { value: 'contains', labelKey: 'DataTables.OperatorContains' },
  { value: 'equal', labelKey: 'DataTables.OperatorEqual' },
  { value: 'not_equal', labelKey: 'DataTables.OperatorNotEqual' },
  { value: 'starts_with', labelKey: 'DataTables.OperatorStartsWith' },
  { value: 'ends_with', labelKey: 'DataTables.OperatorEndsWith' },
  { value: 'exists', labelKey: 'DataTables.OperatorExists' },
  { value: 'not_exists', labelKey: 'DataTables.OperatorNotExists' },
];

const NUMBER_OPERATORS: FilterOperatorOption[] = [
  { value: 'equal', labelKey: 'DataTables.OperatorEqual' },
  { value: 'not_equal', labelKey: 'DataTables.OperatorNotEqual' },
  { value: 'greater_than', labelKey: 'DataTables.OperatorGreaterThan' },
  { value: 'greater_or_equal', labelKey: 'DataTables.OperatorGreaterOrEqual' },
  { value: 'less_than', labelKey: 'DataTables.OperatorLessThan' },
  { value: 'less_or_equal', labelKey: 'DataTables.OperatorLessOrEqual' },
  { value: 'exists', labelKey: 'DataTables.OperatorExists' },
  { value: 'not_exists', labelKey: 'DataTables.OperatorNotExists' },
];

const BOOLEAN_OPERATORS: FilterOperatorOption[] = [
  { value: 'equal', labelKey: 'DataTables.OperatorEqual' },
  { value: 'not_equal', labelKey: 'DataTables.OperatorNotEqual' },
  { value: 'exists', labelKey: 'DataTables.OperatorExists' },
  { value: 'not_exists', labelKey: 'DataTables.OperatorNotExists' },
];

const DATETIME_OPERATORS: FilterOperatorOption[] = [
  { value: 'equal', labelKey: 'DataTables.OperatorEqual' },
  { value: 'not_equal', labelKey: 'DataTables.OperatorNotEqual' },
  { value: 'greater_than', labelKey: 'DataTables.OperatorGreaterThan' },
  { value: 'greater_or_equal', labelKey: 'DataTables.OperatorGreaterOrEqual' },
  { value: 'less_than', labelKey: 'DataTables.OperatorLessThan' },
  { value: 'less_or_equal', labelKey: 'DataTables.OperatorLessOrEqual' },
  { value: 'exists', labelKey: 'DataTables.OperatorExists' },
  { value: 'not_exists', labelKey: 'DataTables.OperatorNotExists' },
];

export function operatorsForColumnType(type: ColumnType): FilterOperatorOption[] {
  switch (type) {
    case 'number':
      return NUMBER_OPERATORS;
    case 'boolean':
      return BOOLEAN_OPERATORS;
    case 'datetime':
      return DATETIME_OPERATORS;
    case 'string':
    default:
      return STRING_OPERATORS;
  }
}

export function defaultOperatorForColumnType(type: ColumnType): ConditionOperator {
  return operatorsForColumnType(type)[0].value;
}

export function operatorNeedsValue(operator: ConditionOperator): boolean {
  return operator !== 'exists' && operator !== 'not_exists';
}
