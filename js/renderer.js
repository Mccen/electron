document.addEventListener('DOMContentLoaded', () => {
  // 检查当前页面是否是 login.html 或 register.html
  if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
    initializeEventListeners();
  }
  // 检查当前页面是否是 index.html
  if (window.location.pathname.includes('index.html')) {
    UserPanel();

  }
});

// 监听 page-loaded 事件
window.addEventListener('message', (event) => {
  if (event.data === 'page-loaded') {
    // 检查当前页面是否是 login.html 或 register.html
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
      initializeEventListeners();
    }
    // 检查当前页面是否是 index.html
    if (window.location.pathname.includes('index.html')) {
      UserPanel();

    }
  }
});

function initializeEventListeners() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginFunc(loginForm);
  }
  if (registerForm) {
    registerFunc(registerForm);
  }

  // // 添加导航按钮事件监听器
  // const navButtons = document.querySelectorAll('.nav-button');
  // navButtons.forEach(button => {
  //   button.addEventListener('click', (event) => {
  //     event.preventDefault();
  //     const targetPage = button.getAttribute('data-target-page');
  //     switch (targetPage) {
  //       case 'login':
  //         window.myAPI.navigateToLogin();
  //         break;
  //       case 'register':
  //         window.myAPI.navigateToRegister();
  //         break;
  //       default:
  //         console.warn(`Unknown navigation target: ${targetPage}`);
  //     }
  //   });
  // });
}

// 显示自定义模态对话框
function showModalDialog(message, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <button id="close-modal">确定</button>
      </div>
    `;
  document.body.appendChild(modal);

  const closeModalButton = document.getElementById('close-modal');
  closeModalButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    if (typeof callback === 'function') {
      callback();
    }
  });

  // 确保模态对话框关闭后恢复焦点
  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    setTimeout(() => {
      usernameInput.focus();
    }, 0);
  }
}

// 自定义提示对话框
function showPromptDialog(promptMessage, defaultValue, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
        <p>${promptMessage}</p>
        <input type="text" id="prompt-input" value="${defaultValue}" placeholder="请输入...">
        <div class="buttons-container">
          <button id="confirm-prompt">确定</button>
          <button id="cancel-prompt">取消</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);

  const promptInput = document.getElementById('prompt-input');
  const confirmButton = document.getElementById('confirm-prompt');
  const cancelButton = document.getElementById('cancel-prompt');

  confirmButton.addEventListener('click', () => {
    const inputValue = promptInput.value.trim();
    document.body.removeChild(modal);
    if (typeof callback === 'function') {
      callback(inputValue);
    }
  });

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    if (typeof callback === 'function') {
      callback(null);
    }
  });

  // 聚焦到输入框
  promptInput.focus();
}

// 自定义确认对话框
function showConfirmDialog(confirmMessage, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
        <p>${confirmMessage}</p>
        <div class="buttons-container">
          <button id="confirm-yes">确定</button>
          <button id="confirm-no">取消</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);

  const yesButton = document.getElementById('confirm-yes');
  const noButton = document.getElementById('confirm-no');

  yesButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    if (typeof callback === 'function') {
      callback(true);
    }
  });

  noButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    if (typeof callback === 'function') {
      callback(false);
    }
  });
}

function loginFunc(form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
      const isAuthenticated = await window.myAPI.authenticateUser(username, password);
      if (isAuthenticated) {
        window.myAPI.sendLoginSuccessful(username); // 传递用户名参数
      } else {
        showModalDialog('登录失败，请检查账号或密码');
      }
    } catch (error) {
      console.error('Error during login:', error);
      showModalDialog('登录过程中发生错误，请稍后再试');
    }
  });
}

function registerFunc(form) {
  // 确保每次加载页面时清除用户名状态
  clearUsernameStatus();

  // 检查用户名是否存在的函数
  async function checkUsernameAvailability(username) {
    try {
      console.log(`Checking username availability for: ${username}`);
      const isAvailable = await window.myAPI.checkUsername(username);
      if (!isAvailable) {
        setUsernameStatus('用户名已存在', true);
      } else {
        setUsernameStatus('', false);
      }
    } catch (err) {
      console.error('Error checking username availability:', err);
    }
  }

  // 设置用户名状态
  function setUsernameStatus(message, isError) {
    const usernameInput = document.getElementById('username');
    const usernameStatus = document.getElementById('username-status');

    if (usernameStatus && usernameInput) {
      usernameStatus.textContent = message;
      if (isError) {
        usernameInput.classList.add('error'); // 添加样式以突出显示错误
      } else {
        usernameInput.classList.remove('error');
      }
    } else {
      console.warn('Elements not found: usernameInput or usernameStatus');
    }
  }

  // 清除用户名状态
  function clearUsernameStatus() {
    setUsernameStatus('', false);
  }

  // 当用户名输入框失去焦点时检查用户名
  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    usernameInput.addEventListener('blur', () => {
      const username = usernameInput.value;
      if (username) {
        checkUsernameAvailability(username);
      }
    });

    // 在提交表单前再次检查用户名
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // 如果用户名已存在，阻止表单提交
      const usernameStatus = document.getElementById('username-status');
      if (usernameStatus && usernameStatus.textContent) {
        showModalDialog('请使用其他用户名');
        return;
      }

      try {
        const isRegistered = await window.myAPI.registerUser(username, password);
        if (isRegistered) {
          showModalDialog('注册成功!', () => {
            window.myAPI.registrationSuccessful(); // 导航到登录页面
          });
        } else {
          showModalDialog('注册失败');
        }
      } catch (error) {
        console.error('Error during registration:', error);
        showModalDialog('注册过程中发生错误，请稍后再试');
      }
    });
  } else {
    console.warn('Element not found: usernameInput');
  }
}

function UserPanel() {
  const panel = document.getElementById('user-panel');
  let userName = '';

  async function setUserName() {
    const showname = document.getElementById('showusername');
    if (showname) {
      try {
        userName = await window.myAPI.getUsername();
        if (!userName || typeof userName !== 'string') {
          console.error('Invalid username received from API:', userName);
          return;
        }
        showname.textContent = userName;
      } catch (error) {
        console.error('Error setting username:', error);
        showModalDialog('无法设置用户名');
      }
    } else {
      console.warn('Element with ID "showusername" not found in the DOM.');
    }
  }

  async function listDevices() {
    if (!userName || typeof userName !== 'string') {
      console.error('Invalid username when listing devices:', userName);
      showModalDialog('无法获取用户 ID');
      return;
    }

    try {
      const userId = await window.myAPI.getUserIdByUsername(userName);
      console.log('User ID:', userId); // 添加调试信息
      if (userId === null) {
        console.error('No user ID found for username:', userName);
        showModalDialog('无法获取用户 ID');
        return;
      }
      const devices = await window.myAPI.getDeviceListByUserId(userId);
      console.log('Devices:', devices); // 添加调试信息
      if (devices) {
        displayDevices(devices);
      } else {
        showModalDialog('无法获取设备列表');
      }
    } catch (error) {
      console.error('Error fetching device list:', error);
      showModalDialog('无法获取设备列表，请稍后再试');
    }
  }

  function displayDevices(devices) {
    const deviceList = document.getElementById('device-list');
    deviceList.innerHTML = ''; // 清空设备列表

    if (Array.isArray(devices)) {
      devices.forEach(device => {
        const listItem = document.createElement('li');
        listItem.dataset.deviceId = device.DeviceID; // 存储设备 ID
        listItem.innerHTML = `
        <div class="device-info">
          <b>${device.DeviceName}</b><br/>
          <span>ID: ${device.DeviceID}</span>
        </div>
        <div class="device-actions">
          <button class="edit-device">编辑</button>
          <button class="remove-device">删除</button>
        </div>
      `;
        deviceList.appendChild(listItem);
      });

      // 添加事件监听器
      const editButtons = document.querySelectorAll('.edit-device');
      editButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const listItem = event.target.parentElement;
          const deviceId = listItem.dataset.deviceId;
          const currentDeviceName = listItem.firstChild.nodeValue.trim();

          showPromptDialog('请输入新的设备名称:', currentDeviceName, async (newDeviceName) => {
            if (newDeviceName) {
              try {
                const updated = await window.myAPI.updateDevice(deviceId, newDeviceName);
                if (updated) {
                  showModalDialog('设备信息更新成功', () => {
                    listDevices(); // 刷新设备列表
                  });
                } else {
                  showModalDialog('设备信息更新失败');
                }
              } catch (error) {
                console.error('Error updating device:', error);
                showModalDialog('设备信息更新过程中发生错误，请稍后再试');
              }
            }
          });
        });
      });

      const removeButtons = document.querySelectorAll('.remove-device');
      removeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const listItem = event.target.parentElement.parentElement;
          const deviceId = listItem.dataset.deviceId;

          showConfirmDialog('确定要删除此设备吗？', async (confirmed) => {
            if (confirmed) {
              try {
                const removed = await window.myAPI.removeDevice(deviceId);
                if (removed) {
                  showModalDialog('设备删除成功', () => {
                    listDevices(); // 刷新设备列表
                  });
                } else {
                  showModalDialog('设备删除失败');
                }
              } catch (error) {
                console.error('Error removing device:', error);
                showModalDialog('设备删除过程中发生错误，请稍后再试');
              }
            }
          });
        });
      });
    } else {
      console.error('Devices is not an array:', devices);
      showModalDialog('无法解析设备列表');
    }
  }


  // 绑定事件到现有的“添加设备”按钮
  function setupAddDeviceButton() {
    const addButton = document.getElementById('add-device-button');
    if (addButton) {
      addButton.addEventListener('click', async () => {
        showPromptDialog('请输入新设备的名称:', '', async (deviceName) => {
          if (deviceName) {
            try {
              const userId = await window.myAPI.getUserIdByUsername(await window.myAPI.getUsername());
              if (userId) {
                const added = await window.myAPI.addDevice(userId, deviceName);
                if (added) {
                  showModalDialog('设备添加成功', () => {
                    listDevices(); // 刷新设备列表
                  });
                } else {
                  showModalDialog('设备添加失败');
                }
              } else {
                showModalDialog('无法获取用户 ID');
              }
            } catch (error) {
              console.error('Error adding device:', error);
              showModalDialog('设备添加过程中发生错误，请稍后再试');
            }
          }
        });
      });
    }
  }
  // 初始化时立即设置用户名并列出设备
  setUserName().then(listDevices);
  //绑定按钮事件
  setupAddDeviceButton();


}
