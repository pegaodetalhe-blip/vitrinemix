
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Heart,
  UserRound,
  MapPin,
  Shirt,
  Footprints,
  Smartphone,
  Armchair,
  Sparkles,
  Bike,
  Baby,
  Grid2X2,
  MessageCircle,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  seller_id: string;
  created_at: string;
};

type ProductPhoto = {
  product_id: string;
  photo_url: string;
  position: number;
};

type SellerProfile = {
  id: string;
  phone: string | null;
};

type GalleryProduct = {
  product: Product;
  photos: string[];
};

const categories = [
  { name: "Roupas", icon: Shirt, tint: "lavender" },
  { name: "Calçados", icon: Footprints, tint: "peach" },
  { name: "Eletrônicos", icon: Smartphone, tint: "lavender" },
  { name: "Casa", icon: Armchair, tint: "mint" },
  { name: "Beleza", icon: Sparkles, tint: "peach" },
  { name: "Esporte", icon: Bike, tint: "mint" },
  { name: "Infantil", icon: Baby, tint: "butter" },
  { name: "Outros", icon: Grid2X2, tint: "lavender" },
];

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function whatsappNumber(phone: string | null | undefined) {
  if (!phone) return "";

  let digits = phone.replace(/\D/g, "");

  if (!digits) return "";

  // Números brasileiros sem código do país recebem o prefixo 55.
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  // Evita criar um link para números incompletos.
  if (digits.length < 12 || digits.length > 13) return "";

  return digits;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [sellerPhones, setSellerPhones] = useState<
    Record<string, string>
  >({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gallery, setGallery] = useState<GalleryProduct | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState<
  Record<string, string>
>({});

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (!supabase) {
        setError("A conexão com o banco de dados não está configurada.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          "id, title, description, category, price, condition, seller_id, created_at"
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (queryError) {
        console.error("Erro ao carregar anúncios:", queryError.message);
        setError("Não foi possível carregar os anúncios. Tente novamente.");
        setLoading(false);
        return;
      }

      const loadedProducts = (data ?? []) as Product[];
      setProducts(loadedProducts);

      if (loadedProducts.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = loadedProducts.map((product) => product.id);
      const sellerIds = [
        ...new Set(loadedProducts.map((product) => product.seller_id)),
      ];

      const [photoResult, profileResult] = await Promise.all([
        supabase
          .from("product_photos")
          .select("product_id, photo_url, position")
          .in("product_id", productIds)
          .order("position", { ascending: true }),

        supabase
          .from("profiles")
          .select("id, phone")
          .in("id", sellerIds),
      ]);

      if (cancelled) return;

      if (photoResult.error) {
        console.error(
          "Erro ao carregar fotos:",
          photoResult.error.message
        );
      } else {
        const photoMap: Record<string, string[]> = {};

        for (const photo of (photoResult.data ?? []) as ProductPhoto[]) {
          if (!photo.photo_url) continue;

          if (!photoMap[photo.product_id]) {
            photoMap[photo.product_id] = [];
          }

          if (!photoMap[photo.product_id].includes(photo.photo_url)) {
            photoMap[photo.product_id].push(photo.photo_url);
          }
        }

        setPhotos(photoMap);
      }

      if (profileResult.error) {
        console.error(
          "Não foi possível consultar os telefones dos vendedores:",
          profileResult.error.message
        );
      } else {
        const phoneMap: Record<string, string> = {};

        for (const profile of (profileResult.data ?? []) as SellerProfile[]) {
          if (profile.phone) {
            phoneMap[profile.id] = profile.phone;
          }
        }

        setSellerPhones(phoneMap);
      }

      setLoading(false);
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.title.toLocaleLowerCase("pt-BR").includes(term) ||
        product.category.toLocaleLowerCase("pt-BR").includes(term) ||
        (product.description ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(term);

      const matchesCategory =
        !category ||
        product.category.toLocaleLowerCase("pt-BR") ===
          category.toLocaleLowerCase("pt-BR");

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function openGallery(product: Product, startIndex = 0) {
    const productPhotos = photos[product.id] ?? [];

    if (productPhotos.length === 0) return;

    setGallery({ product, photos: productPhotos });
    setPhotoIndex(startIndex);
  }

  function closeGallery() {
    setGallery(null);
    setPhotoIndex(0);
  }

  function previousPhoto() {
    if (!gallery) return;

    setPhotoIndex((current) =>
      current === 0 ? gallery.photos.length - 1 : current - 1
    );
  }

  function nextPhoto() {
    if (!gallery) return;

    setPhotoIndex((current) =>
      current === gallery.photos.length - 1 ? 0 : current + 1
    );
  }

  function contactSeller(product: Product) {
    const number = whatsappNumber(sellerPhones[product.seller_id]);

    if (!number) {
     setContactMessage((prev) => ({
  ...prev,
  [product.id]:
    "O telefone deste vendedor ainda não está disponível para contato. Tente novamente mais tarde.",
}));
      return;
    }

    setContactMessage((prev) => {
  const next = { ...prev };
  delete next[product.id];
  return next;
});

    const message = `Olá! Tenho interesse no produto "${product.title}" anunciado na VitrineMix por ${money(Number(product.price))}. Ele ainda está disponível?`;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main>
      <div className="topline">
        <span>♻️ Dê uma nova vida ao que você não usa mais</span>
        <span>Começando em Campos dos Goytacazes</span>
      </div>

      <header className="header shell">
        <a className="brand" href="#inicio">
          <span className="brandmark">
            <Heart size={22} fill="currentColor" />
          </span>
          <span>
            Vitrine<span className="coral">Mix</span>
            <small>Compre · Venda · Renove</small>
          </span>
        </a>

        <nav>
          <a href="#inicio">Início</a>
          <a href="#categorias">Categorias</a>
          <a href="#produtos">Achadinhos</a>
        </nav>

        <div className="header-actions">
          <a className="icon-button" aria-label="Perfil" href="/vender">
            <UserRound size={19} />
          </a>
          <a className="button coral-button" href="/vender">
            <Plus size={17} /> Quero vender
          </a>
        </div>
      </header>

      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> SEU PRÓXIMO ACHADO ESTÁ AQUI
          </span>

          <h1>
            Pequenos preços.
            <br />
            <span>Grandes histórias.</span>
          </h1>

          <p>
            Encontre coisas incríveis, dê um novo destino ao que já existe
            e faça bons negócios pertinho de você.
          </p>

          <div className="hero-actions">
            <a className="button coral-button" href="#produtos">
              Explorar achadinhos <ArrowRight size={17} />
            </a>
            <a className="button light-button" href="/vender">
              Quero desapegar
            </a>
          </div>

          <div className="trust-row">
            <span>
              <span className="trust-icon">✓</span>
              Fale direto com quem vende
            </span>
            <span>
              <MapPin size={15} /> Negócios locais
            </span>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Ilustração decorativa de produtos reutilizados"
        >
          <div className="art-orbit orbit-one"></div>
          <div className="art-orbit orbit-two"></div>
          <div className="art-spark spark-a">✦</div>
          <div className="art-spark spark-b">✧</div>
          <div className="art-bubble bubble-one">♻️</div>
          <div className="art-bubble bubble-two">♡</div>
          <div className="hero-objects">
            <span>🪴</span>
            <span>👜</span>
            <span>👟</span>
            <span>📚</span>
          </div>
          <div className="art-caption">
            <strong>Achados com história</strong>
            <span>Mais valor. Menos desperdício.</span>
          </div>
        </div>
      </section>

      <section className="searchbar shell">
        <div className="search-input">
          <Search size={20} />
          <input
            aria-label="Buscar produtos"
            placeholder="O que você está procurando hoje?"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => setSearch("")}
          >
            <SlidersHorizontal size={19} />
          </button>
        </div>

        <div className="location-select">
          <MapPin size={17} /> Campos dos Goytacazes <span>⌄</span>
        </div>
      </section>

      <section className="section shell" id="categorias">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORE POR CATEGORIA</span>
            <h2>Qual vai ser o seu achado?</h2>
          </div>
          <button className="text-link" onClick={() => setCategory("")}>
            Ver todas <ArrowRight size={16} />
          </button>
        </div>

        <div className="category-grid">
          {categories.map(({ name, icon: Icon, tint }) => (
            <button
              type="button"
              className={`category ${category === name ? "selected" : ""}`}
              key={name}
              onClick={() => setCategory(category === name ? "" : name)}
            >
              <span className={`category-icon ${tint}`}>
                <Icon size={24} />
              </span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section shell" id="produtos">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GARIMPOS DA COMUNIDADE</span>
            <h2>
              Achadinhos fresquinhos <span className="heading-spark">✳</span>
            </h2>
            <p>Produtos com novas histórias esperando por você.</p>
          </div>

          <button
            className="text-link"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            Limpar filtros <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <p role="status">Carregando anúncios...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span>🛍️</span>
            <h3>
              {products.length === 0
                ? "A vitrine está esperando seus primeiros anúncios!"
                : "Nenhum produto encontrado."}
            </h3>
            <p>
              {products.length === 0
                ? "Os produtos publicados pelos vendedores aparecerão aqui."
                : "Tente outro termo ou selecione uma categoria diferente."}
            </p>

            {category || search ? (
              <button
                className="button coral-button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => {
              const tint = ["peach", "lavender", "mint", "butter"][index % 4];
              const productPhotos = photos[product.id] ?? [];
              const firstPhoto = productPhotos[0];

              return (
                <article className="product-card" key={product.id}>
                  <div
                    className={`product-visual ${tint}`}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {firstPhoto ? (
                      <button
                        type="button"
                        onClick={() => openGallery(product)}
                        aria-label={`Ampliar fotos de ${product.title}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          padding: 0,
                          border: 0,
                          background: "transparent",
                          cursor: "zoom-in",
                        }}
                      >
                        <img
                          src={firstPhoto}
                          alt={product.title}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            position: "absolute",
                            inset: 0,
                          }}
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 10px",
                            borderRadius: 20,
                            background: "rgba(255,255,255,0.92)",
                            color: "#553477",
                            fontSize: 12,
                          }}
                        >
                          <ZoomIn size={15} />
                          Ver fotos ({productPhotos.length})
                        </span>
                      </button>
                    ) : (
                      <span className="product-emoji">🛍️</span>
                    )}

                    <span className="condition">
                      {product.condition === "new"
                        ? "Novo"
                        : product.condition === "used"
                          ? "Usado"
                          : product.condition}
                    </span>
                  </div>

                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.title}</h3>

                    <strong className="price">
                      {money(Number(product.price))}
                    </strong>

                    <div className="product-location">
                      <MapPin size={13} />
                      Campos dos Goytacazes
                    </div>

                    <p>{product.description}</p>

                    {productPhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openGallery(product)}
                        className="text-link"
                        style={{ marginBottom: 12 }}
                      >
                        <ZoomIn size={16} /> Ver todas as {productPhotos.length} fotos
                      </button>
                    )}

                    <button
                      type="button"
                      className="contact-button"
                      onClick={() => contactSeller(product)}
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      <MessageCircle size={16} /> Tenho interesse
                    </button>

                    
{contactMessage[product.id] && (
  <p
    role="status"
    style={{
      color: "#9a3412",
      background: "#fff7ed",
      borderRadius: 8,
      padding: 10,
      fontSize: 13,
    }}
  >
    {contactMessage[product.id]}
  </p>
)}

                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="sell-banner shell" id="vender">
        <div className="sell-icon">
          <Heart size={28} fill="currentColor" />
        </div>

        <div>
          <span className="eyebrow">SEU ARMÁRIO MERECE ESPAÇO</span>
          <h2>
            Tem algo parado? <span>Faça circular!</span>
          </h2>
          <p>
            Anuncie em poucos passos e encontre alguém que vai amar seu achado.
          </p>
        </div>

        <a className="button purple-button" href="/vender">
          Anunciar grátis <ArrowRight size={17} />
        </a>

        <div className="banner-decoration">✦　♡　✧</div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <a className="brand footer-brand" href="#inicio">
            <span className="brandmark">
              <Heart size={20} fill="currentColor" />
            </span>
            <span>
              Vitrine<span className="coral">Mix</span>
              <small>Compre · Venda · Renove</small>
            </span>
          </a>

          <p>Boas descobertas merecem circular. 💜</p>
          <span>Projeto comunitário • Campos dos Goytacazes e região</span>
        </div>
      </footer>

      {gallery && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de fotos: ${gallery.product.title}`}
          onClick={closeGallery}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeGallery();
            if (event.key === "ArrowLeft") previousPhoto();
            if (event.key === "ArrowRight") nextPhoto();
          }}
          tabIndex={-1}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(20, 12, 28, 0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <button
            type="button"
            aria-label="Fechar galeria"
            onClick={closeGallery}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              color: "#fff",
              background: "rgba(255,255,255,0.15)",
              border: 0,
              borderRadius: 30,
              padding: 10,
              cursor: "pointer",
            }}
          >
            <X size={25} />
          </button>

          <h2
            style={{
              color: "#fff",
              fontSize: 18,
              textAlign: "center",
              margin: "0 45px 16px",
            }}
          >
            {gallery.product.title}
          </h2>

          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 1000,
              height: "min(68vh, 680px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {gallery.photos.length > 1 && (
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={previousPhoto}
                style={{
                  flexShrink: 0,
                  color: "#fff",
                  background: "rgba(255,255,255,0.15)",
                  border: 0,
                  borderRadius: 30,
                  padding: 10,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <img
              src={gallery.photos[photoIndex]}
              alt={`${gallery.product.title} — foto ${photoIndex + 1}`}
              style={{
                maxWidth: "100%",
                width: "auto",
                height: "100%",
                objectFit: "contain",
                minWidth: 0,
                borderRadius: 8,
              }}
              onClick={(event) => event.stopPropagation()}
            />

            {gallery.photos.length > 1 && (
              <button
                type="button"
                aria-label="Próxima foto"
                onClick={nextPhoto}
                style={{
                  flexShrink: 0,
                  color: "#fff",
                  background: "rgba(255,255,255,0.15)",
                  border: 0,
                  borderRadius: 30,
                  padding: 10,
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          <p style={{ color: "#fff", margin: "14px 0 8px" }}>
            Foto {photoIndex + 1} de {gallery.photos.length}
          </p>

          {gallery.photos.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                maxWidth: "100%",
                overflowX: "auto",
                padding: 8,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {gallery.photos.map((photo, index) => (
                <button
                  type="button"
                  key={photo}
                  onClick={() => setPhotoIndex(index)}
                  aria-label={`Ver foto ${index + 1}`}
                  style={{
                    flexShrink: 0,
                    width: 58,
                    height: 58,
                    padding: 2,
                    borderRadius: 8,
                    border:
                      index === photoIndex
                        ? "2px solid #ff806b"
                        : "2px solid transparent",
                    background: "#fff",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={photo}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
