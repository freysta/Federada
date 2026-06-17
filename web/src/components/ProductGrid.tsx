import { ShoppingBag, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import FadeIn from "./FadeIn";
import { API_URL } from "../config";
import { useCart } from "../contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: string[];
}

export default function ProductGrid() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const { addToCart } = useCart();

	useEffect(() => {
		fetch(`${API_URL}/products`)
			.then(res => res.json())
			.then(data => {
				setProducts(data);
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
				</FadeIn>

				{loading ? (
					<div className="flex justify-center items-center py-20">
						<Loader2 className="animate-spin" size={48} />
					</div>
				) : (
					<div className="grid md:grid-cols-3 gap-12">
						{products.map((product, index) => (
							<FadeIn key={product.id} delay={index * 100}>
							<div className="group cursor-pointer">
								{/* Image Container */}
								<div className="relative aspect-[3/4] bg-neutral-100 mb-6 overflow-hidden transition-all duration-500 border border-transparent group-hover:border-black/10 shadow-sm group-hover:shadow-lg">
									<div className="absolute top-4 left-4 font-bold text-xs bg-black text-white px-3 py-1 z-10">
										NOVO
									</div>

									{/* Inventory - Clear Language */}
									<div className="absolute bottom-4 left-4 font-sans text-xs bg-white/90 backdrop-blur px-3 py-1 border border-black/10 shadow-sm z-10 text-gray-800 font-bold">
										Venda sob demanda
									</div>

									{/* Product Image */}
									<img
										src={product.imageUrl}
										alt={product.name}
										className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-700"
									/>

									<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 z-20 p-6">
										{product.sizes && product.sizes.length > 0 ? (
											<div className="w-full flex flex-col items-center gap-3">
												<span className="font-mono text-xs font-bold tracking-widest text-gray-500">// ESCOLHA O TAMANHO</span>
												<div className="grid grid-cols-3 gap-2 w-full">
													{product.sizes.map((size) => (
														<button
															key={size}
															onClick={(e) => {
																e.stopPropagation();
																addToCart({
																	productId: product.id,
																	name: product.name,
																	price: product.price,
																	imageUrl: product.imageUrl,
																	size: size
																});
															}}
															className="border border-black bg-white text-black py-2 font-mono text-sm font-bold hover:bg-black hover:text-white transition-colors"
														>
															{size}
														</button>
													))}
												</div>
											</div>
										) : (
											<button
												onClick={(e) => {
													e.stopPropagation();
													addToCart({
														productId: product.id,
														name: product.name,
														price: product.price,
														imageUrl: product.imageUrl,
													});
												}}
												className="bg-black text-white w-full py-4 font-sans font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
											>
												<ShoppingBag size={18} />
												COMPRAR AGORA
											</button>
										)}
									</div>
								</div>

								{/* Info */}
								<div className="pt-2">
									{/* Header: Name & Price */}
									<div className="flex justify-between items-start mb-3">
										<div>
											<div className="font-mono text-[10px] text-gray-400 mb-1 flex items-center gap-2">
												<span>[{product.id.slice(0, 8)}]</span>
												<span className="w-px h-3 bg-gray-200"></span>
												<span className="text-green-600">
													DISPONÍVEL
												</span>
											</div>
											<h3 className="text-lg font-bold leading-tight uppercase max-w-[80%]">
												{product.name}
											</h3>
										</div>
										<span className="font-mono font-bold text-sm text-black bg-gray-100 px-2 py-1 border border-gray-200 min-w-max">
											R$ {Number(product.price).toFixed(2).replace('.', ',')}
										</span>
									</div>

									{/* Technical Specs Box */}
									<div className="border-t border-dashed border-gray-300 py-3 mt-2">
										<ul className="space-y-1">
											<li className="text-xs font-mono text-gray-600 flex items-start gap-2">
												<span className="text-neon-cyan/50 font-bold">{">"}</span>
												{product.description}
											</li>
											{product.sizes && product.sizes.length > 0 && (
												<li className="text-xs font-mono text-gray-600 flex items-start gap-2">
													<span className="text-neon-cyan/50 font-bold">{">"}</span>
													Tamanhos: {product.sizes.join(', ')}
												</li>
											)}
										</ul>
									</div>
								</div>
							</div>
						</FadeIn>
					))}
				</div>
				)}
			</div>
		</section>
	);
}
