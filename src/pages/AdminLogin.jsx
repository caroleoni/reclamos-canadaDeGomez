import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "../services/authService";

export default function AdminLogin() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if(!email.trim() && !password.trim()) {
      toast.error("Completá email y contraseña");
      return;
    }

    setLoading(true);

    try {
      await signInAdmin(email, password);

      toast.success("Bienvenido al panel admin");

      navigate("/admin/dashboard");

    } catch (error) {
      if(error.message.includes("Invalid login credentials")) {
        toast.error("Email o contraseña incorrectos")
      } else {
        toast.error("No se pudo iniciar sesión")
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-blue-900 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Panel Administrativo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              Contraseña
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-while font-bold py-3 rounded-xl"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
