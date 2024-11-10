import React, { useState, useEffect } from 'react';
import './style.css';
import { ENDPOINT,MAINMANAGER } from '../utils';

const Login = () => {
  const [urlLogin, setUrlLogin] = useState('');
  const [level, setLevel] = useState('');
  const [isLcenterSelected, setIsLcenterSelected] = useState(false);
  useEffect(() => {
    // Check if 'isLoggedIn' is false in local storage
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'false';
    if (loggedInStatus) {
        window.location.href = '/';
    }
}, []);
useEffect(() => {
  // Check if 'isLoggedIn' is false in local storage
  const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
  if (loggedInStatus) {
      window.location.href = '/';
  }
}, []);
  useEffect(() => {
    const purposeDropdown = document.getElementById("purpose");
    const lcenterPurposeDropdown = document.getElementById("lcenterpurpose");

    if (purposeDropdown) {
      purposeDropdown.addEventListener('change', (event) => {
        const selectedValue = event.target.value;

        if (selectedValue === "lcenter") {
          setIsLcenterSelected(true);
          lcenterPurposeDropdown.style.display = "block";
          lcenterPurposeDropdown.addEventListener('change', (e) => {
            const selectedLevel = e.target.value;
            switch (selectedLevel) {
              case "teacher":
                setUrlLogin(`${ENDPOINT}/teachers/`);
                break;
              case "main-manager":
                setUrlLogin(`${ENDPOINT}/workers/`);
                setLevel("MAINMANAGER");
                
                break;
              case "manager":
                setUrlLogin(`${ENDPOINT}/workers/`);
                setLevel("MANAGER");
                break;
              case "admin":
                setUrlLogin(`${ENDPOINT}/workers/`);
                setLevel("ADMIN");
                break;
              default:
                break;
            }
          });
        } else if (selectedValue === "parent") {
          setIsLcenterSelected(false);
          lcenterPurposeDropdown.style.display = "none";
          setUrlLogin(`${ENDPOINT}/parents/`);
        } else if (selectedValue === "student") {
          setIsLcenterSelected(false);
          lcenterPurposeDropdown.style.display = "none";
          setUrlLogin(`${ENDPOINT}/students/`);
        }
      });
    }

    
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
  
    if (!urlLogin) {
      alert('Please select a purpose first.');
      return;
    }
  
    let isAuthenticated = false;
    let userId, userType;
  
    try {
        console.log(urlLogin);
      const response = await fetch(urlLogin);
      
      // Check if the response is not OK (like 404 or 500)
      if (!response.ok) {
        console.error("Response is not ok")
        return;
      }
  
      // If the response is OK, parse it as JSON
      const users = await response.json();
      console.log(users)
      for (const user of users) {
        if (
          (isLcenterSelected && user.workerRole === level && user.login === login && user.password === password) ||
          (!isLcenterSelected && user.login === login && user.password === password)
        ) {
          isAuthenticated = true;
          userId = user.id;
          userType = isLcenterSelected ? user.workerRole : user.userType;
          break;
        }
      }
  
      if (isAuthenticated) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userId);
        localStorage.setItem('userType', userType);
        window.location.href = '/'; // Navigate to user screen
      } else {
        alert('Invalid login or password');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('An error occurred while trying to log in');
    }
  };
  
  

  return (
    <body className="login-body">
        <div className="container-login">
      <h2 style={{ color: 'white', fontFamily: 'Courier New, Courier, monospace', textAlign: 'center' }}>
        Keshvista
      </h2>
      <div className="login-section">
        <header>Login</header>
        <div className="social-buttons">
          <select id="purpose" name="purpose" className="purpose">
            <option value="" disabled selected>
              Maqsaadingiz
            </option>
            <option value="lcenter">O'quv markazi</option>
            <option value="parent">Ota-Ona</option>
            <option value="student">O'quvchi</option>
          </select>
          <select id="lcenterpurpose" name="lcenterpurpose" className="lcenterpurpose" style={{ display: 'none' }}>
            <option value="" disabled selected>
              Lavozimingiz
            </option>
            <option value="main-manager">Asosiy Manager</option>
            <option value="manager">Manager</option>
            <option value="admin">Adminstrator</option>
            <option value="teacher">O'qtuvchi</option>
          </select>
        </div>
        <form onSubmit={handleLogin}>
          <input id="login" placeholder="Login" required />
          <input type="password" id="password" placeholder="Parol" required />
          <button id="login-button" type="submit" className="btn">
            Kirish
          </button>
        </form>
      </div>
    </div>
    </body>
  );
};

export default Login;
