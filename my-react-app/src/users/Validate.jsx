import { useState } from "react";
import { Link } from "react-router-dom";
import { Navigate, useNavigate } from "react-router-dom";

import "../styles/auth.css";
import apiClient from "../api/apiClient";

function Validate() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [otpResent, setOtpResent] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;

    // Only allow numbers and maximum 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return;
    }

    const verification_id = sessionStorage.getItem("verification_id");

    console.log("OTP:", otp);

    try {
      const response = await apiClient.post("/auth/validate/", {
        otp: otp,
        verification_id: verification_id,
      });

      setSuccess(true);
      sessionStorage.removeItem("verification_id");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Validation failed. Please try again.",
      );
    }
  };

  const handleResend = async () => {
    console.log("Resend OTP");
    try {
      const verification_id = sessionStorage.getItem("verification_id");
      const response = apiClient.post("/auth/resendOTP/", {
        verification_id: verification_id,
      });
      setOtpResent(true);

      setTimeout(() => {
        setOtpResent(false);
      }, 5000);
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "OTP failed to resend. Please try again.",
      );
    }
  };

  return (
    <div className="validate-page">
      <div className="validate-container">
        {success ? (
          <div className="validation-success">
            <h1>Account Created!</h1>

            <p>Your email has been successfully verified.</p>

            <p className="redirect-message">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h1>Verify Your Email</h1>

            <p className="validate-description">
              We sent a 6-digit verification code to your email. Enter the code
              below to verify your account.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>

                <input
                  className="otp-input"
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <button type="submit" disabled={otp.length !== 6}>
                Verify Email
              </button>
            </form>

            <p className="resend-text">
              {otpResent ? (
                "OTP resent!"
              ) : (
                <>
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResend}
                  >
                    Resend code
                  </button>
                </>
              )}
            </p>

            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Validate;
