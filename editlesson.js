const getQueryParams = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };
  
  const getLessonDetail = () => {
    const courseId = getQueryParams("courseId");
    const lessonId = getQueryParams("lessonId");
    const token = localStorage.getItem("authToken");
  
    fetch(`http://127.0.0.1:8000/api/course/lesson/${lessonId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((lesson) => {
        console.log(lesson);
      if (lesson) {
        document.getElementById("edit_title").value = lesson.title;
        document.getElementById("edit_content").value = lesson.content;
      } else {
        console.error(`Lesson with id ${lessonId} not found.`);
        alert("Lesson not found.");
      }
      })
      .catch((error) => {
        console.error("Error fetching lesson details:", error);
        alert("Failed to fetch lesson details.");
      });
  };


  const editLesson = (event) => {
  event.preventDefault();
  const lessonId = getQueryParams("lessonId");
  const courseId = getQueryParams("courseId");
  console.log(lessonId);
  console.log(courseId);
  const form = document.getElementById("edit-lesson");
  const formData = new FormData(form);
  const token = localStorage.getItem("authToken");

  const editLessonData = {
    title: formData.get("edit_title"),
    content: formData.get("edit_content"),
    course : courseId,
  };

  fetch(`http://127.0.0.1:8000/api/course/lesson/${lessonId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(editLessonData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      window.location.href = `course_detail.html?id=${courseId}`;
    })
    .catch((error) => {
      console.error("Error updating lesson:", error);
      alert("Failed to update lesson.");
    });
};


  

  