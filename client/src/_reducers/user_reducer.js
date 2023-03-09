import {
  LOGIN_USER,
  REGISTER_USER
} from '../_actions/types';

export default function(state = {}, action) { 
  switch (action.type) {   // user_action에서 넘겨준 action들을 type에 따라 실행할 일을 정해주기
    case LOGIN_USER:
      return {...state, loginSuccess: action.payload}   // reducer는 previousState와 action을 받아 next state을 리턴
      break;
    case REGISTER_USER:
      return {...state, register: action.payload}
      break;
    
    default:
      return state;
  }
}