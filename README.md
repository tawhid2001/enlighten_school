# Enlighten School

Enlighten School is an e-learning platform built using Django and Django REST Framework (DRF). The platform allows students to enroll in courses, track their progress, and interact with teachers. Teachers can create courses, track student progress, and manage lesson content.

## Features
- User authentication (students and teachers)
- Course and lesson management
- Track lesson progress for students
- Teachers can create and update course materials
- REST API for course enrollment and progress tracking

## Technologies
- Python (Django, DRF)
- HTML, CSS, JavaScript

## Live Demo
You can access the live backend of Enlighten School at: [Enlighten School Live](https://enlighten-institute.onrender.com/)

## GitHub Repository
You can find the backend repository for Enlighten School at: [Enlighten Institute GitHub Repository](https://github.com/tawhid2001/Enlighten_Institute)

## Important URLs

### Authentication
- **Login**: `POST /api/auth/login/`
- **Registration**: `POST /api/auth/registration/`
- **Account Confirmation**: `GET /api/auth/registration/account_confirm_email/<str:key>/`

### Courses
- **Course List**: `GET /api/course/courselist/`
- **Course Detail**: `GET /api/course/courselist/<int:pk>/`
- **Enroll in Course**: `POST /api/enrollment/enroll/`

### Lessons
- **Lesson List (for a specific course)**: `GET /api/course/<int:course_id>/lessons/`
- **Lesson Detail**: `GET /api/course/lesson/<int:pk>/`
- **Lesson Progress**: `GET /api/lessonprogress/`

### Student Progress
- **Course Progress**: `GET /api/course_progress/<int:course_id>/`
- **My Enrollments**: `GET /api/my-enrollments/`
- **Enrolled Students in Course**: `GET /api/students/<int:course_id>/`

## How to Run
1. Clone the repository.
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start the server: `python manage.py runserver`
