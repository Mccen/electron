const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./js/db'); // 引入数据库模块

let mainWindow, initWindow;
let showusername = 'unknown';

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

  // 监听页面加载完成事件
  initWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    initWindow.webContents.send('page-loaded');
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

  // 监听页面加载完成事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    mainWindow.webContents.send('page-loaded');
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
  ipcMain.on('login-successful', (event, username) => {
    initWindow.close();
    showusername = username;
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

  // 获取用户名
  ipcMain.handle('get-username', async (event) => {
    try {
      return showusername;
    } catch (error) {
      console.error('Error getting username from variable:', error);
      throw error;
    }
  });

  // 获取用户ID
  ipcMain.handle('get-user-id-by-username', async (event, username) => {
    try {
      return await new Promise((resolve, reject) => {
        db.getUserIdByUsername(username, (err, userId) => {
          if (err) {
            reject(err);
          } else {
            resolve(userId);
          }
        });
      });
    } catch (error) {
      console.error('Error getting user ID by username:', error);
      throw error;
    }
  });

  // 获取设备列表
  ipcMain.handle('get-device-list-by-user-id', async (event, userId) => {
    try {
      return await new Promise((resolve, reject) => {
        db.getDeviceListByUserId(userId, (err, devices) => {
          if (err) {
            reject(err);
          } else {
            resolve(devices);
          }
        });
      });
    } catch (error) {
      console.error('Error getting device list by user ID:', error);
      throw error;
    }
  });

  // 添加设备
  ipcMain.handle('add-device', async (event, userId, deviceName) => {
    try {
      return await new Promise((resolve, reject) => {
        db.addDevice(userId, deviceName, (err, added) => {
          if (err) {
            reject(err);
          } else {
            resolve(added);
          }
        });
      });
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  });

  // 删除设备
  ipcMain.handle('remove-device', async (event, deviceId) => {
    try {
      return await new Promise((resolve, reject) => {
        db.removeDevice(deviceId, (err, removed) => {
          if (err) {
            reject(err);
          } else {
            resolve(removed);
          }
        });
      });
    } catch (error) {
      console.error('Error removing device:', error);
      throw error;
    }
  });

  // 更新设备
  ipcMain.handle('update-device', async (event, deviceId, newDeviceName) => {
    try {
      return await new Promise((resolve, reject) => {
        db.updateDevice(deviceId, newDeviceName, (err, updated) => {
          if (err) {
            reject(err);
          } else {
            resolve(updated);
          }
        });
      });
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
