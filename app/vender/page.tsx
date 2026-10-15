
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, LoaderCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MAX_PHOTOS = 4;
const MAX_SIZE = 5 * 1024 * 1024;

const categories = [
  "Roupas",
  "Calçados",
  "Eletrônicos",
  "Casa",
  "Beleza",
  "Esporte",
  "Infantil",
  "Outros"
];

export default function SellPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roupas");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("used");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkUser() {
      if (!supabase) {
        if (active) {
          setError("A conexão com o Supabase não está configurada.");
          setChecking(false);
        }
        return;
      }

      const { data, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !data.user) {
        setError(
          "Você precisa entrar na sua conta para anunciar. Faça login antes de continuar."
        );
      } else {
        setUserId(data.user.id);
      }

      setChecking(false);
    }

    checkUser();

    return () => {
      active = false;
    };
  }, []);

  function handleFiles(selected: FileList | null) {
    setError("");
    setMessage("");

    if (!selected) return;

    const incoming = Array.from(selected);

    if (files.length + incoming.length > MAX_PHOTOS) {
      setError("Você pode enviar no máximo quatro fotos por anúncio.");
      return;
    }

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError("Selecione somente arquivos de imagem.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError(`A foto "${file.name}" ultrapassa o limite de 5 MB.`);
        return;
      }
    }

    setFiles((previous) => [...previous, ...incoming]);
  }

  function removeFile(index: number) {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("A conexão com o Supabase não está configurada.");
      return;
    }

    if (!userId) {
      setError("Faça login antes de publicar um anúncio.");
      return;
    }

    const numericPrice = Number(price.replace(",", "."));

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Informe um preço válido, maior que zero.");
      return;
    }

    setLoading(true);

    try {
      // Confirma que a sessão ainda pertence ao vendedor.
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || authData.user?.id !== userId) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      // Cria o anúncio associado à conta autenticada.
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          seller_id: userId,
          title: title.trim(),
          description: description.trim(),
          category,
          price: numericPrice,
          condition,
          status: "active"
        })
        .select("id")
        .single();

      if (productError || !product) {
        throw new Error(
          productError?.message || "Não foi possível criar o anúncio."
        );
      }

      const uploadedPaths: string[] = [];
      const photoRows: {
        product_id: string;
        photo_url: string;
        position: number;
      }[] = [];

      try {
        for (let index = 0; index < files.length; index++) {
          const file = files[index];

          const extension =
            file.name.split(".").pop()?.toLowerCase() || "jpg";

          // A primeira pasta é o ID do usuário, conforme a política
          // de segurança do bucket.
          const path =
            `${userId}/${product.id}/${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from("product-photos")
            .upload(path, file, {
              contentType: file.type,
              upsert: false
            });

          if (uploadError) {
            throw new Error(
              `Falha ao enviar a foto ${index + 1}: ${uploadError.message}`
            );
          }

          uploadedPaths.push(path);

          const { data: publicData } = supabase.storage
            .from("product-photos")
            .getPublicUrl(path);

          photoRows.push({
            product_id: product.id,
            photo_url: publicData.publicUrl,
            position: index
          });
        }

        if (photoRows.length > 0) {
          const { error: photoError } = await supabase
            .from("product_photos")
            .insert(photoRows);

          if (photoError) {
            throw new Error(
              `O anúncio foi criado, mas não foi possível registrar as fotos: ${photoError.message}`
            );
          }
        }
      } catch (photoUploadError) {
        // Tenta remover os arquivos enviados se o registro das fotos falhar.
        if (uploadedPaths.length > 0) {
          await supabase.storage
            .from("product-photos")
            .remove(uploadedPaths);
        }

        throw photoUploadError;
      }

      setMessage("Anúncio publicado com sucesso!");
      router.push("/");
      router.refresh();
    } catch (submissionError) {
      const details =
        submissionError instanceof Error
          ? submissionError.message
          : "Ocorreu um erro inesperado.";

      setError(details);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="shell" style={{ padding: "48px 16px" }}>
        <p>Verificando sua conta...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="shell" style={{ padding: "48px 16px" }}>
        <a href="/" className="text-link">
          <ArrowLeft size={16} /> Voltar à vitrine
        </a>

        <h1 style={{ marginTop: 24 }}>Entre para anunciar</h1>
        <p>
          {error ||
            "Você precisa estar conectado à sua conta para publicar produtos."}
        </p>
        <p>
          A página de login ainda precisa estar disponível para que
          os vendedores possam entrar e publicar anúncios.
        </p>
      </main>
    );
  }

  return (
    <main className="shell" style={{ maxWidth: 760, padding: "36px 16px 64px" }}>
      <a href="/" className="text-link">
        <ArrowLeft size={16} /> Voltar à vitrine
      </a>

      <header style={{ margin: "28px 0" }}>
        <span className="eyebrow">VITRINEMIX • ANÚNCIO GRATUITO</span>
        <h1 style={{ margin: "8px 0" }}>Coloque seu achadinho na vitrine</h1>
        <p>Conte um pouco sobre o produto e adicione até quatro fotos.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        <label style={{ display: "grid", gap: 8 }}>
          Nome do produto *
          <input
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Tênis esportivo"
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Categoria *
          <select
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Preço (R$) *
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Ex.: 120,00"
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Estado do produto *
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            <option value="used">Usado</option>
            <option value="new">Novo</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Descrição *
          <textarea
            required
            minLength={5}
            maxLength={2000}
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva o estado, tamanho, marca e outros detalhes..."
          />
        </label>

        <section style={{ display: "grid", gap: 12 }}>
          <div>
            <strong>Fotos do produto</strong>
            <p style={{ marginTop: 4 }}>
              Até {MAX_PHOTOS} imagens, com no máximo 5 MB cada.
            </p>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              border: "2px dashed #d8c9ef",
              borderRadius: 16,
              padding: 24,
              cursor: "pointer"
            }}
          >
            <ImagePlus size={24} />
            Escolher fotos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
              disabled={files.length >= MAX_PHOTOS}
            />
          </label>

          {files.length > 0 && (
            <div style={{ display: "grid", gap: 8 }}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 10
                  }}
                >
                  <span style={{ overflowWrap: "anywhere" }}>
                    {index + 1}. {file.name}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remover ${file.name}`}
                    onClick={() => removeFile(index)}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <small>{files.length} de {MAX_PHOTOS} fotos selecionadas</small>
        </section>

        {error && (
          <p role="alert" style={{ color: "#b42318" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#18794e" }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="button coral-button"
          disabled={loading}
          style={{
            justifyContent: "center",
            padding: "14px 20px",
            border: 0,
            cursor: loading ? "wait" : "pointer"
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={18} /> Publicando...
            </>
          ) : (
            <>
              Publicar anúncio grátis <ArrowLeft size={18} />
            </>
          )}
        </button>
      </form>
    </main>
  );
}

