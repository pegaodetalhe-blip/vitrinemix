
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, LoaderCircle, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("A conexão com o sistema não está configurada.");
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw new Error(
          "E-mail ou senha incorretos. Confira os dados e tente novamente."
        );
      }

      router.replace("/vender");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 28,
          borderRadius: 24,
          border: "1px solid #eee5f7",
          background: "#fff",
          boxShadow: "0 12px 40px rgba(75, 35, 110, 0.08)",
        }}
      >
        <Link
          href="/"
          className="text-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={17} />
          Voltar à vitrine
        </Link>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 16px",
              borderRadius: 20,
              background: "#f0e7ff",
              color: "#7440a8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={30} fill="currentColor" />
          </div>

          <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>
            Bem-vindo à VitrineMix!
          </h1>

          <p style={{ color: "#716879", margin: 0 }}>
            Entre na sua conta para anunciar seus achadinhos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 18 }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            E-mail
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 13,
                border: "1px solid #ddd3e7",
                borderRadius: 12,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 13,
                border: "1px solid #ddd3e7",
                borderRadius: 12,
              }}
            />
          </label>

          {error && (
            <p
              role="alert"
              style={{
                color: "#b42318",
                background: "#fff0ef",
                padding: 12,
                borderRadius: 10,
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button coral-button"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: 14,
              border: 0,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? (
              <>
                <LoaderCircle size={18} />
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Entrar na minha conta
              </>
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: 22,
            textAlign: "center",
            color: "#716879",
            fontSize: 13,
          }}
        >
          Ainda não tem acesso? Por enquanto, a conta do vendedor
          precisa ser cadastrada no sistema.
        </p>
      </section>
    </main>
  );
}

