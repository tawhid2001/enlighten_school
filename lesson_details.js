const getQueryParams = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const getLessonDetail = () => {
  const lessonID = getQueryParams("lessonId");

  fetch(`https://enlighten-institute.onrender.com/api/course/lesson/${lessonID}`, {
    method: 'GET', // Ensure method is specified
    headers: {
      Authorization: `Token ${localStorage.getItem("authToken")}`,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((lesson) => {
      console.log(lesson);
      const lessonContainer = document.getElementById("lessons-con");
      lessonContainer.innerHTML = "";
      const div = document.createElement("div");
      div.className = "card m-5 mx-auto";
      div.innerHTML = `
            <div class="card-body">
              <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
              <h5 class="card-text" style="white-space: pre-wrap;">Lesson Content: ${lesson.content}</h5>
              <p class="card-text">Time: <small><strong>${formatDate(
                lesson.created_at
              )}</strong></small></p>
            </div>
          `;
      lessonContainer.appendChild(div);
    })
    .catch((error) => {
      console.error("Error fetching lessons:", error);
    });
};

getLessonDetail();
