const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  checkUsername: (username) => {
    return ipcRenderer.invoke('check-username', username);
  },
  authenticateUser: (username, password) => {
    return ipcRenderer.invoke('authenticate-user', username, password);
  },
  registerUser: (username, password) => {
    return ipcRenderer.invoke('register-user', username, password);
  },
  sendLoginSuccessful: () => {
    ipcRenderer.send('login-successful');
  },
  sendRegistrationSuccessful: () => {
    ipcRenderer.send('registration-successful');
  },
  navigateToLogin: () => {
    ipcRenderer.send('navigate-to-login');
  },
  navigateToRegister: () => {
    ipcRenderer.send('navigate-to-register');
  }
});