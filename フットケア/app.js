const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

/*const connection = mysql.createConnection({
  host: 'localhost',
  root:'3306',
  user: 'footman',
  password: 'foot0913',	
  database: 'footcare'
});*/

const connection = mysql.createConnection({
  host: 'localhost',
  root:'3306',
  user: 'memon',
  password: 'memo1234',	
  database: 'logintry'
});

app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  if (req.session.userId === undefined) {
    res.locals.username = 'ゲスト';
    res.locals.isLoggedIn = false;
  } else {
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  }
  next();
});

app.get('/', (req, res) => {
  res.render('top.ejs');
});

app.get('/list', (req, res) => {
  res.render('list.ejs');
});

/*以下スライド達*/
app.get('/slide1', (req, res) => {
  res.render('slide1.ejs');
});
/*以上スライド*/

/*以下動画達*/
app.get('/video1', (req, res) => {
  res.render('video1.ejs');
});
/*以上動画 */

app.get('/signup', (req, res) => {
  res.render('signup.ejs', { errors: [] });
});

app.post('/signup', 
  (req, res, next) => {
    //入力欄の空チェック
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];

    if (username === '') {
      errors.push('ユーザー名が空です');
    }

    if (email === '') {
      errors.push('メールアドレスが空です');
    }

    if (password === '') {
      errors.push('パスワードが空です');
    }

    if (errors.length > 0) {
      res.render('signup.ejs', { errors: errors });
    } else {
      next();
    }
  },
  (req, res, next) => {
    //メールアドレスの重複チェック
    const email = req.body.email;
    const errors = [];
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (error, results) => {
        if (results.length > 0) {
          errors.push('ユーザー登録に失敗しました');
          res.render('signup.ejs', { errors: errors });
        } else {
          next();
        }
      }
    );
  },
  (req, res) => {
    //ユーザー登録
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 10, (error, hash) => {
      connection.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hash],
        (error, results) => {
          req.session.userId = results.insertId;
          req.session.username = username;
          res.redirect('/list');
        }
      );
    });
  }
);

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (results.length > 0) {
        const plain=req.body.password;
        
        const hash=results[0].password;
        
        bcrypt.compare(plain,hash,(error,isEqual)=>{
          if(isEqual){
            req.session.userId = results[0].id;
            req.session.username = results[0].username;
            res.redirect('/list');
          }else{
            res.redirect('/login');
          }
        });
        
      } else {
        res.redirect('/login');
      }
    }
  );
});

app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    res.redirect('/list');
  });
});
app.listen(3000);