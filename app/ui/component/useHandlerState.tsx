import { useReducer } from 'react';

export type HandlerActionType<T> = {
  type: 'add' | 'update' | 'upsert' | 'remove' | 'reset';
  id?: string;
  value?: T;
  filterFunc?: (id: string, value: T) => boolean;
};

function addState<T>(
  handlers: Record<string, T>,
  action: HandlerActionType<T>,
): Record<string, T> {
  if (!action.id) {
    return handlers;
  }
  if (!action.value) {
    return handlers;
  }
  return {
    ...handlers,
    [action.id]: action.value,
  };
}

function updateState<T>(
  handlers: Record<string, T>,
  action: HandlerActionType<T>,
): Record<string, T> {
  if (!action.id) {
    return handlers;
  }
  const handler = handlers[action.id];
  if (handler) {
    return {
      ...handlers,
      [action.id]: {
        ...handler,
        ...action.value,
      },
    };
  }
  return {
    ...handlers,
  };
}

function upsertState<T>(
  handlers: Record<string, T>,
  action: HandlerActionType<T>,
): Record<string, T> {
  if (!action.id) {
    return handlers;
  }
  const handler = handlers[action.id];
  if (handler) {
    return updateState(handlers, action);
  }
  return addState(handlers, action);
}

function handlerStateReducer<T>(
  handlers: Record<string, T>,
  action: HandlerActionType<T>,
): Record<string, T> {
  switch (action.type) {
    case 'add':
      return addState(handlers, action);
    case 'update':
      return updateState(handlers, action);
    case 'upsert':
      return upsertState(handlers, action);
    case 'remove':
      const filterFunc = action.filterFunc;
      if (!filterFunc) {
        return handlers;
      }
      const result: Record<string, T> = {};
      Object.entries(handlers).forEach(([key, value]) => {
        if (!filterFunc(key, value)) {
          result[key] = value;
        }
      });
      return result;
    case 'reset':
      return {};
    default:
      throw Error(`Unkown requestAction: ${action}`);
  }
}

export function useHandlerState<T>() {
  return useReducer(handlerStateReducer<T>, {});
}
