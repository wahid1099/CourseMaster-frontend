import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "../../../components/auth/Register";
import { renderWithProviders } from "../../utils/testUtils";

// Mock the authSlice actions
vi.mock("../../../store/slices/authSlice", async () => {
  const actual = await vi.importActual("../../../store/slices/authSlice");
  return {
    ...actual,
    register: vi.fn((data) => ({
      type: "auth/register",
      payload: data,
    })),
    clearError: vi.fn(() => ({ type: "auth/clearError" })),
  };
});

describe("Register Component", () => {
  it("should render registration form", () => {
    renderWithProviders(<Register />);

    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your full name/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("should update form fields on input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const nameInput = screen.getByPlaceholderText(/enter your full name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should have role selector with student as default", () => {
    renderWithProviders(<Register />);

    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    expect(roleSelect).toHaveValue("student");
    expect(
      screen.getByRole("option", { name: /student/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /admin/i })).toBeInTheDocument();
  });

  it("should show admin key field when admin role is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const roleSelect = screen.getByRole("combobox", { name: /role/i });

    // Admin key field should not be visible initially
    expect(
      screen.queryByPlaceholderText(/enter admin key/i)
    ).not.toBeInTheDocument();

    // Select admin role
    await user.selectOptions(roleSelect, "admin");

    // Admin key field should now be visible
    expect(screen.getByPlaceholderText(/enter admin key/i)).toBeInTheDocument();
  });

  it("should hide admin key field when student role is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const roleSelect = screen.getByRole("combobox", { name: /role/i });

    // Select admin first
    await user.selectOptions(roleSelect, "admin");
    expect(screen.getByPlaceholderText(/enter admin key/i)).toBeInTheDocument();

    // Switch back to student
    await user.selectOptions(roleSelect, "student");
    expect(
      screen.queryByPlaceholderText(/enter admin key/i)
    ).not.toBeInTheDocument();
  });

  it("should display error message when registration fails", () => {
    renderWithProviders(<Register />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Email already exists",
        },
      },
    });

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    renderWithProviders(<Register />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: true,
          error: null,
        },
      },
    });

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /creating account/i })
    ).toBeDisabled();
  });

  it("should have link to login page", () => {
    renderWithProviders(<Register />);

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should require all fields for student registration", () => {
    renderWithProviders(<Register />);

    const nameInput = screen.getByPlaceholderText(/enter your full name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("should enforce minimum password length", () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute("minLength", "6");
  });

  it("should have correct input types", () => {
    renderWithProviders(<Register />);

    const nameInput = screen.getByPlaceholderText(/enter your full name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    expect(nameInput).toHaveAttribute("type", "text");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
