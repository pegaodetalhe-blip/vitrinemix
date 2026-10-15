import { Search, Heart, UserRound, MapPin, Shirt, Footprints, Smartphone, Armchair, Sparkles, Bike, Baby, Grid2X2, MessageCircle, ArrowRight, Plus, SlidersHorizontal } from "lucide-react";

const products = [
  { title: "Tênis esportivo", category: "Calçados", price: "120,00", location: "Centro, Campos", condition: "Muito bom", emoji: "👟", bg: "peach", seller: "Ana S." },
  { title: "Bolsa de couro", category: "Acessórios", price: "80,00", location: "Parque Tamandaré", condition: "Bom estado", emoji: "👜", bg: "lavender", seller: "Juliana C." },
  { title: "Celular 64 GB", category: "Eletrônicos", price: "650,00", location: "Pelinca, Campos", condition: "Muito bom", emoji: "📱", bg: "mint", seller: "Mariana L." },
  { title: "Mesa de jantar", category: "Casa", price: "450,00", location: "Guarus, Campos", condition: "Usado", emoji: "🪑", bg: "butter", seller: "Carlos M." },
  { title: "Jaqueta jeans", category: "Roupas", price: "55,00", location: "Centro, Campos", condition: "Muito bom", emoji: "🧥", bg: "mint", seller: "Bia R." },
  { title: "Mochila escolar", category: "Bolsas", price: "45,00", location: "Jardim Carioca", condition: "Bom estado", emoji: "🎒", bg: "lavender", seller: "Rafa P." },
  { title: "Luminária de mesa", category: "Casa", price: "35,00", location: "Parque Aurora", condition: "Como nova", emoji: "💡", bg: "peach", seller: "Dani F." },
  { title: "Bicicleta urbana", category: "Esporte", price: "390,00", location: "Centro, Campos", condition: "Usado", emoji: "🚲", bg: "butter", seller: "Leo A." }
];
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

export default function Home() {
  return (
    <main>
      <div className="topline"><span>♻️ Dê uma nova vida ao que você não usa mais</span><span>Começando em Campos dos Goytacazes</span></div>
      <header className="header shell">
        <a className="brand" href="#"><span className="brandmark"><Heart size={22} fill="currentColor" /></span><span>Vitrine<span className="coral">Mix</span><small>Compre · Venda · Renove</small></span></a>
        <nav><a href="#inicio">Início</a><a href="#categorias">Categorias</a><a href="#produtos">Achadinhos</a></nav>
        <div className="header-actions"><button className="icon-button" aria-label="Favoritos"><Heart size={19}/></button><button className="icon-button" aria-label="Perfil"><UserRound size={19}/></button><a className="button coral-button" href="#vender"><Plus size={17}/> Quero vender</a></div>
      </header>

      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> SEU PRÓXIMO ACHADO ESTÁ AQUI</span>
          <h1>Pequenos preços.<br/><span>Grandes histórias.</span></h1>
          <p>Encontre coisas incríveis, dê um novo destino ao que já existe e faça bons negócios pertinho de você.</p>
          <div className="hero-actions"><a className="button coral-button" href="#produtos">Explorar achadinhos <ArrowRight size={17}/></a><a className="button light-button" href="#vender">Quero desapegar</a></div>
          <div className="trust-row"><span><span className="trust-icon">✓</span> Fale direto com quem vende</span><span><MapPin size={15}/> Negócios locais</span></div>
        </div>
        <div className="hero-art" aria-label="Ilustração decorativa de produtos reutilizados">
          <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="art-spark spark-a">✦</div><div className="art-spark spark-b">✧</div>
          <div className="art-bubble bubble-one">♻️</div><div className="art-bubble bubble-two">♡</div>
          <div className="hero-objects"><span>🪴</span><span>👜</span><span>👟</span><span>📚</span></div>
          <div className="art-caption"><strong>Achados com história</strong><span>Mais valor. Menos desperdício.</span></div>
        </div>
      </section>

      <section className="searchbar shell">
        <div className="search-input"><Search size={20}/><input aria-label="Buscar" placeholder="O que você está procurando hoje?"/><button aria-label="Abrir filtros"><SlidersHorizontal size={19}/></button></div>
        <button className="location-select"><MapPin size={17}/> Campos dos Goytacazes <span>⌄</span></button>
      </section>

      <section className="section shell" id="categorias">
        <div className="section-heading"><div><span className="eyebrow">EXPLORE POR CATEGORIA</span><h2>Qual vai ser o seu achado?</h2></div><a href="#produtos" className="text-link">Ver todas <ArrowRight size={16}/></a></div>
        <div className="category-grid">{categories.map(({name, icon: Icon, tint}) => <a className="category" href="#produtos" key={name}><span className={`category-icon ${tint}`}><Icon size={24}/></span><span>{name}</span></a>)}</div>
      </section>

      <section className="section shell" id="produtos">
        <div className="section-heading"><div><span className="eyebrow">GARIMPOS DA COMUNIDADE</span><h2>Achadinhos fresquinhos <span className="heading-spark">✳</span></h2><p>Produtos com novas histórias esperando por você.</p></div><a href="#produtos" className="text-link">Ver todos <ArrowRight size={16}/></a></div>
        <div className="product-grid">{products.map((p, i) => <article className="product-card" key={p.title}>
          <div className={`product-visual ${p.bg}`}><span className="condition">{p.condition}</span><button className="favorite" aria-label="Favoritar"><Heart size={18}/></button><span className="product-emoji">{p.emoji}</span><span className="visual-spark">✦</span></div>
          <div className="product-info"><span className="product-category">{p.category}</span><h3>{p.title}</h3><strong className="price">R$ {p.price}</strong><div className="product-location"><MapPin size={13}/>{p.location}</div><div className="seller-row"><span className="avatar">{p.seller.slice(0,1)}</span><span>{p.seller}</span><span className="seller-badge">Vendedor local</span></div><button className="contact-button"><MessageCircle size={16}/> Tenho interesse</button></div>
        </article>)}</div>
      </section>

      <section className="sell-banner shell" id="vender"><div className="sell-icon"><Heart size={28} fill="currentColor"/></div><div><span className="eyebrow">SEU ARMÁRIO MERECE ESPAÇO</span><h2>Tem algo parado? <span>Faça circular!</span></h2><p>Anuncie em poucos passos e encontre alguém que vai amar seu achado.</p></div><a className="button purple-button" href="#vender">Anunciar grátis <ArrowRight size={17}/></a><div className="banner-decoration">✦　♡　✧</div></section>

      <footer className="footer"><div className="shell footer-inner"><a className="brand footer-brand" href="#"><span className="brandmark"><Heart size={20} fill="currentColor"/></span><span>Vitrine<span className="coral">Mix</span><small>Compre · Venda · Renove</small></span></a><p>Boas descobertas merecem circular. 💜</p><span>Projeto comunitário • Campos dos Goytacazes e região</span></div></footer>
    </main>
  );
}
