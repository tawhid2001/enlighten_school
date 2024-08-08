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
              <p class="card-text">Teacher: <small><strong>${
                course.teacher_name
              }</strong></small></p>
              <p class="card-text">Department: ${course.department_name}</p>
              <p class="card-text">Time: <small><strong>${formatDate(
                course.created_at
              )}</strong></small></p>
              ${
                userType === "teacher"
                  ? `
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
              `
                  : `
            
              `
              }
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

const isCourseEnrolled = (courseId) => {
  return localStorage.getItem(`course_enrolled_${courseId}`) === "true";
};

const toggleButtons = (userType) => {
  const courseId = getQueryParams("id");
  const control = document.getElementById("controls");
  const enrollButton = document.getElementById("enroll-btn");
  const courseProgress = document.getElementById("course-progress");

  // Initialize visibility
  control.style.display = "none";
  enrollButton.style.display = "none";
  courseProgress.style.display = "none";

  if (userType === "student") {
    if (isCourseEnrolled(courseId)) {
      courseProgress.style.display = "block";
      enrollButton.style.display = "none";
    } else {
      enrollButton.style.display = "block";
    }
  } else if (userType === "teacher") {
    enrollButton.style.display = "none";
    control.style.display = "block";
    courseProgress.style.display = "none";
  } else {
    enrollButton.style.display = "none";
  }
};

// Function to retrieve user type from localStorage
const getUserType = () => {
  return localStorage.getItem("user_type");
};



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

const addLesson = (event) => {
  event.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course_id");

  const formData = {
    title: document.getElementById("lesson_title").value,
    content: document.getElementById("lesson_content").value,
    course: courseId,
  };

  const token = localStorage.getItem("authToken");
  fetch(`http://127.0.0.1:8000/api/course/${courseId}/lessons/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Lesson added Successfully", data);
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
                <p class="card-text">Time: <small><strong>${formatDate(
                  lesson.created_at
                )}</strong></small></p>
                ${
                  userType === "teacher"
                    ? `
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle m-4" type="button" id="dropdownMenuButton_${lesson.id}" data-bs-toggle="dropdown" aria-expanded="false">
                      Menu
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton_${lesson.id}">
                      <a href="lesson_details.html?lessonId=${lesson.id}&courseId=${courseId}" class="dropdown-item">Details</a>
                    <a href="editlesson.html?lessonId=${lesson.id}&courseId=${courseId}" class="dropdown-item">Edit</a>
                    <button class="dropdown-item" onclick="deleteLesson(${lesson.id})">Delete</button>
                    </ul>
                  </div>
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
                  <a class="btn btn-primary" href="lesson_details.html?lessonId=${
                    lesson.id
                  }&courseId=${courseId}">Details</a>
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
                    <input type="hidden" name="lesson_id" value="${lesson.id}">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" name="completed" id="completed_${
                        lesson.id
                      }">
                      <label class="form-check-label" for="completed_${
                        lesson.id
                      }">Completed</label>
                    </div>
                    <button type="submit" class="btn btn-primary mt-3">Submit Progress</button>
                    </form>
                    </div>
                    <a class="btn btn-warning" href="lesson_details.html?lessonId=${
                      lesson.id
                    }&courseId=${courseId}">Details</a>
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

const deleteLesson = (lessonID) => {
  const courseId = getQueryParams("courseId");
  const token = localStorage.getItem("authToken");

  fetch(`http://127.0.0.1:8000/api/course/lesson/${lessonID}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then(() => {
      alert("Lesson deleted successfully!");
      window.location.href = `course_detail.html?id=${courseId}`;
    })
    .catch((err) => {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    });
};

const enrollStudent = () => {
  const token = localStorage.getItem("authToken");
  const studentId = localStorage.getItem("user_id");
  const courseId = getQueryParams("id");
  fetch("http://127.0.0.1:8000/api/enrollment/list/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      student: studentId,
      course: courseId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to enroll in the course.");
      }
      return response.json();
    })
    .then((enrollment) => {
      console.log("Enrollment successful:", enrollment);
      localStorage.setItem(`course_enrolled_${courseId}`, true);
      window.location.href = `./course_detail.html?id=${courseId}`;
    })
    .catch((error) => {
      console.error("Error enrolling in course:", error);
    });
};




