const getQueryParams = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};


const getCourseDetail = () => {
    const courseId = getQueryParams("id");
    const userType = localStorage.getItem("user_type");
    fetch(`http://127.0.0.1:8000/api/course/courselist/${courseId}`)
      .then((res) => res.json())
      .then((course) => {
        console.log(course);
        const courseDetail = document.getElementById("course-detail");
        const div = document.createElement("div");
        div.innerHTML = `
          <div class="card m-5 mx-auto">
            <div class="card-body">
              <h1 class="card-title">Course Name: ${course.course_name}</h1>
              <h5 class="card-text">Course Code: ${course.course_code}</h5>
              <p class="card-text">Description: ${course.description}</p>
              <p class="card-text">Teacher: <small><strong>${course.teacher_name}</strong></small></p>
              <p class="card-text">Department: ${course.department_name}</p>
              <p class="card-text">Time: <small><strong>${formatDate(course.created_at)}</strong></small></p>
              ${userType === 'teacher' ? `
                <div class="d-flex bg-white justify-content-center align-items-center" id="controls">
                  <div><h3 class="m-auto">Course Controls:</h3></div>
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle m-4" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                      Menu
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                      <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editModal">Edit</a></li>
                      <li><a class="dropdown-item" href="#" onclick="deleteCourse()">Delete</a></li>
                      <li><a class="dropdown-item" href="./add_lesson.html?course_id=${courseId}" id="add-btn">Add Lesson</a></li>
                    </ul>
                  </div>
                </div>
              ` : ''}
              ${userType === 'student' ? `
                <button class="btn btn-primary m-4" id="enroll-btn" onclick="enrollStudent()">Enroll</button>
              ` : ''}
            </div>
          </div>
        `;
        courseDetail.appendChild(div);
  
        // set data into modal
        document.getElementById("edit_course_name").value = course.course_name;
        document.getElementById("edit_course_code").value = course.course_code;
        document.getElementById("editDescription").value = course.description;
      });
  };
  
  const toggleButtons = () => {
    const userType = localStorage.getItem("user_type");
    const courseId = getQueryParams("id");
    const control = document.getElementById("controls");
    const editCourseButton = document.getElementById("editcoursebtn");
    const deleteCourseButton = document.getElementById("delete-btn");
    const enrollButton = document.getElementById("enroll-btn");
  
    control.style.display = "none";
    if (userType === "student") {
      control.style.display = "none";
      editCourseButton.style.display = "none";
      deleteCourseButton.style.display = "none";
      enrollButton.style.display = "block";
      if (isCourseEnrolled(courseId)) {
        document.getElementById("course-progress").style.display = "block";
        document.getElementById("enroll-btn").style.display = "none";
      } else {
        enrollButton.style.display = "block";
      }
    } else if (userType === "teacher") {
      deleteCourseButton.style.display = "block";
      editCourseButton.style.display = "block";
      enrollButton.style.display = "none";
      control.style.display = "block";
      document.getElementById("course-progress").style.display = "none";
    } else {
      editCourseButton.style.display = "none";
      deleteCourseButton.style.display = "none";
      enrollButton.style.display = "none";
    }
  };
  
  // Function to retrieve user type from localStorage
  const getUserType = () => {
    return localStorage.getItem("user_type");
  };
  
  // Function to handle page load
  const handlePageLoad = () => {
    const userType = getUserType();
    toggleButtons(userType);
  };
  
  // Call handlePageLoad on page load
  window.onload = handlePageLoad;
  


  const editCourse = (event) => {
    event.preventDefault();
    const courseId = getQueryParams("id");
  
    const form = document.getElementById("edit-course");
    const formData = new FormData(form);
    const token = localStorage.getItem("authToken");
    console.log(token);
  
    const editcourseData = {
      course_name: formData.get("edit_course_name"),
      course_code: formData.get("edit_course_code"),
      description: formData.get("editDescription"),
    };
  
    fetch(`http://127.0.0.1:8000/api/course/courselist/${courseId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(editcourseData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        $("#editModal").modal("hide");
      });
  };
  
  const deleteCourse = () => {
    const courseId = getQueryParams("id");
    const token = localStorage.getItem("authToken");
    fetch(`http://127.0.0.1:8000/api/course/courselist/${courseId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => (window.location.href = "./index.html"))
      .catch((err) => console.log(err));
  };

  const addLesson=(event)=>{
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("course_id");
  
    const formData = {
      title : document.getElementById("lesson_title").value,
      content : document.getElementById("lesson_content").value,
      course: courseId,
    };
  
    const token = localStorage.getItem('authToken');
    fetch(`http://127.0.0.1:8000/api/course/${courseId}/lessons/`,{
      method:'POST',
      headers: {
        'Content-Type' : 'application/json',
        Authorization : `Token ${token}`,
      },
      body: JSON.stringify(formData),
    })
    .then((res) => res.json())
    .then((data) =>{
      console.log("Lesson added Successfully",data);
      window.location.href = `./course_detail.html?id=${courseId}`;
    });
  };

  const getLessons = () => {
    const courseId = getQueryParams("id");
    const userType = localStorage.getItem("user_type");
    const enrolled = localStorage.getItem(`course_enrolled_${courseId}`);
    const url = `http://127.0.0.1:8000/api/course/courselessons/${courseId}`;
    const headers = enrolled
      ? { Authorization: `Token ${localStorage.getItem("authToken")}` }
      : {};
  
    fetch(url, { headers })
      .then((res) => res.json())
      .then((lessons) => {
        console.log(lessons);
        const lessonContainer = document.getElementById("lessons");
        lessonContainer.innerHTML = "";
        if (!enrolled || userType === "teacher") {
          lessons.forEach((lesson) => {
            const div = document.createElement("div");
            div.className = "card m-5 mx-auto";
            div.innerHTML = `
          <div class="card-body">
                <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
                <h5 class="card-text">Lesson Content: ${lesson.content}</h5>
                <p class="card-text">Time: <small><strong>${formatDate(
                  lesson.created_at
                )}</strong></small></p>
                ${
                  userType === "teacher"
                    ? `
                  <a href="editlesson.html?lessonId=${lesson.id}&courseId=${courseId}" class="btn btn-primary m-4">Edit</a>
              <button class="btn btn-danger m-4" onclick="deleteLesson(${lesson.id})">Delete</button>
                  `
                    : ""
                }
              </div>
          `;
            lessonContainer.appendChild(div);
          });
        } else {
          lessons.forEach((lesson) => {
            const completedLesson = localStorage.getItem(
              `lesson_completed_${lesson.id}`
            );
            const div = document.createElement("div");
            div.className = "card m-5 mx-auto";
            if (completedLesson === "true") {
              div.innerHTML = `
            <div class="card-body">
                      <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
                      <h5 class="card-text">Lesson Content: ${lesson.content}</h5>
                      <p class="card-text">Time: <small><strong>${formatDate(
                        lesson.created_at
                      )}</strong></small></p>
                     
                        <button class="btn btn-primary mt-3" disabled>Completed</button>
                    </div>
                  `;
            } else {
              div.innerHTML = `
            <div class="card-body">
                      <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
                      <h5 class="card-text">Lesson Content: ${lesson.content}</h5>
                      <p class="card-text">Time: <small><strong>${formatDate(
                        lesson.created_at
                      )}</strong></small></p>
                      <form id="progressForm_${
                        lesson.id
                      }" onsubmit="submitProgress(event, ${lesson.id})">
                        <input type="hidden" name="lesson_id" value="${
                          lesson.id
                        }">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" name="completed" id="completed_${
                            lesson.id
                          }">
                          <label class="form-check-label" for="completed_${
                            lesson.id
                          }">
                            Completed
                          </label>
                        </div>
                        <button type="submit" class="btn btn-primary mt-3">Submit Progress</button>
                      </form>
                    </div>
                  `;
            }
            lessonContainer.appendChild(div);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching lessons:", error);
      });
  };


  getCourseDetail();
  getLessons();


