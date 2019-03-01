
require('babel-register');

var express = require('express');
var AWS = require('aws-sdk');
var multer  = require('multer');
var multerS3 = require('multer-s3');
var request = require('request');
var QRCode = require('qrcode');
var speakeasy = require('speakeasy');
var path = require('path');

var svgCaptcha = require('svg-captcha');
var config = require('./config');

var articleManager = require('./lib/article_manager')
var userManager = require('./lib/user_manager')

var UserLogType = require('./models/user_log_type');
var UserLogPlatform = require('./models/user_log_platform');

var woopay = require('./lib/woopay');
var utils = require('./lib/utils');


var router = express.Router();


AWS.config.loadFromPath(config.homePath + '/aws-config.json');
var s3 = new AWS.S3();


const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const _getPureIp = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const pureIp = null;

  if (ip) {
    const arr = ip.split(':');
    return arr[arr.length - 1];
  } else {
    return '';
  }
}

const _getUserLogPlatform = (req) => {
  const ua = req.headers['user-agent'];
  if (!ua) {
    return UserLogPlatform.DESKTOP;
  }

  if (ua.match(/iPhone|iPad|iPod/i)) {
    return UserLogPlatform.IOS;
  } else if (ua.match(/Android/i)) {
    return UserLogPlatform.ANDROID;
  } else if (ua.match(/BlackBerry/i)) {
    return UserLogPlatform.BLACK_BERRY;
  } else if (ua.match(/Opera Mini/i)) {
    return UserLogPlatform.OPERA_MINI;
  } else if (ua.match(/IEMobile/i) || ua.match(/WPDesktop/i)) {
    return UserLogPlatform.WINDOWS_MOBILE;
  } else {
    return UserLogPlatform.DESKTOP;
  }
}

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET auth page. */
router.get('/auth', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET register-need-confirmation page. */
router.get('/register-need-confirmation', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET register page. */
router.get('/register/confirmation', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET deposit history page. */
router.get('/deposit_history', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET withdrawal history page. */
router.get('/withdrawal_history', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET funds account page. */
router.get('/account', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET personal-info page. */
router.get('/personal-info', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET revise-password page. */
router.get('/revise-password', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET trade page. */
router.get('/trade/*', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET about us page. */
router.get('/about_us', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET fees page. */
router.get('/fees', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

/* GET contact us page. */
router.get('/contact_us', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

router.get('/gauthenticator', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
});

router.get('/phone-authenticator', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
})

router.get('/article/*', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
})

router.get('/api/user/logout', (req, res, next) => {
  req.session.userId = '';
  req.session.userEmail = '';
  req.session.userIdBefore2FA = '';
  req.session.captcha = '';

  res.send({
    message: 'ok'
  });
});


router.get('/api/user/captcha', (req, res) => {
  var captcha = svgCaptcha.create({
    ignoreChars: '0o1ilIO'
  });

  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});


router.post('/api/user/login', (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var captcha = req.body.captcha;

  if (!validateEmail(email)) {
    res.status(400).send({
      message: 'invalid-email'
    });
    return;
  }

  if (!password) {
    res.status(400).send({
      message: 'missing-password'
    });
    return;
  }

  if (!req.session.captcha || !captcha ||
      captcha.toLowerCase() != req.session.captcha.toLowerCase()) {
    res.status(400).send({
      message: 'invalid-captcha'
    });

    return;
  }

  userManager.login(email.toLowerCase(), password, (err, userId, userEmail, user2FA) => {
    if (!err) {
      if (user2FA) {
        req.session.userIdBefore2FA = userId;

        res.send({
          message: 'need-2fa'
        });
      } else {
        req.session.userId = userId;
        req.session.userEmail = userEmail;

        userManager.addUserLog(userId, UserLogType.LOGIN, _getPureIp(req), _getUserLogPlatform(req));

        res.send({
          message: 'ok',
          userId: userId,
          userEmail: userEmail
        });
      }
    } else {
      if (err == 'not-verified') {
        req.session.userIdTemp = userId;
        req.session.userEmailTemp = userEmail;
      }

      res.status(401).send({
        message: err
      });  // not-active or wrong-password
    }
  })
});


router.post('/api/user/enable_sms_step_1', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  let countryCode = req.body.countryCode;
  let phone = req.body.phone;

  if (!countryCode || !phone) {
    res.status(400).send({
      message: 'missing-parameters'
    });
    return;
  }

  userManager.enableSMSStep1(countryCode, phone, succeeded => {
    if (succeeded) {
      res.send({
        message: 'ok'
      });
    } else {
      res.status(401).send({
        message: 'failed-to-send'
      });
    }
  });
});


router.post('/api/user/enable_sms_step_2', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  let countryCode = req.body.countryCode;
  let phone = req.body.phone;
  let code = req.body.code;

  if (!countryCode || !phone || !code) {
    res.status(400).send({
      message: 'missing-parameters'
    });
    return;
  }

  userManager.enableSMSStep2(req.session.userId, countryCode, phone, code, (succeeded, error) => {
    if (succeeded) {
      res.send({
        message: 'ok'
      });
    } else {
      res.status(401).send({
        message: error
      });
    }
  });
});

router.post('/api/user/disable_sms', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }
  
  userManager.disableSms(req.session.userId, () => {
      // Disabling should always succeed.
    res.send({
      message: 'ok'
    });
  });
});


router.get('/api/user/get_code_status', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  userManager.getCodeStatus(req.session.userId, (isEnabled) => {
    res.send({
      isEnabled: isEnabled,
    })
  });
});


router.post('/api/user/login2fa', (req, res, next) => {
  if (!req.session || !req.session.userIdBefore2FA) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  var token2FA = req.body.token2FA;

  userManager.login2FA(req.session.userIdBefore2FA, token2FA, (succeeded, userId, userEmail) => {
    if (succeeded) {
      req.session.userId = userId;
      req.session.userEmail = userEmail;

      userManager.addUserLog(userId, UserLogType.LOGIN, _getPureIp(req), _getUserLogPlatform(req));

      res.send({
        message: 'ok',
        userId: userId,
        userEmail: userEmail
      });
    } else {
      res.status(401).send({
        message: '2fa-failed.'
      });
    }
  });
});


router.get('/api/user/get_random_2fa_qrcode', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  userManager.getRandom2FAQRCode(req.session.userId, (isEnabled, dataUrl) => {
    // DataUrl is available when 2FA is not enabled yet.

    res.send({
      isEnabled: isEnabled,
      dataUrl: dataUrl
    })
  });
});


router.post('/api/user/enable_or_disable_2fa', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  var actionType = req.body.actionType;

  if (actionType == 'enable') {
    var token2FA = req.body.token2FA;

    userManager.enable2FA(req.session.userId, token2FA, succeeded => {
      if (!succeeded) {
        res.status(403).send({
          message: 'enable-2fa-failed'
        });
      } else {
        res.send({
          message: 'ok'
        });
      }
    });
  } else {
    userManager.disable2FA(req.session.userId, () => {
      // Disabling should always succeed.
      res.send({
        message: 'ok'
      });
    });
  }
});


router.post('/api/user/register', (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var captcha = req.body.captcha;
  var language = req.body.language ? parseInt(req.body.language) : 0;

  if (!validateEmail(email) || email.length < 6 || email.length > 60) {
    res.status(400).send({
      message: 'invalid-email'
    });
    return;
  }

  if (!password || password.length < 6 || password.length > 20) {
    res.status(400).send({
      message: 'invalid-password'
    });
    return;
  }

  if (!req.session.captcha || !captcha ||
      captcha.toLowerCase() != req.session.captcha.toLowerCase()) {
    res.status(400).send({
      message: 'invalid-captcha'
    });
    return;
  }

  userManager.register(email.toLowerCase(), password, language, (err, user) => {
    if (err) {
      res.status(403).send({
        message: err
      });
    } else {
      req.session.userIdTemp = user.id;
      req.session.userEmailTemp = user.email;

      res.send({
        needEmailConfirmation: config.needEmailConfirmation,
        message: 'ok'
      });
    }
  });
});


router.post('/api/user/message', (req, res, next) => {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var website = req.body.website;
  var captcha = req.body.captcha;
  var message = req.body.message;
  
  if (!validateEmail(email) || email.length < 6 || email.length > 60) {
    res.status(400).send({
      message: 'invalid-email'
    });
    return;
  }

  if (!req.session.captcha || !captcha ||
      captcha.toLowerCase() != req.session.captcha.toLowerCase()) {
    res.status(400).send({
      message: 'invalid-captcha'
    });
    return;
  }

  if (!name || !message) {
    res.status(400).send({
      message: 'invalid-input'
    });
    return;
  }

  userManager.addMessage(name, email, phone, website, captcha, message);

  res.send({
    message: 'ok'
  });
});


router.post('/api/user/revise-password', (req, res, next) => {
  var current_password = req.body.current_password;
  var new_password = req.body.new_password;
  var confirm_password = req.body.confirm_password;
  
  if (!current_password || current_password.length < 6 || current_password.length > 20) {
    res.status(400).send({
      message: 'invalid-old-password'
    });
    return;
  }

  if (!new_password || new_password.length < 6 || new_password.length > 20) {
    res.status(400).send({
      message: 'invalid-new-password'
    });
    return;
  }

  if (!confirm_password || confirm_password.length < 6 || confirm_password.length > 20) {
    res.status(400).send({
      message: 'invalid-password'
    });
    return;
  }

  userManager.revisePassword(req.session.userId, current_password, new_password, (err) => {
    if(err) {
      res.status(403).send({
        message: err
      });
    } else {
      res.send({
        message: 'ok'
      });
    }
  });
});


router.get('/api/user/retry_email_register_confirmation', (req, res, next) => {
  if (!req.session || !req.session.userEmailTemp || !req.session.userIdTemp) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  if (req.session.alreadyRetried) {
    res.status(403).send({
      message: 'already-retried'
    });
  } else {
    req.session.alreadyRetried = true;

    if (req.session && req.session.userEmailTemp && req.session.userIdTemp) {
      userManager.sendConfirmationEmail(
          req.session.userEmailTemp,
          1, req.session.userIdTemp,
          'Please confirm your registration at B99', '');
    }
    res.send({
      message: 'ok'
    });
  }
});


router.get('/api/user/confirm_registration', (req, res, next) => {
  var code = req.query.code;
  if (!code) {
    res.status(400).send({
      message: 'missing-code'
    });
  }

  userManager.respondToConfirmationEmail(code, (type, action, email) => {
    switch (type) {
      case 1:
        res.send({
          message: 'ok'
        })
        break;
      case 0:
      default:
        res.status(403).send({
          message: 'invalid-code'
        });
        break;
    }
  });
});


router.get('/api/user/get_user_basic_info', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  userManager.getUserBasicInfo(req.session.userId, (user) => {
    res.send(user);
  });
});


router.get('/api/user/get_user_kyc_info', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  userManager.getUserKYCInfo(req.session.userId, (user) => {
    res.send(user);
  });

  /* Default to home page */
  router.get('*', function(req, res, next) {
    if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
      res.sendFile(path.resolve(__dirname + `/b99_frontend/dist/trading-app/${req.url}`));
    } else {
      res.sendFile(path.resolve(__dirname + '/b99_frontend/dist/trading-app/index.html'));
    }
  });
});


var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'b99-kyc-upload',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const userId = req.session.userId;

      if (!userId) return;

      let key = userId + '/' + file.originalname;
      cb(null, key);
    },
    acl: 'public-read',
  })
});


router.post('/api/user/upload_kyc', upload.array('images', 3), function(req, res, next) {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });

    return;
  }

  const userId = req.session.userId;

  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const nationality = req.body.nationality;
  const documentType = req.body.documentType || 0;
  const documentNumber = req.body.documentNumber;

  userManager.uploadUserKYCInfo(userId, nationality, documentType * 1, documentNumber,
                                firstname, lastname);

  res.send({
    message: 'ok'
  });
});


router.get('/api/user/get_referral_status', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  userManager.getReferralStatus(req.session.userId, (c1, c2, c3) => {
    res.send({
      tier1Count: c1,
      tier2Count: c2,
      tier3Count: c3
    });
  });
});


router.get('/api/auth/get_login_history', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  userManager.getUserLogs(req.session.userId, (userLogs) => {
    res.send(userLogs);
  })
});


router.get('/api/article/get_latest_articles', (req, res, next) => {
  const limit = 3;
  const offset = 0;
  articleManager.getArticles(limit, offset, articles => {
    res.send(articles || []);
  });
});


router.get('/api/article/get_article_by_id', (req, res, next) => {
  let articleId = req.query.articleId;

  if (!articleId) {
    res.status(400).send({
      message: 'missing-parameters'
    });
    return;
  }

  articleManager.getArticleById(articleId * 1, article => {
    if (!article) {
      res.status(404).send({
        message: 'not-found'
      });
      return;
    }

    res.send(article);
  });
});


router.get('/api/trade/get_orderbook', (req, res, next) => {
  let pair = req.query.pair;

  if (!pair) {
    res.status(400).send({
      message: 'missing-parameters'
    });
    return;
  }

  const url = config.tradeServer + '/get_orderbook?pair=' +
      pair;
  
  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});

router.get('/api/user/get_my_country', (req, res, next) =>{

  const ip = _getPureIp(req);
  const accessKey = '0bd0fdb2a37f7b545d44d2efa460fc63';

  const url = 'http://api.ipstack.com/' + ip + '?access_key=' + accessKey;

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      res.status(404).send({
          message: 'in-maintenance'
      });
    }
  });
})


router.get('/api/trade/get_open_orders', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const url = config.tradeServer + '/get_open_orders?userId=' + userId;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/trade/get_history_orders', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    const url = config.tradeServer + '/get_history_orders?userId=' + userId +
        '&limit=' + limit + '&offset=' + offset;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.post('/api/trade/trade', (req, res, next) => {
  const apiKey = req.body.apiKey;
  const apiSecret = req.body.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const orderType = req.body.orderType;
    const pair = req.body.pair;
    const quantity = req.body.quantity;
    const limit = req.body.limit;

    if (!orderType || !pair || !quantity || !limit) {
      res.status(400).send({
        message: 'missing-parameters'
      });
      return;
    }

    const body = 'userId=' + userId + '&orderType=' + orderType +
        '&pair=' + pair + '&quantity=' + quantity +
        '&limit=' + limit;

    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url: config.tradeServer + '/trade',
      body: body
    }, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.post('/api/trade/cancel', (req, res, next) => {
  const apiKey = req.body.apiKey;
  const apiSecret = req.body.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const uuid = req.body.uuid;

    if (!uuid) {
      res.status(400).send({
        message: 'missing-parameters'
      });
      return;
    }

    const body = 'userId=' + userId + '&uuid=' + uuid;

    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url: config.tradeServer + '/cancel',
      body: body
    }, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/trade/get_trades', (req, res, next) => {
  let pair = req.query.pair;
  let limit = req.query.limit || 100;

  if (!pair) {
    res.status(400).send({
      message: 'missing-parameters'
    });
  }

  const url = config.tradeServer + '/get_trades?pair=' +
      pair + '&limit=' + limit;

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});


router.get('/api/trade/get_trading_pairs', (req, res, next) => {
  const url = config.tradeServer + '/get_trading_pairs';

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});


router.get('/api/trade/get_trading_pair_info', (req, res, next) => {
  let pair = req.query.pair;

  if (!pair) {
    res.status(400).send({
      message: 'missing-parameters'
    });
  }

  const url = config.tradeServer + '/get_trading_pair_info?pair=' + pair;

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});


router.get('/api/trade/get_history', (req, res, next) => {
  const pair = req.query.pair;
  const d = req.query.d;
  const from = req.query.from;
  const to = req.query.to;

  if (!pair || !d || !from || !to) {
    res.status(400).send({
      message: 'missing-parameters'
    });
    return;
  }

  const url = config.tradeServer + '/get_history?pair=' + pair + '&d=' + d
      + '&from=' + from + '&to=' + to;

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});


router.get('/api/wallet/get_deposits', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const currencyId = req.query.currencyId || '';
    const limit = req.query.limit || '';
    const offset = req.query.offset || '';

    const url = config.walletServer + '/get_deposits?userId=' + userId + '&currencyId=' + currencyId
        + '&limit=' + limit + '&offset=' + offset;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/wallet/get_withdraws', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const currencyId = req.query.currencyId || '';
    const limit = req.query.limit || '';
    const offset = req.query.offset || '';

    const url = config.walletServer + '/get_withdraws?userId=' + userId + '&currencyId=' + currencyId
        + '&limit=' + limit + '&offset=' + offset;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/wallet/get_currency', (req, res, next) => {
  let currencyId = req.query.currencyId;

  if (!currencyId) {
    res.status(400).send({
      message: 'missing-parameters'
    });
    return;
  }

  const url = config.walletServer + '/get_currency?currencyId=' + currencyId;

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});


router.get('/api/wallet/get_account_amount', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    let currencyId = req.query.currencyId;

    if (!currencyId) {
      res.status(400).send({
        message: 'missing-parameters'
      });
      return;
    }

    const url = config.walletServer + '/get_account_amount?userId=' + userId
        + '&currencyId=' + currencyId;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/wallet/get_available_account_amount', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    let currencyId = req.query.currencyId;

    if (!currencyId) {
      res.status(400).send({
        message: 'missing-parameters'
      });
      return;
    }

    const url = config.walletServer + '/get_available_account_amount?userId=' + userId
        + '&currencyId=' + currencyId;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/wallet/get_available_amount_by_pair', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  const userId = req.session.userId;
  const pair = req.query.pair;

  if (!pair) {
    res.status(400).send({
      message: 'missing-parameters'
    });
  }

  const url = config.walletServer + '/get_available_amount_by_pair?userId=' +
      userId + '&pair=' + pair;

  request(url, (error, response, body) => {
    if (response && response.statusCode == 200) {
      res.setHeader('content-type', response.headers['content-type']);
      res.send(body);
    } else {
      if (!response) {
        res.status(404).send({
          message: 'in-maintenance'
        });
      } else {
        res.status(response.statusCode).send(response.body);
      }
    }
  });
});


router.get('/api/wallet/get_all_currency_info', (req, res, next) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const url = config.walletServer + '/get_all_currency_info?userId=' +
        userId;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/api/wallet/get_wallet_address', (req, res) => {
  const apiKey = req.query.apiKey;
  const apiSecret = req.query.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    let walletType = req.query.walletType;

    if (isNaN(walletType)) {
      res.status(400).send({
        message: 'missing-parameters'
      });
      return;
    }

    const url = config.walletServer + '/get_wallet_address?userId=' + userId 
        + '&walletType=' + walletType;

    request(url, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.post('/api/wallet/withdraw', (req, res, next) => {
  const apiKey = req.body.apiKey;
  const apiSecret = req.body.apiSecret;

  userManager.checkApiAccess(apiKey, apiSecret, (succeeded, userId) => {
    if (!succeeded) {
      if (!req.session || !req.session.userId || !req.session.userEmail) {
        res.status(401).send({
          message: 'need-login'
        });
        return;
      } else {
        userId = req.session.userId
      }
    }

    const currencyId = req.body.currencyId;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;
    const password = req.body.password;

    if (!currencyId || !amount || !toAddress || !password) {
      res.status(400).send({
        message: 'missing-parameters'
      });
      return;
    }

    const body = 'userId=' + userId + '&currencyId=' + currencyId +
        '&amount=' + amount + '&toAddress=' + toAddress + '&password=' + password;

    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url: config.walletServer + '/withdraw',
      body: body
    }, (error, response, body) => {
      if (response && response.statusCode == 200) {
        res.setHeader('content-type', response.headers['content-type']);
        res.send(body);
      } else {
        if (!response) {
          res.status(404).send({
            message: 'in-maintenance'
          });
        } else {
          res.status(response.statusCode).send(response.body);
        }
      }
    });
  });
});


router.get('/r/:userId', function(req, res, next) {
  let userId = req.params.userId;

  if (!userId) {
    userId = 1;
  }

  userId = parseInt(userId);

  if (userId <= 0 || isNaN(userId)) {
    userId = 1;
  }

  res.render('home', {
    fromId: userId
  });
});


router.get('/rg/:userId', function(req, res, next) {
  let userId = req.params.userId;
  let message = req.query.message;

  if (!userId) {
    userId = 1;
  }

  userId = parseInt(userId);

  if (userId <= 0 || isNaN(userId)) {
    userId = 1;
  }

  res.render('register', {
    fromId: userId,
    message: message
  });
});


router.post('/rg_action', (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var captcha = req.body.captcha;
  var language = req.body.language ? parseInt(req.body.language) : 0;
  var fromId = req.body.fromId;

  if (!validateEmail(email) || email.length < 6 || email.length > 60) {
    res.redirect('/rg/' + fromId + '?message=不合格的邮件地址');
    return;
  }

  if (!password || password.length < 6 || password.length > 20) {
    res.redirect('/rg/' + fromId + '?message=不合格的密码');
    return;
  }

  if (!req.session.captcha || !captcha ||
      captcha.toLowerCase() != req.session.captcha.toLowerCase()) {
    res.redirect('/rg/' + fromId + '?message=验证码错误');
    return;
  }

  userManager.register(email.toLowerCase(), password, language, (err, user) => {
    if (err) {
      res.redirect('/rg/' + fromId + '?message=注册失败');
    } else {
      utils.addReferral(fromId, email, _ => {});
      res.render('register_action', {
        email: email,
        needEmailConfirmation: config.needEmailConfirmation
      });
    }
  });
});


router.post('/share', function(req, res, next) {
  const email = req.body.email;
  const fromId = req.body.fromId;

  if (!email || !validateEmail(email) || !fromId) {
    res.redirect('/');
    return;
  }

  utils.addReferral(fromId, email, (myUserId) => {
    res.render('share', {
      myUserId: myUserId
    });
  });
});


const dataUriToBuffer = require('data-uri-to-buffer');

router.get('/share_image', function(req, res, next) {
  var userId = req.query.userId;

  utils.generateMyImage(userId, dataUri => {
    const img = dataUriToBuffer(dataUri);

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': img.length
    });
    res.end(img);
  });
});


router.post('/api/fiat/send_order', (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.userEmail) {
    res.status(401).send({
      message: 'need-login'
    });
    return;
  }

  let amount = req.body.amount;

  if (!amount) {
    res.status(400).send('missing parameters');
    return;
  }

  amount = parseFloat(amount);
  if (parseFloat(amount) < 50) {
    res.status(400).send('invalid amout');
    return;
  }

  woopay.sendOrder(req.session.userId, amount, (result, message) => {
    if (result) {
      res.redirect(message);
    } else {
      res.status(401).send(message);
    }
  })
});


router.post('/api/fiat/notify', (req, res, next) => {
  const code = req.body.code;
  const sign = req.body.sign;
  const context = req.body.context;

  if (code == 0) {
    woopay.checkNotify(sign, context);
  }

  res.send('ok');
});


module.exports = router;
