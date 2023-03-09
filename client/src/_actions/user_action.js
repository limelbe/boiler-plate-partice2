import axios from 'axios';
import {
  LOGIN_USER,
  REGISTER_USER
} from './types';

export function loginUser(dataTosubmit) {   // 여기서 dataTosubmit는 LoginPage에서 loginUser(body)로 넣어준 email과 password

    const request = axios.post('/api/users/login', dataTosubmit)  // 서버에서 받은 데이터를 request에 저장
      .then(response => response.data);

    return {   // action은 {type, response}
      type: LOGIN_USER,
      payload: request    
    }   // request를 reducer로 보내기 -> reducer에서 previousState과 return한 action을 조합해서 다음 state를 만들어줌

} 

export function registerUser(dataTosubmit) { 

  const request = axios.post('/api/users/register', dataTosubmit)
    .then(response => response.data);

  return {
    type: REGISTER_USER,
    payload: request    
  }

} 