import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        alert("No credential received");
        return;
      }

      const res = await axios.post(
        "http://localhost:8055/auth/google-login",
        {
          idToken: credentialResponse.credential,
        }
      );

      console.log("LOGIN SUCCESS:", res.data);

      // ✅ store token
      localStorage.setItem("token", res.data.token);

      // ✅ navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };
exports.logoutUser = async (req, res) => {
  try {
    const { id, email } = req.body;

    // 1️⃣ Basic body validation
    if (!id || !email) {
      return res.status(400).json({
        message: "User id and email are required",
      });
    }

    // 2️⃣ Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("TMS ")) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    if (decoded.id !== id ) {
      return res.status(403).json({
        message: "Token does not match user",
      });
    }

    if (decoded.role !== 1) {
      return res.status(403).json({
        message: "Only Super Admin can logout this way",
      });
    }

    // 6️⃣ Find user
    const user = await User.findOne({
      where: { id, email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 7️⃣ Logout → clear login state
    await user.update({
      isLogin: false,
      token: "",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      message: "Logout failed",
    });
  }
};
  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        alert("Google Login Failed");
      }}
    />
  );
};
