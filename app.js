const getUserDetails = () => {
  const token = localStorage.getItem("authToken");
  fetch("https://enlighten-institute-deployment.vercel.app//api/custom/user/", {
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

  // Log all form data for debugging
  for (let [key, value] of formData.entries()) {
      console.log(key, value);
  }

  // Upload the image to ImgBB first if it's provided
  const imageFile = formData.get('image');
  console.log('Image file:', imageFile); // Log the image file input
  let imageUrl = '';

  if (imageFile && imageFile.size > 0) { // Ensure that the file has a size greater than 0
      const imgFormData = new FormData();
      imgFormData.append('image', imageFile);

      fetch('https://api.imgbb.com/1/upload?key=74a46b9f674cfe097a70c2c8824668a7', {
          method: 'POST',
          body: imgFormData
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Image upload failed');
          }
          return response.json();
      })
      .then(imgbbData => {
          console.log('Image upload response:', imgbbData); // Log the response
          if (imgbbData.status === 200) {
              imageUrl = imgbbData.data.url; // Capture the image URL
              proceedToAddCourse(); // Proceed to add course after image upload
          } else {
              console.error('Image upload failed with status:', imgbbData.status);
              proceedToAddCourse(); // Proceed even if image upload failed
          }
      })
      .catch(error => {
          console.error('Error uploading to Imgbb:', error);
          proceedToAddCourse(); // Proceed even if an error occurs during image upload
      });
  } else {
      console.log('No image file provided, proceeding to add course directly.');
      proceedToAddCourse(); // No image, proceed to add course directly
  }

  function proceedToAddCourse() {
      // Generate slug from the course name
      const courseName = formData.get("course_name");
      const slug = courseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      // Prepare the data to be sent to the backend
      const courseData = {
          course_name: formData.get("course_name"),
          course_code: formData.get("course_code"),
          description: formData.get("description"),
          image_url: imageUrl || undefined,  // Use the URL from Imgbb if available
          department: formData.get("department"),
          slug: slug
      };

      const token = localStorage.getItem("authToken");

      fetch("https://enlighten-institute-deployment.vercel.app//api/course/courselist/", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${token}`
          },
          body: JSON.stringify(courseData) // Convert data to JSON
      })
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              return response.json().then(errorData => {
                  throw new Error(errorData.detail || 'Failed to add course!');
              });
          }
      })
      .then(data => {
          console.log('Course added successfully:', data);
          form.reset(); // Reset the form inputs, including file input
          window.location.href = "./index.html"; // Redirect on success
      })
      .catch(error => {
          console.error('Error adding course:', error);
          alert('Failed to add course: ' + error.message);
      });
  }
};







const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};



const loadCourses = () => {
  const token = localStorage.getItem('authToken');
  
  fetch("https://enlighten-institute-deployment.vercel.app//api/course/courselist/", {
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
        console.log(course.image_url);
        const imageUrl = course.image_url ? course.image_url : 'images/default.jpg';
        div.innerHTML = `
          <div class="card">
            <img src="${imageUrl}" class="card-img-top custom-img" alt="Course Image">
            <div class="card-body p-4">
              <h3 class="card-title">Course Name: ${course.course_name}</h3>
              <h5 class="card-text">Course Code: ${course.course_code}</h5>
              <p class="card-text">Time: ${formatDate(course.created_at)}</p>
              <p class="card-text">Price: ${course.price}</p>
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
