const userDetails =()=>{
    const token = localStorage.getItem('authToken');
    
  fetch('https://e-school-backend.onrender.com/api/auth/user/', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`
      }
  })
  .then(response => response.json())
  .then(data => {
   
    console.log(data);
      localStorage.setItem("user_type",data.user_type);
      localStorage.setItem("user_id",data.id);
      const userInfo = document.getElementById("userDetails");
      userInfo.innerHTML = '';
      const div = document.createElement("div");
      div.classList.add("col-sm-6");
      div.innerHTML = `
      <div class="card user-detail">
            <div class="card-body">
              <h3 class="card-title">Username: ${data.username}</h3>
              <h5 class="card-title">Name: ${data.first_name} ${data.last_name}</h5>
              <p class="card-text">email: ${data.email}</p>
              <p class="card-text">User Type: ${data.user_type}</p>
              <a class="btn btn-primary" href="./edit_user.html">Edit User Information</a>
            </div>
        </div>
          </div>
      `;
      userInfo.appendChild(div);
  });
  };
  