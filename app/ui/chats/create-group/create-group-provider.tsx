import { UserInfo } from '@/app/lib/types';
import { createContext, Dispatch, useContext, useReducer } from 'react';

type CreateGroupType = {
  selectedUser?: string;
  newGroupUsers?: Record<string, [UserInfo, number] | undefined>;
  isCreating: boolean;
  createOK: boolean;
  count: number;
};

type CreateGroupDispatchType = {
  type:
    | 'setSelectedUser'
    | 'setIsCreating'
    | 'addUser'
    | 'removeUser'
    | 'toggleUser'
    | 'reset';
  user?: UserInfo;
} & Partial<CreateGroupType>;

const CreateGroupContext = createContext<CreateGroupType>(null as any);
const CreateGroupDispatchContext = createContext<
  Dispatch<CreateGroupDispatchType>
>(null as any);

export function useCreateGroup() {
  return useContext(CreateGroupContext);
}

export function useCreateGroupDispatch() {
  return useContext(CreateGroupDispatchContext);
}

export function useNewGroupUser() {
  const { newGroupUsers } = useCreateGroup();
  const users = Object.values(newGroupUsers ?? {})
    .filter((u) => !!u)
    .sort((userA, userB) => userA![1] - userB![1])
    .map((user) => user![0]);
  return users;
}

function createGroupReducer(
  context: CreateGroupType,
  action: CreateGroupDispatchType,
): CreateGroupType {
  switch (action.type) {
    case 'setSelectedUser': 
      return {
        ...context,
        selectedUser: action.selectedUser,
      };
    case 'setIsCreating':
      return {
        ...context,
        isCreating: !!action.isCreating,
        createOK: action.createOK ?? true,
      };
    case 'addUser':
      if (!action.user) {
        return context;
      }
      const countAfterAdd = context.count + 1;
      return {
        ...context,
        count: countAfterAdd,
        newGroupUsers: {
          ...context.newGroupUsers,
          [action.user.id]: [action.user, countAfterAdd],
        },
      };
    case 'removeUser':
      if (!action.user) {
        return context;
      }
      return {
        ...context,
        newGroupUsers: {
          ...context.newGroupUsers,
          [action.user.id]: undefined,
        },
      };
    case 'toggleUser':
      if (!action.user) {
        return context;
      }
      const include = !!context.newGroupUsers?.[action.user.id];
      const countAfteroggleUser = include ? context.count : context.count + 1;
      return {
        ...context,
        count: countAfteroggleUser,
        newGroupUsers: {
          ...context.newGroupUsers,
          [action.user.id]: include
            ? undefined
            : [action.user, countAfteroggleUser],
        },
      };
    case 'reset':
      return {
        count: 0,
        isCreating: false,
        createOK: true,
      };
    default:
      throw Error(`Unkown action type: ${action}`);
  }
}

export function CreateGroupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, dispatch] = useReducer(createGroupReducer, {
    count: 0,
    isCreating: false,
    createOK: true,
  });

  return (
    <CreateGroupContext.Provider value={context}>
      <CreateGroupDispatchContext.Provider value={dispatch}>
        {children}
      </CreateGroupDispatchContext.Provider>
    </CreateGroupContext.Provider>
  );
}
