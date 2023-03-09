const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 인증 처리를 하는 곳
  
  // 1. 클라이언트 쿠키에서 토큰을 가져옴
  let token = req.cookies.x_auth;  // x_auth는 로그인 시 쿠키저장할때 내가 정해준 이름

  // 2. 가져온 토큰을 복호화한 후 유저를 찾음 -> User모델에서 메서드 만들어서 복호화에 사용
  // 3. 유저가 있으면 인증 OK / 유저가 없으면 인증 NO
  User.findByToken(token, (err, user) => {
    if(err) throw err;
    if(!user) return res.json({isAuth: false, error: true});

    req.token = token;
    req.user = user;    // 찾은 유저와 토큰을 req에 넣어주기 -> index.js에서 req.~~으로 사용할 수 있게 하기 위해

    next(); // next가 없으면 미들웨어에 갇혀있음

  });
}


module.exports = { auth };