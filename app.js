const getUserDetails = () => {
  const token = localStorage.getItem("authToken");

  fetch("https://enlighten-institute.onrender.com/api/auth/user/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      localStorage.setItem("user_type", data.user_type);
      localStorage.setItem("user_id", data.id);
    });
};

getUserDetails();
