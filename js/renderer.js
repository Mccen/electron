document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
});

function initializeEventListeners() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

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
      if (callback) {
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

  // 设置登录表单的事件监听器
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        const isAuthenticated = await window.myAPI.authenticateUser(username, password);
        if (isAuthenticated) {
          window.myAPI.sendLoginSuccessful();
        } else {
          showModalDialog('登录失败，请检查账号或密码');
        }
      } catch (error) {
        console.error('Error during login:', error);
        showModalDialog('登录过程中发生错误，请稍后再试');
      }
    });
  }

  // 设置注册表单的事件监听器
  if (registerForm) {
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
      registerForm.addEventListener('submit', async (event) => {
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
              window.myAPI.sendRegistrationSuccessful(); // 使用 IPC 通信来导航到登录页面
            });
          } else {
            showModalDialog('注册失败');
          }
          clearUsernameStatus();
        } catch (error) {
          console.error('Error during registration:', error);
          showModalDialog('注册过程中发生错误，请稍后再试');
        }
      });
    } else {
      console.warn('Element not found: usernameInput');
    }
  }
}