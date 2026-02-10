import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Auction Manager</h1>
          <p>Welcome to the Cricket Auction System</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
