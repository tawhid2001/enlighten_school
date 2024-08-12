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


const addCourse = (event) => {
  event.preventDefault();
  
  const form = document.getElementById("add-course");
  const formData = new FormData(form);
  
  // Generate slug
  const courseName = formData.get("course_name");
  const slug = courseName.toLowerCase().replace(/ /g, '-');
  
  formData.append('slug', slug);  // Append slug to FormData

  const token = localStorage.getItem("authToken");
  
  fetch("https://enlighten-institute.onrender.com/api/course/courselist/", {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      // Do not set Content-Type when using FormData
    },
    body: formData,
  })
  .then(res => {
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return res.json();
  })
  .then(data => {
    if (data && data.id) {
      window.location.href = "./index.html";
    } else {
      console.error('Unexpected response data:', data);
    }
  })
  .catch(error => {
    console.error('Error adding course:', error);
  });
};



const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};



const loadCourses = () => {
  const token = localStorage.getItem('authToken');
  
  fetch("https://enlighten-institute.onrender.com/api/course/courselist/", {
    method: 'GET',
    headers: {
      "Content-Type": 'application/json',
      "Authorization": `Token ${token}`  // Include Authorization header
    }
  })
  .then((res) => res.json())
  .then((courses) => {
    console.log(courses);
    const allCourse = document.getElementById("all-courses");
    allCourse.innerHTML = '';
    if (courses.length > 0) {
      courses.forEach((course) => {
        const div = document.createElement("div");
        div.classList.add("col-sm-4");
        div.classList.add("mt-4");
        console.log(course.image);
        div.innerHTML = `
          <div class="card">
            <img src="https://enlighten-institute.onrender.com${course.image}" class="card-img-top custom-img" alt="Course Image">
            <div class="card-body">
              <h3 class="card-title">Course Name: ${course.course_name}</h3>
              <h5 class="card-text">Course Code: ${course.course_code}</h5>
              <p class="card-text">Time: ${formatDate(course.created_at)}</p>
              <a href="./course_detail.html?id=${course.id}" class="btn btn-primary">Details</a>
            </div>
          </div>
        `;
        allCourse.appendChild(div);
      });
    } else {
      allCourse.innerHTML = '<p class="h1 p-4 m-4 text-danger">No courses to show</p>';
    }
  })
  .catch((error) => {
    console.error("Error loading courses:", error);
    const allCourse = document.getElementById("all-courses");
    allCourse.innerHTML = '<p class="h1 p-4 m-4 text-danger">Failed to load courses. Please try again later.</p>';
  });
};
