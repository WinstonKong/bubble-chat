import { useReducer } from 'react';

type EditInfoType = {
  editable: boolean;
  editing?: boolean;
  updating?: boolean;
  finished?: boolean;
  ok?: boolean;
};

type EditInfoDispatchType = {
  type: 'setEditing' | 'setUpdating' | 'setResult' | 'reset';
} & Partial<EditInfoType>;

function editInfoReducer(
  editInfo: EditInfoType,
  action: EditInfoDispatchType,
): EditInfoType {
  if (!editInfo.editable) {
    return editInfo;
  }
  switch (action.type) {
    case 'setEditing':
      return {
        editable: true,
        editing: true,
      };
    case 'setUpdating':
      return {
        editable: true,
        editing: true,
        updating: true,
      };
    case 'setResult':
      return {
        editable: true,
        editing: true,
        finished: true,
        ok: action.ok,
      };
    case 'reset':
      return {
        editable: editInfo.editable,
      };
    default:
      throw Error(`Unkonw editReducer action: ${action}`);
  }
}

export function useEditInfo(editable: boolean) {
  return useReducer(editInfoReducer, {
    editable: editable,
  });
}
