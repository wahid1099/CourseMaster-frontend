import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:5000/api";

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json({
      success: true,
      token: "mock-jwt-token",
      user: {
        _id: "507f1f77bcf86cd799439011",
        id: "507f1f77bcf86cd799439011",
        name: body.name,
        email: body.email,
        role: body.role || "student",
      },
    });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (
      body.email === "student@example.com" &&
      body.password === "password123"
    ) {
      return HttpResponse.json({
        success: true,
        token: "mock-jwt-token",
        user: {
          _id: "507f1f77bcf86cd799439011",
          id: "507f1f77bcf86cd799439011",
          name: "Test Student",
          email: "student@example.com",
          role: "student",
        },
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      user: {
        _id: "507f1f77bcf86cd799439011",
        id: "507f1f77bcf86cd799439011",
        name: "Test Student",
        email: "student@example.com",
        role: "student",
      },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  }),

  // Course endpoints
  http.get(`${API_URL}/courses`, () => {
    return HttpResponse.json({
      success: true,
      courses: [
        {
          _id: "507f1f77bcf86cd799439020",
          title: "Introduction to JavaScript",
          description: "Learn JavaScript from scratch",
          instructor: "John Doe",
          price: 99.99,
          category: "Programming",
          thumbnail: "https://example.com/thumbnail.jpg",
        },
      ],
    });
  }),

  http.get(`${API_URL}/courses/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      course: {
        _id: params.id,
        title: "Introduction to JavaScript",
        description: "Learn JavaScript from scratch",
        instructor: "John Doe",
        price: 99.99,
        category: "Programming",
        modules: [
          {
            title: "Getting Started",
            description: "Introduction",
            order: 1,
            lessons: [
              {
                title: "Welcome",
                videoUrl: "https://example.com/video1.mp4",
                duration: 10,
                order: 1,
              },
            ],
          },
        ],
      },
    });
  }),

  // Quiz endpoints
  http.get(`${API_URL}/quizzes/course/:courseId`, () => {
    return HttpResponse.json({
      success: true,
      quizzes: [
        {
          _id: "507f1f77bcf86cd799439030",
          title: "JavaScript Basics Quiz",
          moduleIndex: 0,
          passingScore: 70,
        },
      ],
    });
  }),

  http.get(`${API_URL}/quizzes/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      quiz: {
        _id: params.id,
        title: "JavaScript Basics Quiz",
        questions: [
          {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
          },
        ],
        passingScore: 70,
      },
    });
  }),

  http.post(`${API_URL}/quizzes/:id/submit`, () => {
    return HttpResponse.json({
      success: true,
      result: {
        score: 1,
        totalPoints: 1,
        percentage: 100,
        passed: true,
      },
    });
  }),

  // Enrollment endpoints
  http.post(`${API_URL}/enrollments`, async ({ request }) => {
    const body = (await request.json()) as any;

    return HttpResponse.json({
      success: true,
      enrollment: {
        _id: "507f1f77bcf86cd799439040",
        student: "507f1f77bcf86cd799439011",
        course: body.courseId,
        enrolledAt: new Date(),
      },
    });
  }),

  http.get(`${API_URL}/enrollments/my`, () => {
    return HttpResponse.json({
      success: true,
      enrollments: [
        {
          _id: "507f1f77bcf86cd799439040",
          course: {
            _id: "507f1f77bcf86cd799439020",
            title: "Introduction to JavaScript",
            thumbnail: "https://example.com/thumbnail.jpg",
          },
          progress: 25,
        },
      ],
    });
  }),
];
