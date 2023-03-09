import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { loginUser } from '../../../_actions/user_action';
import { useNavigate } from 'react-router-dom';

function LoginPage() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value);
  }

  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  }

  const onSubmitHandler = (event) => {
    event.preventDefault();

    let body = {
      email: Email,
      password: Password
    }


    //  redux 안쓰면 여기서 쓰는데 redux쓰면 action파일 따로 만들어서 거기서 Axios.~~
    // Axios.post('/api/users/login', body)
    //   .then(response => {
    //      ...
    //   })
    dispatch(loginUser(body))   // loginUser는 action / dispatch를 이용해서 action을 보냄 -> reducer -> store
      .then(response => {
        if(response.payload.loginSuccess) {
          navigate('/');
        }
      })
    }


  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh'
    }}>
      <form style={{display: 'flex', flexDirection: 'column'}} 
        onSubmit={onSubmitHandler}
      >
        <label>Email</label>
        <input type="email" value={Email} onChange={onEmailHandler} />
        <label>Password</label>
        <input type="password" value={Password} onChange={onPasswordHandler} />
        <br />
        <button>Login</button>
      </form>
    </div>
  )
}

export default LoginPage