// VerificationPage.js
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const VerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
        alert(res.data.message);
        navigate("/login");
      } catch (error) {
        alert("Email verification failed.");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return <div>Verifying your email...</div>;
};

export default VerificationPage;
