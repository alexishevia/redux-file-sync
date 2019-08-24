import { combineReducers } from 'redux';

function todosReducer(state = [], action) {
  const { type, payload } = action;

  if (type === 'todos/add') {
    return [...state, { isChecked: false, text: payload }]
  }

  if (type === 'todos/check') {
    return state.map((todo) => (
      todo.text === payload ? { ...todo, isChecked: true } : todo
    ))
  }

  if (type === 'todos/uncheck') {
    return state.map((todo) => (
      todo.text === payload ? { ...todo, isChecked: false } : todo
    ))
  }

  if (type === 'todos/delete') {
    return state.filter(todo => todo.text !== payload);
  }

  return state;
};

const rootReducer = combineReducers({
  todos: todosReducer,
  _sync: (state = {}) => state,
});

export default rootReducer;
