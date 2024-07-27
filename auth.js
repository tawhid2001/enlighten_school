const handleRegistration = (event) =>{
    event.preventDefault();
    const form = document.getElementById("registration-form");
    const formData = new FormData(form);
    console.log(formData);

    const registrationData = {
        username: formData.get("username"),
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        password1: formData.get("password1"),
        password2: formData.get("password2"),
        user_type: formData.get("user_type"),
    }
    console.log("Registration Data: ", registrationData);
    fetch("https://enlighten-institute.onrender.com/api/auth/registration/", {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify(registrationData),
    }).then(res=>{
        // alert("Registration Successfull. Please check for confirmation email");
        window.location.href = "./login.html";
    }
    );
};

const handleLogin = (event) => {
    event.preventDefault();

    const form = document.getElementById("login-form");
    const formData = new FormData(form);

    const loginData = {
        username: formData.get("username"),
        password: formData.get("password"),
    };

    fetch("https://enlighten-institute.onrender.com/api/auth/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed. Please check your credentials.');
        }
        return response.json();
    })
    .then(data => {
        console.log("Login successful:", data);
        localStorage.setItem("authToken", data.key);
        window.location.href = "./index.html"; // Redirect to dashboard or home page
    })
    .catch(error => {
        console.error('Login error:', error.message);
        // Display error message to the user
        displayErrorMessage('Invalid username or password. Please try again.');
    });
};

const handleLogout = () => {
    const token = localStorage.getItem("authToken");
    
    fetch("https://enlighten-institute.onrender.com/api/auth/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        console.log(res);
        if (res.ok) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user_type");
          localStorage.removeItem("user_id");
          window.location.href = "./index.html";
        }
      })
      .catch((err) => console.log("Logout Error", err));
  };

  