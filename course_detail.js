const getQueryParams = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const getCourseDetail = () => {
  const courseId = getQueryParams("id");
  const userType = localStorage.getItem("user_type");

  fetch(`https://enlighten-institute-deployment.vercel.app/api/course/courselist/${courseId}`)
    .then((res) => res.json())
    .then((course) => {
      console.log(course);
      const courseDetail = document.getElementById("course-detail");
      const div = document.createElement("div");
      const imageUrl = course.image_url ? course.image_url : "images/default.jpg";
      
      div.innerHTML = `
          <div class="card m-5 mx-auto">
            <img src="${imageUrl}" class="card-img-top custom-card-img" alt="Course Image">
            <div class="card-body">
              <h1 class="card-title">Course Name: ${course.course_name}</h1>
              <h5 class="card-text">Course Code: ${course.course_code}</h5>
              <p class="card-text">Description: ${course.description}</p>
              <p class="card-text">Teacher: <small><strong>${course.teacher_name}</strong></small></p>
              <p class="card-text">Department: ${course.department_name}</p>
              <p class="card-text">Price: ${course.price}</p>
              <p class="card-text">Time: <small><strong>${formatDate(course.created_at)}</strong></small></p>
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
                  : ``
              }
            </div>
          </div>
        `;
      courseDetail.appendChild(div);

      // Set data into modal, including the price field
      document.getElementById("edit_course_name").value = course.course_name;
      document.getElementById("edit_course_code").value = course.course_code;
      document.getElementById("editDescription").value = course.description;
      document.getElementById("edit_price").value = course.price; // Populate the price field
    });

  toggleButtons(userType);
};


document.addEventListener("DOMContentLoaded", function () {
  const courseId = getQueryParams("id");
  const reviewForm = document.getElementById("review-form");

  // Fetch and display reviews
  fetch("https://enlighten-institute-deployment.vercel.app/api/course/reviews/")
    .then((response) => response.json())
    .then((data) => {
      const reviewsContainer = document.getElementById("reviews");
      console.log(data);
      reviewsContainer.innerHTML = "";
      data.forEach((review) => {
        if (review.course === parseInt(courseId)) {
          const reviewCard = createReviewCard(review);
          reviewsContainer.appendChild(reviewCard);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching reviews:", error);
    });

  // Handle review submission
  reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;
    const reviewsUrl =
      "https://enlighten-institute-deployment.vercel.app/api/course/reviews/"; // Ensure you have the correct URL

    fetch(reviewsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        course: courseId,
        rating: rating,
        comment: comment,
      }),
    })
      .then((response) => response.json())
      .then((review) => {
        const reviewCard = createReviewCard(review);
        document.getElementById("reviews").appendChild(reviewCard);
        reviewForm.reset();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});

// Create a review card
function createReviewCard(review) {
  const userId = localStorage.getItem("user_id");
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.setAttribute("data-review-id", review.id);  // Add review ID attribute

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const rating = document.createElement("h5");
  rating.className = "card-title";
  rating.textContent = `Rating: ${review.rating}/5`;
  

  const comment = document.createElement("p");
  comment.className = "card-text";
  comment.textContent = review.comment;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const username = document.createElement("span");
  username.textContent = `Reviewed by: ${review.user.username} \n Email: ${review.user.email}`;
  footer.appendChild(username);

  if (review.user.id === parseInt(userId)) {
    document.getElementById("review-from-section").style.display = "none";
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "btn btn-secondary btn-sm m-3";
    editButton.onclick = () => openEditModal(review);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "btn btn-danger btn-sm m-3";
    deleteButton.onclick = () => deleteReview(review.id);

    footer.appendChild(editButton);
    footer.appendChild(deleteButton);
  }

  cardBody.appendChild(rating);
  cardBody.appendChild(comment);
  card.appendChild(cardBody);
  card.appendChild(footer);

  return card;
}


// Function to open the edit modal and populate fields with existing data
function openEditModal(review) {
  // Populate the modal fields with existing review data
  document.getElementById("rating").value = review.rating; // Set existing rating
  document.getElementById("editReviewText").value = review.comment; // Set existing review text

  // Set the reviewId globally or in the modal's data attribute
  document
    .getElementById("editReviewModal")
    .setAttribute("data-review-id", review.id);

  // Show the modal
  const editModal = new bootstrap.Modal(
    document.getElementById("editReviewModal")
  );
  editModal.show();
}

// Function to submit the updated review
function submitEditedReview() {
  const reviewId = document.getElementById("editReviewModal").getAttribute("data-review-id");
  const courseId = getQueryParams("id");
  const updatedReviewText = document.getElementById("editReviewText").value;
  const updatedRating = document.getElementById("rating").value;

  fetch("https://enlighten-institute-deployment.vercel.app/api/custom/user/", {
      headers: {
          "Authorization": `Token ${localStorage.getItem("authToken")}`
      }
  })
  .then((response) => {
      if (!response.ok) {
          throw new Error("Failed to fetch user information.");
      }
      return response.json();
  })
  .then((userData) => {
      const updatedData = {
          course: parseInt(courseId),
          rating: parseInt(updatedRating),
          comment: updatedReviewText,
          user: {
              id: userData.id,
              username: userData.username,
              email: userData.email
          }
      };

      return fetch(`https://enlighten-institute-deployment.vercel.app/api/course/reviews/${reviewId}/`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify(updatedData)
      });
  })
  .then((response) => {
      if (!response.ok) {
          throw new Error("Failed to update review. Please check the input values.");
      }
      return response.json();
  })
  .then((data) => {
      // Locate the review card to update
      const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`);
      
      if (reviewCard) {
          // Update the review card's rating and comment
          const ratingElement = reviewCard.querySelector(".card-title");
          const commentElement = reviewCard.querySelector(".card-text");

          if (ratingElement) ratingElement.textContent = `Rating: ${updatedRating}/5`;
          if (commentElement) commentElement.textContent = updatedReviewText;
      }

      const editModal = bootstrap.Modal.getInstance(document.getElementById("editReviewModal"));
      editModal.hide();
  })
  .catch((error) => {
      console.error("Error updating the review:", error);
      alert("Failed to update the review. Please try again.");
  });
}



function deleteReview(reviewId) {
  if (confirm("Are you sure you want to delete this review?")) {
      // Send the DELETE request to the API
      fetch(`https://enlighten-institute-deployment.vercel.app/api/course/reviews/${reviewId}/`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Token ${localStorage.getItem("authToken")}`  // Ensure the token is valid and correct
          }
      })
      .then(response => {
          if (response.status === 204) {
              // Success: remove the review element from the UI
              document.querySelector(`#review-${reviewId}`).remove();
              alert('Review deleted successfully.'); // Optional feedback
              
              // Redirect after a short delay
              setTimeout(() => {
                  window.location.href = `./course_detail.html?id=${courseId}`;
              }, 1000); // 1 second delay
          } else if (response.status === 403) {
              alert('You do not have permission to delete this review.');
          } else {
              alert('Failed to delete review.');
          }
      })
      .catch(error => {
          console.error('Error deleting the review:', error);
          window.location.href = `./course_detail.html?id=${courseId}`;
      });
  }
}



const isCourseEnrolled = (courseId) => {
  return localStorage.getItem(`course_enrolled_${courseId}`) === "true";
};

const toggleButtons = (userType) => {
  const courseId = getQueryParams("id");
  const control = document.getElementById("controls");
  const courseProgress = document.getElementById("course-progress");
  document.getElementById("result-container").style.display = "none";

  if (userType === "student") {
    document.getElementById("enrolled_student").style.display = "none";
    if (isCourseEnrolled(courseId)) {
      courseProgress.style.display = "block";
      document.getElementById("result-container").style.display = "block";
    } else {
      courseProgress.style.display = "none";
    }
  } else if (userType === "teacher") {
    control.style.display = "block";
    courseProgress.style.display = "none";
  } else {
    control.style.display = "none";
    courseProgress.style.display = "none";
  }
};

// Function to retrieve user type from localStorage
const getUserType = () => {
  return localStorage.getItem("user_type");
};

const editCourse = async (event) => {
  event.preventDefault();
  const courseId = getQueryParams("id"); // Retrieve the course ID from the URL or query parameters

  const form = document.getElementById("edit-course");
  const formData = new FormData(form);
  const token = localStorage.getItem("authToken");

  // Upload the image to Imgbb if a new image is provided
  const imageFile = formData.get("edit_image");
  let imageUrl = "";

  if (imageFile && imageFile.size > 0) {
    const imgFormData = new FormData();
    imgFormData.append("image", imageFile);

    try {
      const imgbbResponse = await fetch(
        "https://api.imgbb.com/1/upload?key=74a46b9f674cfe097a70c2c8824668a7",
        {
          method: "POST",
          body: imgFormData,
        }
      );

      const imgbbData = await imgbbResponse.json();

      if (imgbbData.status === 200) {
        imageUrl = imgbbData.data.url; // Store the image URL
      } else {
        alert("Image upload failed!");
        return;
      }
    } catch (error) {
      console.error("Error uploading to Imgbb:", error);
      alert("Image upload failed!");
      return;
    }
  }

  // Prepare the data to be sent to the backend
  const courseData = {
    course_name: formData.get("edit_course_name"),
    course_code: formData.get("edit_course_code"),
    description: formData.get("editDescription"),
    price: parseFloat(formData.get("edit_price")), // Include and parse price
    image_url: imageUrl || undefined, // Include image_url if present
  };

  // Send the PUT request to update the course
  try {
    const response = await fetch(
      `https://enlighten-institute-deployment.vercel.app/api/course/courselist/${courseId}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(courseData), // Send the course data as JSON
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      $("#editModal").modal("hide"); // Close the modal after success
      alert("Course updated successfully!");
    } else {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      alert("Failed to update course!");
    }
  } catch (error) {
    console.error("Error updating course:", error);
    alert("Failed to update course!");
  }
};

const deleteCourse = () => {
  const courseId = getQueryParams("id");
  const token = localStorage.getItem("authToken");
  fetch(
    `https://enlighten-institute-deployment.vercel.app/api/course/courselist/${courseId}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  )
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
  fetch(
    `https://enlighten-institute-deployment.vercel.app/api/course/${courseId}/lessons/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(formData),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("Lesson added Successfully", data);
      window.location.href = `./course_detail.html?id=${courseId}`;
    });
};

const createLessonCard = (lesson, userType, courseId, isCompleted) => {
  const div = document.createElement("div");
  const isenrolled = isCourseEnrolled(courseId);
  div.className = "card m-5 mx-auto";

  // Function to truncate the content to 15 words
  const truncateContent = (content, wordLimit) => {
    const words = content.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : content;
  };

  // Truncate lesson content to 15 words
  const truncatedContent = truncateContent(lesson.content, 15);

  let cardContent = `
    <div class="card-body">
      <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
      <p class="card-text">Time: <small><strong>${formatDate(
        lesson.created_at
      )}</strong></small></p>
      ${
        isCompleted
          ? `
        <h5 class="card-text">Lesson Content: ${truncatedContent}</h5>
        <button class="btn btn-primary mt-3" disabled>Completed</button>
        <div class="button-center" id="lesson-details-btn">
          <a href="lesson_details.html?lessonId=${lesson.id}&courseId=${courseId}" class="btn btn-primary">Details</a>
        </div>
      `
          : `
        <h5 class="card-text">Lesson Content: ${truncatedContent}</h5>
        <div class="button-center" id="lesson-details-btn">
          <a href="lesson_details.html?lessonId=${lesson.id}&courseId=${courseId}" class="btn btn-primary">Details</a>
        </div>
      `
      }
      <br>
      
  `;

  if (userType === "teacher") {
    cardContent += `
      <div class="dropdown text-center">
        <button class="btn btn-secondary dropdown-toggle m-4" type="button" id="dropdownMenuButton_${lesson.id}" data-bs-toggle="dropdown" aria-expanded="false">
          Menu
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton_${lesson.id}">
          <a href="lesson_details.html?lessonId=${lesson.id}&courseId=${courseId}" class="dropdown-item">Details</a>
          <a href="editlesson.html?lessonId=${lesson.id}&courseId=${courseId}" class="dropdown-item">Edit</a>
          <button class="dropdown-item" onclick="deleteLesson(${lesson.id})">Delete</button>
        </ul>
      </div>
    `;
  } else if (isenrolled) {
    if (!isCompleted) {
      cardContent += `
      <form id="progressForm_${lesson.id}" onsubmit="submitProgress(event, ${lesson.id})">
        <input type="hidden" name="lesson_id" value="${lesson.id}">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" name="completed" id="completed_${lesson.id}">
          <label class="form-check-label" for="completed_${lesson.id}">Completed</label>
        </div>
        <button type="submit" class="btn btn-primary mt-3">Submit Progress</button>
      </form>
    `;
    }
  }

  cardContent += `</div>`;
  div.innerHTML = cardContent;

  return div;
};

const getLessons = () => {
  const courseId = getQueryParams("id");
  const studentId = localStorage.getItem("user_id");
  const userType = localStorage.getItem("user_type");
  localStorage.removeItem("enrolledId");
  const enrolled = fetchEnrollmentId(studentId, courseId);

  let url = `https://enlighten-institute-deployment.vercel.app/api/course/courselessons/${courseId}`;
  let headers = {};

  if (enrolled) {
    headers = { Authorization: `Token ${localStorage.getItem("authToken")}` };
  } else {
    url = `https://enlighten-institute-deployment.vercel.app/api/course/${courseId}/lessons/`; // Alternate endpoint for non-enrolled users
  }

  fetch(url, { headers })
    .then((res) => res.json())
    .then((lessons) => {
      console.log(lessons);
      const lessonContainer = document.getElementById("lessons");
      lessonContainer.innerHTML = "";

      if (lessons.length === 0) {
        // If there are no lessons, display a message
        lessonContainer.innerHTML = `<p class = "text-danger text-center">No lessons have been added yet. Please check back later.</p>`;
      } else {
        lessons.forEach((lesson) => {
          const isCompleted =
            localStorage.getItem(`lesson_completed_${lesson.id}`) === "true";
          const lessonCard = createLessonCard(
            lesson,
            userType,
            courseId,
            isCompleted
          );
          lessonContainer.appendChild(lessonCard);
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

  fetch(
    `https://enlighten-institute-deployment.vercel.app/api/course/lesson/${lessonID}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  )
    .then(() => {
      alert("Lesson deleted successfully!");
      window.location.href = `course_detail.html?id=${courseId}`;
    })
    .catch((err) => {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    });
};


// Function to handle the Stripe payment process
const processPayment = () => {
  const token = localStorage.getItem("authToken");
  const courseId = getQueryParams("id");
  const studentId = localStorage.getItem("user_id");

  fetch("https://enlighten-institute-deployment.vercel.app/create-checkout-session/", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ 
          course_id: courseId,
          student_id: studentId 
      }),
  })
  .then((response) => {
      if (!response.ok) {
          throw new Error("Failed to create checkout session.");
      }
      return response.json();
  })
  .then((data) => {
      // Redirect to Stripe Checkout
      return stripe.redirectToCheckout({ sessionId: data.id });
  })
  .then((result) => {
      if (result.error) {
          console.error(result.error.message);
          alert("Error: " + result.error.message);
      } else {
          // Upon successful redirect, save status in localStorage
          localStorage.setItem(`payment_completed_${courseId}`, true);
          toggleEnrollPaymentButtonVisibility(); // Update button visibility
      }
  })
  .catch((error) => {
      console.error("Error during payment process:", error);
      alert("Payment failed: " + error.message);
  });
};

// Function to handle the enrollment after successful payment
const enrollStudent = () => {
  const token = localStorage.getItem("authToken");
  const courseId = getQueryParams("id");
  const studentId = localStorage.getItem("user_id");

  fetch("https://enlighten-institute-deployment.vercel.app/api/enrollment/enroll/", {
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



const fetchCourseResults = async () => {
  try {
    const response = await fetch(
      `https://enlighten-institute-deployment.vercel.app/api/enrollment/course-results/`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`, // Add your authorization token if needed
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching course results:", error);
    return [];
  }
};

// Get result based on enrollment ID
const getResult = async (enrolledId) => {
  const results = await fetchCourseResults();
  console.log(results);
  const result = results.find(
    (result) => Number(result.enrollment) === Number(enrolledId)
  );
  return result
    ? { resultId: result.id, marks: result.marks, feedback: result.feedback }
    : { resultId: "N/A", marks: "N/A", feedback: "N/A" };
};

const fetchEnrollmentId = (studentId, courseId) => {
  const token = localStorage.getItem("authToken");
  console.log(courseId);

  fetch(
    `https://enlighten-institute-deployment.vercel.app/api/enrollment/student/${studentId}/course/${courseId}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`, // If your API requires token authentication
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((enrollment) => {
      if (enrollment.id) {
        localStorage.setItem("enrolledId", enrollment.id);
        // You can do something with the enrollment ID here
      } else {
        localStorage.setItem("enrolledId", enrollment.id);
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

const showResult = async () => {
  const courseId = getQueryParams("id");
  const studentId = localStorage.getItem("user_id");
  fetchEnrollmentId(studentId, courseId);
  const enrolledId = localStorage.getItem("enrolledId");
  if (!enrolledId) {
    console.error("No enrolled ID found in local storage.");
    return;
  }

  const result = await getResult(enrolledId);
  const resultcon = document.getElementById("result-con");

  if (!resultcon) {
    console.error("Element with ID 'result-con' not found.");
    return;
  }

  const div = document.createElement("div");
  div.innerHTML = `
    <h1 class="text-center">Result</h1>
    <p class = "h4">Marks: ${result.marks}</p>
    <p class = "h4">Feedback: ${result.feedback}</p>
  `;
  resultcon.appendChild(div);
};

// Call the showResult function to display the results
showResult();

// Populate enrolled students list and their results
const enrolledStudentList = async () => {
  const courseId = getQueryParams("id");
  const userType = localStorage.getItem("user_type");

  try {
    const response = await fetch(
      `https://enlighten-institute-deployment.vercel.app/api/enrollment/students/${courseId}/`
    );
    const data = await response.json();
    console.log(data); // This will log the enrolled students data
    const enrolledStudentsList = document.getElementById(
      "enrolled-students-list"
    );

    // Clear any existing rows
    enrolledStudentsList.innerHTML = "";

    if (data.length === 0) {
      enrolledStudentsList.innerHTML =
        "<tr><td colspan='7' class='text-center text-danger h4'>No students enrolled yet</td></tr>";
      return; // Exit the function early as there's no data to process
    }

    for (const enrollment of data) {
      const student = enrollment.student;
      const result = await getResult(enrollment.id);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.username}</td>
        <td>${student.email}</td>
        <td>${student.first_name}</td>
        <td>${student.last_name}</td>
        <td>${new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
        <td id="result-${enrollment.id}">
          Marks: ${result.marks}<br>
          Feedback: ${result.feedback}
        </td>
        <td>
          ${
            userType === "teacher"
              ? `<div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton-${enrollment.id}" data-bs-toggle="dropdown" aria-expanded="false">
              Actions
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${enrollment.id}">
              <li><a class="dropdown-item" href="submit_result.html?enrollmentId=${enrollment.id}&courseId=${courseId}">Submit Result</a></li>
              <li><a class="dropdown-item" href="submit_result.html?enrollmentId=${enrollment.id}&courseId=${courseId}&edit=true">Edit Result</a></li>
            </ul>
          </div>
              `
              : ""
          }
        </td>
      `;
      enrolledStudentsList.appendChild(row);
    }
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
  }
};

// Submit results for a student

const populateForm = async () => {
  const enrollmentId = getQueryParams("enrollmentId");
  console.log(enrollmentId);
  const isEdit = getQueryParams("edit") === "true";

  if (isEdit) {
    document.getElementById("formTitle").innerText = "Edit Result";
    const result = await getResult(enrollmentId);
    console.log(result);
    document.getElementById("marks").value = result.marks;
    document.getElementById("feedback").value = result.feedback;
  }
};

const submitResult = async (event) => {
  event.preventDefault(); // Prevent the default form submission
  const enrollmentId = getQueryParams("enrollmentId");
  const courseId = getQueryParams("courseId");
  const marks = document.getElementById("marks").value;
  const feedback = document.getElementById("feedback").value;
  const isEdit = getQueryParams("edit") === "true";
  const resultId = await getResult(enrollmentId);

  if (marks && feedback) {
    const url = isEdit
      ? `https://enlighten-institute-deployment.vercel.app/api/enrollment/edit-course-results/${resultId.resultId}/`
      : `https://enlighten-institute-deployment.vercel.app/api/enrollment/course-results/`;
    const method = isEdit ? "PUT" : "POST";

    // Perform the fetch request
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        enrollment: enrollmentId,
        marks: marks,
        feedback: feedback,
      }),
    });

    // Redirect on successful response
    if (response.ok) {
      window.location.href = `course_detail.html?id=${courseId}`;
    }
  }
};

const submitProgress = (event, lessonId) => {
  event.preventDefault();
  const courseId = getQueryParams("id");
  const form = document.getElementById(`progressForm_${lessonId}`);
  const completed = form.querySelector(`#completed_${lessonId}`).checked;
  const token = localStorage.getItem("authToken");

  const data = {
    lesson: lessonId,
    completed: completed,
    student: localStorage.getItem("user_id"),
  };

  fetch(
    "https://enlighten-institute-deployment.vercel.app/api/course/lessonprogress/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      // Corrected the localStorage key to include an underscore
      localStorage.setItem(`lesson_completed_${lessonId}`, true);
      window.location.href = `./course_detail.html?id=${courseId}`;
    })
    .catch((error) => {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    });
};

const fetchCompletedLessons = () => {
  const token = localStorage.getItem("authToken");
  const courseId = getQueryParams("id");

  fetch(
    `https://enlighten-institute-deployment.vercel.app/api/course/courselessons/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  )
    .then((res) => res.json())
    .then((lessons) => {
      console.log(lessons);
      lessons.forEach((lesson) => {
        localStorage.setItem(`lesson_completed_${lesson.id}`, lesson.completed);
      });
    })
    .catch((error) => {
      console.error("Error Fetching", error);
    });
};

fetchCompletedLessons();

const showCourseProgress = () => {
  const courseId = getQueryParams("id");
  console.log(courseId);
  const enrolled = localStorage.getItem(`course_enrolled_${courseId}`);
  console.log(enrolled);

  if (enrolled === "true") {
    fetch(
      `https://enlighten-institute-deployment.vercel.app/api/course/course_progress/${courseId}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch course progress.");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        const progressContainer = document.getElementById("course-progress");

        progressContainer.innerHTML = `
            <h1 class="text-center">Course Progress</h1>
            <p class="h4">Course Name: <small>${data.course_name}</small></p>
            <p class="h4">Progress: <small>${data.progress}%</small></p>
          `;

        if (getUserType() === "teacher") {
          progressContainer.style.display = "none";
        } else {
          progressContainer.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error fetching course progress:", error);
        alert(error.message);
      });
  }
};

showCourseProgress();

// Call the function to initialize the list
enrolledStudentList();
