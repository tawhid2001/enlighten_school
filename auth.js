const handleRegistration = (event) => {
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
  };
  console.log("Registration Data: ", registrationData);

  fetch(
    "https://enlighten-institute-deployment.vercel.app/api/auth/registration/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    }
  ).then((res) => {
    // alert("Registration Successfull. Please check for confirmation email");
    window.location.href = "./login.html";
  });
};

const handleLogin = (event) => {
  event.preventDefault();

  const form = document.getElementById("login-form");
  const formData = new FormData(form);

  const loginData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  fetch("https://enlighten-institute-deployment.vercel.app/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Login successful:", data);
      localStorage.setItem("authToken", data.key);

      // Fetch the user profile to get the user_type
      return fetch(
        "https://enlighten-institute-deployment.vercel.app/api/auth/user/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${data.key}`,
          },
        }
      );
    })
    .then((response) => response.json())
    .then((userData) => {
      console.log("User profile:", userData);
      localStorage.setItem("user_type", userData.user_type);

      // Redirect based on user_type
      if (userData.user_type === "student") {
        window.location.href = "./enrolled_course.html";
      } else {
        window.location.href = "./index.html";
      }
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      // Display error message to the user
      displayErrorMessage("Invalid username or password. Please try again.");
    });
};

const handleLogout = () => {
  const token = localStorage.getItem("authToken");
  fetch("https://enlighten-institute-deployment.vercel.app/api/auth/logout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then((res) => {
      console.log(res);
      if (res.ok) {
        localStorage.clear();
        window.location.href = "./index.html";
      }
    })
    .catch((err) => {
      console.error("Logout Error", err);
      localStorage.clear(); // Force clear storage on error as well
      window.location.href = "./index.html";
    });
};
