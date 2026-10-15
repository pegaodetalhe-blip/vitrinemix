
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, Heart, UserRound, MapPin, Shirt, Footprints,
  Smartphone, Armchair, Sparkles, Bike, Baby, Grid2X2,
  MessageCircle, ArrowRight, Plus, SlidersHorizontal
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  city: string;
  seller_id: string;
  created_at: string;
};

const categories = [
  { name: "Roupas", icon: Shirt, tint: "lavender" },
  { name: "Calçados", icon: Footprints, tint: "peach" },
  { name: "Eletrônicos", icon: Smartphone, tint: "lavender" },
  { name: "Casa", icon: Armchair, tint: "mint" },
  { name: "Beleza", icon: Sparkles, tint: "peach" },
  { name: "Esporte", icon: Bike, tint: "mint" },
  { name: "Infantil", icon: Baby, tint: "butter" },
  { name: "Outros", icon: Grid2X2, tint: "lavender" }
];

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      if (!supabase) {
        setError("A conexão com o banco de dados não está configurada.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("products")
        .select("id, title, description, category, price, condition, city, seller_id, created_at")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("Erro ao carregar anúncios:", queryError.message);
        setError("Não foi possível carregar os anúncios. Tente novamente mais tarde.");
      } else {
        setProducts((data ?? []) as Product[]);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.title.toLocaleLowerCase("pt-BR").includes(term) ||
        product.category.toLocaleLowerCase("pt-BR").includes(term) ||
        product.description.toLocaleLowerCase("pt-BR").includes(term);

      const matchesCategory =
        !category || product.category.toLocaleLowerCase("pt-BR") === category.toLocaleLowerCase("pt-BR");

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <main>
      <div className="topline">
        <span>♻️ Dê uma nova vida ao que você não usa mais</span>
        <span>Começando em Campos dos Goytacazes</span>
      </div>

      <header className="header shell">
        <a className="brand" href="#inicio">
          <span className="brandmark"><Heart size={22} fill="currentColor" /></span>
          <span>Vitrine<span className="coral">Mix</span><small>Compre · Venda · Renove</small></span>
        </a>
        <nav>
          <a href="#inicio">Início</a>
          <a href="#categorias">Categorias</a>
          <a href="#produtos">Achadinhos</a>
        </nav>
        <div className="header-actions">
          <a className="icon-button" aria-label="Perfil" href="#vender"><UserRound size={19}/></a>
          <a className="button coral-button" href="#vender"><Plus size={17}/> Quero vender</a>
        </div>
      </header>

      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> SEU PRÓXIMO ACHADO ESTÁ AQUI</span>
          <h1>Pequenos preços.<br/><span>Grandes histórias.</span></h1>
          <p>Encontre coisas incríveis, dê um novo destino ao que já existe e faça bons negócios pertinho de você.</p>
          <div className="hero-actions">
            <a className="button coral-button" href="#produtos">Explorar achadinhos <ArrowRight size={17}/></a>
            <a className="button light-button" href="#vender">Quero desapegar</a>
          </div>
          <div className="trust-row">
            <span><span className="trust-icon">✓</span> Fale direto com quem vende</span>
            <span><MapPin size={15}/> Negócios locais</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Ilustração decorativa de produtos reutilizados">
          <div className="art-orbit orbit-one"></div>
          <div className="art-orbit orbit-two"></div>
          <div className="art-spark spark-a">✦</div>
          <div className="art-spark spark-b">✧</div>
          <div className="art-bubble bubble-one">♻️</div>
          <div className="art-bubble bubble-two">♡</div>
          <div className="hero-objects"><span>🪴</span><span>👜</span><span>👟</span><span>📚</span></div>
          <div className="art-caption"><strong>Achados com história</strong><span>Mais valor. Menos desperdício.</span></div>
        </div>
      </section>

      <section className="searchbar shell">
        <div className="search-input">
          <Search size={20}/>
          <input
            aria-label="Buscar produtos"
            placeholder="O que você está procurando hoje?"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" aria-label="Limpar busca" onClick={() => setSearch("")}>
            <SlidersHorizontal size={19}/>
          </button>
        </div>
        <div className="location-select"><MapPin size={17}/> Campos dos Goytacazes <span>⌄</span></div>
      </section>

      <section className="section shell" id="categorias">
        <div className="section-heading">
          <div><span className="eyebrow">EXPLORE POR CATEGORIA</span><h2>Qual vai ser o seu achado?</h2></div>
          <button className="text-link" onClick={() => setCategory("")}>Ver todas <ArrowRight size={16}/></button>
        </div>
        <div className="category-grid">
          {categories.map(({ name, icon: Icon, tint }) => (
            <button
              type="button"
              className={`category ${category === name ? "selected" : ""}`}
              key={name}
              onClick={() => setCategory(category === name ? "" : name)}
            >
              <span className={`category-icon ${tint}`}><Icon size={24}/></span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section shell" id="produtos">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GARIMPOS DA COMUNIDADE</span>
            <h2>Achadinhos fresquinhos <span className="heading-spark">✳</span></h2>
            <p>Produtos com novas histórias esperando por você.</p>
          </div>
          <button className="text-link" onClick={() => { setSearch(""); setCategory(""); }}>
            Limpar filtros <ArrowRight size={16}/>
          </button>
        </div>

        {loading ? (
          <p role="status">Carregando anúncios...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span>🛍️</span>
            <h3>{products.length === 0 ? "A vitrine está esperando seus primeiros anúncios!" : "Nenhum produto encontrado."}</h3>
            <p>{products.length === 0
              ? "Os produtos publicados pelos vendedores aparecerão aqui."
              : "Tente outro termo ou selecione uma categoria diferente."}</p>
            {category || search ? (
              <button className="button coral-button" onClick={() => { setSearch(""); setCategory(""); }}>
                Limpar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => {
              const tint = ["peach", "lavender", "mint", "butter"][index % 4];

              return (
                <article className="product-card" key={product.id}>
                  <div className={`product-visual ${tint}`}>
                    <span className="condition">{product.condition || "Usado"}</span>
                    <span className="product-emoji">🛍️</span>
                    <span className="visual-spark">✦</span>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.title}</h3>
                    <strong className="price">{money(Number(product.price))}</strong>
                    <div className="product-location"><MapPin size={13}/>{product.city}</div>
                    <p>{product.description}</p>
                    <a className="contact-button" href="#vender">
                      <MessageCircle size={16}/> Tenho interesse
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="sell-banner shell" id="vender">
        <div className="sell-icon"><Heart size={28} fill="currentColor"/></div>
        <div>
          <span className="eyebrow">SEU ARMÁRIO MERECE ESPAÇO</span>
          <h2>Tem algo parado? <span>Faça circular!</span></h2>
          <p>Anuncie em poucos passos e encontre alguém que vai amar seu achado.</p>
        </div>
        <a className="button purple-button" href="#vender">Anunciar grátis <ArrowRight size={17}/></a>
        <div className="banner-decoration">✦　♡　✧</div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <a className="brand footer-brand" href="#inicio">
            <span className="brandmark"><Heart size={20} fill="currentColor"/></span>
            <span>Vitrine<span className="coral">Mix</span><small>Compre · Venda · Renove</small></span>
          </a>
          <p>Boas descobertas merecem circular. 💜</p>
          <span>Projeto comunitário • Campos dos Goytacazes e região</span>
        </div>
      </footer>
    </main>
  );
}
