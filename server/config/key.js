if(process.env.NODE_ENV === 'production') {   //process.env.NODE_ENV : 환경변수
  module.exports = require('./prod');
} else {
  module.exports = require('./dev');
}