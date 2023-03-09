const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; // salt가 몇글자 인지
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,     // 공백없애는 역할
    unique: 1       // 유니크하게
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,    // 1이면 관리자, 0이면 일반유저 이런식으로
    default: 0
  },
  image: String,
  token: {    // 유효성 관리 등을 위한
    type: String
  },
  tokenExp: {
    type: Number
  }
});

userSchema.pre('save', function(next) {   // next하면 바로 index.js의 user.save 쪽으로 보내는거
  var user = this;

  if(user.isModified('password')) {   // 비밀번호 수정할떄만 이라는 조건 추가
    bcrypt.genSalt(saltRounds, function(err, salt) {  // salt 생성. salt를 이용해서 비밀번호 암호화
      if(err) return next(err)
  
      bcrypt.hash(user.password, salt, function(err, hash){   // hash가 암호화된 비밀번호
        if(err) return next(err)
        user.password = hash
        next()
      })
    });
  } else {
    next();   // 비밀번호가 바꾸는게 아니라 다른걸 바꿀때는 next해줘야 나갈 수 있음. else next() 없으면 여기에 계속 머물러 있음.
  }
})  // .pre()  mongoose 메서드 -> 유저 정보를 저장하기전에 할 일. 여기 내용이 실행된 뒤 index.js에 있는 user.save((err, userInfo)가 진행됨


userSchema.methods.comparePassword = function(plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) { // 입력받은 plainPassword가 db에 저장되어있는 암호화된 비밀번호와 일치하는지 확인
    
    if(err) return cb(err); // 일치하지않으면 err
    cb(null, isMatch);  // 일치하면 err는 없고 isMatch(=true) 전달
  });
}

userSchema.methods.generateToken = function(cb) {
  var user = this;  // es5 문법

  var token = jwt.sign(user._id.toHexString(), 'secretToken');  // user._id는 몽고DB에서 _id부분
  user.token = token;
  user.save(function(err, user) {
    if(err) return cb(err);
    cb(null, user); // save가 잘 됬으면 err는 없고 user(유저정보) 전달
  });
}

userSchema.statics.findByToken = function(token, cb) {
  var user = this;

  // token을 decode
  jwt.verify(token, 'secretToken', function(err, decodeed) {
    // 유저 아이디를 이용해서 유저 찾은 다음 클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인
    
    user.findOne({"_id": decodeed, "token": token}, function(err, user){
      if(err) return cb(err);
      cb(null, user);
    });
  });
}




const User = mongoose.model('User', userSchema);    // mongoose.model('모델이름', 스키마)

module.exports = { User } // User모델을 다른곳에서도 쓸수잇게 export해주기