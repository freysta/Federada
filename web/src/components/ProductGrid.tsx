import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import FadeIn from "./FadeIn";
import { API_URL } from "../config";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  extraImages?: string[];
  sizes: string[];
  category?: string;
  isCustomizable?: boolean;
}

import ProductModal from "./ProductModal";

export default function ProductGrid({ limit }: { limit?: number }) {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState<string>('TODOS');
	
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	useEffect(() => {
		fetch(`${API_URL}/products`)
			.then(res => {
				if (!res.ok) throw new Error('Falha');
				return res.json();
			})
			.then(data => {
				if (Array.isArray(data)) setProducts(data);
				else setProducts([]);
				setLoading(false);
			})
			.catch(err => {
				console.error("Erro ao buscar produtos:", err);
				setLoading(false);
			});
	}, []);

	return (
		<section className="py-24 bg-white" id="merch">
			<div className="max-w-7xl mx-auto px-6">
				<FadeIn>
					<div className="flex items-end justify-between mb-16 border-b border-black pb-4">
						<div>
							<h2 className="text-5xl md:text-6xl tracking-normal mb-2">
								<span className="glitch" data-text="LOJA OFICIAL">
									LOJA OFICIAL
								</span>
							</h2>
							<p className="text-gray-600 text-lg">
								Produtos exclusivos da Atlética
							</p>
						</div>
						<span className="font-mono text-sm mb-2 text-gray-500 hidden md:block">
							COLEÇÃO 2026
						</span>
					</div>
					
					{/* Categories */}
					<div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
						{['TODOS', 'CAMISAS', 'CANECAS', 'ACESSORIOS', 'GERAL'].map(cat => (
							<button 
								key={cat}
								onClick={() => setActiveCategory(cat)}
								className={`px-4 py-2 font-mono text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
							>
								{cat}
							</button>
						))}
					</div>
				</FadeIn>

				{loading ? (
					<div className="flex justify-center items-center py-20">
						<Loader2 className="animate-spin" size={48} />
					</div>
				) : (
					<div className="grid md:grid-cols-3 gap-12">
						{products
              .filter(p => activeCategory === 'TODOS' || p.category === activeCategory)
              .slice(0, limit || products.length)
              .map((product, index) => (
							<FadeIn key={product.id} delay={index * 100}>
							<div className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
								{/* Image Container */}
								<div className="relative aspect-[3/4] bg-neutral-100 mb-4 overflow-hidden border border-transparent hover:border-black transition-colors">
									
									<div className="absolute top-4 left-4 font-bold text-xs bg-black text-white px-3 py-1 z-10 group-hover:bg-white group-hover:text-black transition-colors">
										NOVO
									</div>

									<img
									  src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${API_URL}${product.imageUrl}`}
									  alt={product.name}
									  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-700"
									/>

									{/* Hover overlay text */}
									<div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/40 backdrop-blur-sm z-30">
										<span className="bg-black text-white px-6 py-3 font-bold text-sm tracking-widest">
											VER DETALHES
										</span>
									</div>
								</div>

								{/* Info */}
								<div className="pt-2">
									{/* Header: Name & Price */}
									<div className="flex justify-between items-start mb-1">
										<h3 className="text-lg font-bold leading-tight uppercase max-w-[80%] group-hover:text-gray-500 transition-colors">
											{product.name}
										</h3>
										<span className="font-mono font-bold text-sm text-black px-2 py-1">
											R$ {Number(product.price).toFixed(2).replace('.', ',')}
										</span>
									</div>
									<div className="text-sm text-gray-500">
										{product.category}
									</div>
								</div>
							</div>
						</FadeIn>
					))}
					</div>
				)}
			</div>

			{selectedProduct && (
				<ProductModal 
					product={selectedProduct} 
					onClose={() => setSelectedProduct(null)} 
				/>
			)}
		</section>
	);
}
