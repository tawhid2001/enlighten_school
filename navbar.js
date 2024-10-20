fetch("navbar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("navbar").innerHTML = data;

    const navElement = document.getElementById("nav-element");
    const token = localStorage.getItem("authToken");

    if (token) {
      const user_type = localStorage.getItem("user_type");

      if (user_type === "teacher") {
        navElement.innerHTML += `
          <li class="nav-item">
            <a class="nav-link" href="./add_course.html">Add Course</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="./profile.html">Profile</a>
          </li>
        `;
      } else if (user_type === "student") {
        navElement.innerHTML += `
          <li class="nav-item">
            <a class="nav-link" href="./enrolled_course.html">Enrolled Courses</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="./profile.html">Profile</a>
          </li>
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Department
            </button>
            <ul class="dropdown-menu" id="drop-department">
              <li><a class="dropdown-item" href="./index.html">All Departments</a></li>
            </ul>
          </div>
        `;
      }

      // Add Logout button on the right
      const logoutNav = document.querySelector(".navbar-nav:last-child");
      logoutNav.innerHTML = `
        <li class="nav-item logout-btn">
          <a class="nav-link" onclick="handleLogout()">Logout</a>
        </li>
      `;
    } else {
      navElement.innerHTML += `
        <li class="nav-item">
          <a class="nav-link" href="./login.html">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="./registration.html">Registration</a>
        </li>
      `;
    }
  });

const loadDepartments = () => {
  fetch("https://enlighten-institute-deployment.vercel.app/api/department/courselist/")
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      data.forEach((item) => {
        const parent = document.getElementById("drop-department");
        const li = document.createElement("li");
        li.classList.add("dropdown-item");
        li.innerHTML = `
          <li onclick = "loadCoursesByDepartment('${item.slug}')">${item.name}</li>
          `;
        parent.appendChild(li);
      });
    });
};

const loadCoursesByDepartment = (search) => {
  const token = localStorage.getItem("authToken");
  fetch(
    `https://enlighten-institute-deployment.vercel.app/api/department/courselist/${search}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((courses) => {
      const allCourse = document.getElementById("all-courses");
      allCourse.innerHTML = "";

      if (courses.length === 0) {
        // Show a message if no courses are available
        const noCourseMessage = document.createElement("p");
        noCourseMessage.textContent = "No courses to show.";
        noCourseMessage.style.textAlign = "center";
        noCourseMessage.style.fontWeight = "bold";
        noCourseMessage.style.fontSize = "18px";
        noCourseMessage.style.color = "#ff0000"; // Red color for emphasis
        noCourseMessage.style.marginTop = "20px";
        allCourse.appendChild(noCourseMessage);
      } else {
        // Display courses if available
        courses.forEach((course) => {
          const div = document.createElement("div");
          div.classList.add("col-sm-4");
          div.classList.add("mt-4");
          const imageUrl = course.image_url ? course.image_url : 'images/default.jpg';
          div.innerHTML = `
            <div class="card">
           <img src="${imageUrl}" class="card-img-top custom-img" alt="Course Image">
              <div class="card-body p-4">
                <h3 class="card-title">Course Name: ${course.course_name}</h3>
                <h5 class="card-text">Course Code: ${course.course_code}</h5>
                <p class="card-text">Teacher: ${course.teacher_name}</p>
                <p class="card-text">Department: ${course.department_name}</p>
                <p class="card-text">Time: <strong>${formatDate(
                  course.created_at
                )}</strong></p>
                <a href="./course_detail.html?id=${
                  course.id
                }" class="btn btn-primary">Details</a>
              </div>
            </div>
          `;
          allCourse.appendChild(div);
        });
      }
    });
};

const displayErrorMessage = (message) => {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.style.display = "block"; // Make error message visible
};
