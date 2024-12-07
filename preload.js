const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  checkUsername: (username) => ipcRenderer.invoke('check-username', username),
  authenticateUser: (username, password) => ipcRenderer.invoke('authenticate-user', username, password),
  registerUser: (username, password) => ipcRenderer.invoke('register-user', username, password),
  sendLoginSuccessful: (username) => ipcRenderer.send('login-successful', username),
  navigateToLogin: () => ipcRenderer.send('navigate-to-login'),
  registrationSuccessful: () => ipcRenderer.send('registration-successful'),
  navigateToRegister: () => ipcRenderer.send('navigate-to-register'),
  getUsername: () => ipcRenderer.invoke('get-username'),
  getUserIdByUsername: (username) => ipcRenderer.invoke('get-user-id-by-username', username),
  getDeviceListByUserId: (userId) => ipcRenderer.invoke('get-device-list-by-user-id', userId),
  addDevice: (userId, deviceName) => ipcRenderer.invoke('add-device', userId, deviceName),
  removeDevice: (deviceId) => ipcRenderer.invoke('remove-device', deviceId),
  updateDevice: (deviceId, newDeviceName) => ipcRenderer.invoke('update-device', deviceId, newDeviceName),
});
