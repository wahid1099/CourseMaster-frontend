import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../../../components/auth/Login";
import { renderWithProviders } from "../../utils/testUtils";

// Mock the authSlice actions
vi.mock("../../../store/slices/authSlice", async () => {
  const actual = await vi.importActual("../../../store/slices/authSlice");
  return {
    ...actual,
    login: vi.fn((credentials) => ({
      type: "auth/login",
      payload: credentials,
    })),
    clearError: vi.fn(() => ({ type: "auth/clearError" })),
  };
});

describe("Login Component", () => {
  it("should render login form", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should update form fields on input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should display error message when login fails", () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Invalid credentials",
        },
      },
    });

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("should show loading state during submission", () => {
    renderWithProviders(<Login />, {
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

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  });

  it("should have link to register page", () => {
    renderWithProviders(<Login />);

    const registerLink = screen.getByRole("link", { name: /sign up/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should require email and password fields", () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("should have correct input types", () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
