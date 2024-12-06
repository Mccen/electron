const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./js/db'); // 引入数据库模块

let mainWindow,initWindow;
function init(url) {
  initWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      nodeIntegration: false,       // 禁用 Node.js 集成
      contextIsolation: true,     // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js') // 使用预加载脚本
    }
  });

  initWindow.loadFile(path.join(__dirname, url));

  // 关闭窗口时的处理
  initWindow.on('closed', () => {
    initWindow = null;
  });
}
function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      nodeIntegration: false,       // 禁用 Node.js 集成
      contextIsolation: true,     // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js') // 使用预加载脚本
    }
  });

  mainWindow.loadFile(path.join(__dirname, url));

  // 关闭窗口时的处理
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit(); // 关闭应用程序
  });
}

app.whenReady().then(() => {
  init('html/login.html');

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      init('html/login.html');
    }
  });

  // 监听 check-username 请求
  ipcMain.handle('check-username', async (event, username) => {
    try {
      return await new Promise((resolve, reject) => {
        db.checkUsernameExists(username, (err, isAvailable) => {
          if (err) {
            reject(err);
          } else {
            resolve(isAvailable); // true 表示用户名可用
          }
        });
      });
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
  });

  // 监听 authenticate-user 请求
  ipcMain.handle('authenticate-user', async (event, username, password) => {
    try {
      return await new Promise((resolve, reject) => {
        db.authenticateUser(username, password, (err, isAuthenticated) => {
          if (err) {
            reject(err);
          } else {
            resolve(isAuthenticated);
          }
        });
      });
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  });

  // 监听 register-user 请求
  ipcMain.handle('register-user', async (event, username, password) => {
    try {
      return await new Promise((resolve, reject) => {
        db.registerUser(username, password, (err, isRegistered) => {
          if (err) {
            reject(err);
          } else {
            resolve(isRegistered);
          }
        });
      });
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  });

  // 监听登录成功的消息
  ipcMain.on('login-successful', () => {
    initWindow.close();
    createWindow('./html/index.html');
  });

  // 监听导航到登录页面的消息
  ipcMain.on('navigate-to-login', () => {
    initWindow.loadFile(path.join(__dirname, './html/login.html'));
  });

  // 监听注册成功的消息
  ipcMain.on('registration-successful', () => {
    initWindow.loadFile(path.join(__dirname, './html/login.html'));
  });

  // 监听导航到注册页面的消息
  ipcMain.on('navigate-to-register', () => {
    initWindow.loadFile(path.join(__dirname, './html/register.html'));
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});