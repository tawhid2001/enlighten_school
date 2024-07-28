const getUserDetails = () => {
  const token = localStorage.getItem("authToken");
  // https://enlighten-institute.onrender.com/api/auth/user/
  fetch("http://127.0.0.1:8000/api/auth/user/", {
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


const addCourse =(event) =>{
  event.preventDefault();
  const form = document.getElementById("add-course");
  const formData = new FormData(form);
  const token = localStorage.getItem("authToken");
  
  const courseData = {
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    description: formData.get("description"),
    slug: formData.get("course_name").toLowerCase().replace(/ /g, '-'),
    department: formData.get("department"),
  };
  // https://enlighten-institute.onrender.com/api/course/courselist/
  fetch("http://127.0.0.1:8000/api/course/courselist/",{
    method: "POST",
    headers:{
      "Content-Type":"application/json",
      Authorization : `Token ${token}`,
    },
    body : JSON.stringify(courseData),
  }).then(res=>res.json())
  .then(data=>{
    window.location.href = "./index.html";
  })
};


const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const loadCourses = () => {
  const token = localStorage.getItem('authToken');
  
  
  fetch("http://127.0.0.1:8000/api/course/courselist/", {
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
    if(courses.length > 0){
      courses.forEach((course) => {
        const div = document.createElement("div");
        div.classList.add("col-sm-6");
        div.innerHTML = `
          <div class="card">
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
    }else{
      allCourse.innerHTML = '<p class="h1 p-4 m-4 text-danger">No courses to show</p>';
    }
  })
  .catch((error) => {
    console.error("Error loading courses:", error);
  });
};