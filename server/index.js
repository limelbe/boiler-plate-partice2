const express = require('express')
const app = express()
const port = 5000

const config = require('./config/key');
const { User } = require('./models/User');
const { auth } = require('./middleware/auth');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})); // application/x-www-form-urlencoded로 된 데이터를 분석해서 가져올수 있게
app.use(bodyParser.json()); // application/json 된 데이터를 분석해서 가져올 수 있게

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  // useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
  // 몽구스 버전이 6.0이상이라면 몽구스는 항상 위에처럼 기억하고 실행해서 안써줘도됨
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요')
})

// 간단한 axios 테스트
app.get('/api/hello', (req, res) => {
  res.send('axios 테스트입니다.');
});

// 회원가입 route
app.post('/api/users/register', (req, res) => {
  // 회원가입할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body) // req.body에 클라이언트에서 오는 정보가 json형식으로 들어있음 -> bodyparser를 이용해서 req.body로 클 받아준다

  user.save((err, userInfo) => {  // .save() : 몽고db 메서드 -> user 모델에 저장
    if(err) return res.json({ success: false, err})   // 만약 에러가 있다면 클라이언트에 에러있다고 전달
    return res.status(200).json({ 
      success: true
    })
  })   
});

// 로그인 route
app.post('/api/users/login', (req, res) => {
  // 1. 요청된 이메일이 데이터베이스에 있는지 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: '입력한 이메일과 일치하는 유저가 없습니다.'
      });
    }

    // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {   // User모델에 comparePassword라는 비밀번호를 비교하는 메서드 만들어서 사용
      if(!isMatch) {
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 일치하지 않습니다.'
        })
      }

      // 3. 비밀번호도 일치한다면 토큰 생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 쿠키에 저장
        res.cookie('x_auth', user.token)
          .status(200)
          .json({
            loginSuccess: true,
            userId: user._id
          });
      });
    });
  });
});

// 인증 route
app.get('/api/users/auth', auth, (req, res) => {  // auth는 미들웨어 -> 엔드포인트에서 req를 받은 후에 cb하기전에 중간에서 뭔갈 해주는
  // 미들웨어를 통과해서 여기까지 왔다는 얘기는 Authentication이 True라는 것
  // 이제 클라이언트에 정보 전달해줘야함

  req.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,    // 0: 일반유저, 그외: 관리자  로 설정
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});

// 로그아웃 route
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {_id: req.user._id},  // auth 미들웨어에서 가져와서 찾은 다음
    {token: ""},          // 토큰 지우기
    (err, user) => {
      if(err) return res.json({success: false, err});
      return res.status(200).send({
        success: true
      });
    }
  );
}); 




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})