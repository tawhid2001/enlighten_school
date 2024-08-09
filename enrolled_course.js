const courseDetailinfo = (courseId) => {
    return fetch(`http://127.0.0.1:8000/api/course/courselist/${courseId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch course detail.");
        }
        return res.json();
      })
      .then((course) => {
        return [course.course_name, course.course_code];
      });
  };
  

  const enrolledCourses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://127.0.0.1:8000/api/enrollment/list/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch enrolled courses.");
      }
  
      const courses = await response.json();
      const allCourses = document.getElementById("all-enrolled-courses");
      allCourses.innerHTML = ""; // Clear previous content if needed
  
      if (courses.length === 0) {
        const noCoursesMessage = document.createElement("p");
        noCoursesMessage.className = "h1 text-danger text-center";
        noCoursesMessage.textContent = "No courses enrolled.";
        allCourses.appendChild(noCoursesMessage);
      } else {
        for (const enrolled of courses) {
          try {
            const courseInfo = await courseDetailinfo(enrolled.course);
            const div = document.createElement("div");
            div.classList.add("col-sm-6");
            div.innerHTML = `
              <div class="card">
                <div class="card-body">
                <div id="course-progress"></div>
                  <h3 class="card-title" onclick="fetchLessons(${enrolled.course})">Course Name: ${courseInfo[0]}</h3>
                  <h5 class="card-text">Course Code: ${courseInfo[1]}</h5>
                  <p class="card-text">Enrolled At: ${formatDate(enrolled.enrolled_at)}</p>
                  <div class="d-flex justify-content-evenly">
                    <p ><a class="btn btn-primary detail-btn"href="./course_detail.html?id=${enrolled.course}">Details</a></p>
                    <p class="btn btn-danger" onclick="disenroll(${enrolled.id}, ${enrolled.course})">Disenroll</p>
                  </div>
                </div>
              </div>`;
            allCourses.appendChild(div);
          } catch (error) {
            console.error("Error fetching course detail:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const fetchEnrollments = () => {
    const token = localStorage.getItem('authToken');
  
    fetch('http://127.0.0.1:8000/api/enrollment/list/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
    .then(response => response.json())
    .then(enrollments => {
      enrollments.forEach(enrollment => {
        
        localStorage.setItem(`course_enrolled_${enrollment.course}`, 'true');
      });
    })
    .catch(error => {
      console.error('Error fetching enrollments:', error);
    });
  };

  fetchEnrollments();

  const disenroll = (enrollmentId, courseId) => {
    const token = localStorage.getItem("authToken");
  
    fetch(`http://127.0.0.1:8000/api/enrollment/list/${enrollmentId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to disenroll from the course.");
        }
        localStorage.removeItem(`course_enrolled_${courseId}`);
        enrolledCourses(); 
      })
      .catch((error) => {
        console.error("Error disenrolling from course:", error);
        alert("Failed to disenroll from the course.");
      });
  };


