
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, LoaderCircle, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!supabase) {
      setError("A conexão com o sistema não está configurada.");
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    const digits = phone.replace(/\D/g, "");

    if (digits.length !== 10 && digits.length !== 11) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              phone: digits,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error("Não foi possível criar a conta.");
      }

      if (!data.session) {
        setSuccess(
          "Conta criada! Confira seu e-mail para confirmar o cadastro. Se o perfil não for criado automaticamente, será necessário configurar essa etapa no Supabase."
        );
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            name: name.trim(),
            phone: digits,
            role: "seller",
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error("Erro ao salvar perfil:", profileError.message);
        setError(
          "A conta foi criada, mas não foi possível salvar o perfil do vendedor. Será necessário ajustar as permissões do Supabase."
        );
        return;
      }

      setSuccess("Cadastro concluído! Abrindo sua área de vendedor...");

      router.replace("/vender");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 13,
    border: "1px solid #ddd3e7",
    borderRadius: 12,
  };

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
          maxWidth: 460,
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

        <div style={{ textAlign: "center", margin: "28px 0" }}>
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
            Seja vendedor na VitrineMix!
          </h1>

          <p style={{ color: "#716879", margin: 0 }}>
            Crie sua conta e comece a anunciar gratuitamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            Nome do vendedor
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            WhatsApp com DDD
            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(22) 99999-9999"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Senha
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Confirmar senha
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              style={inputStyle}
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
                overflowWrap: "anywhere",
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                color: "#166534",
                background: "#f0fdf4",
                padding: 12,
                borderRadius: 10,
                margin: 0,
              }}
            >
              {success}
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
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Criar conta de vendedor
              </>
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: 22,
            textAlign: "center",
            color: "#716879",
            fontSize: 14,
          }}
        >
          Já tem conta?{" "}
          <Link
            href="/login"
            style={{ color: "#7440a8", fontWeight: 600 }}
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
