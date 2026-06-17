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
  category?: string;
  isCustomizable?: boolean;
}

export default function ProductGrid() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState<string>('TODOS');
	const { addToCart } = useCart();
	
	// Customization State
	const [customizingProduct, setCustomizingProduct] = useState<{product: Product, size?: string} | null>(null);
	const [customData, setCustomData] = useState({ name: '', number: '', type: 'TORCEDOR' });

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
						{products.filter(p => activeCategory === 'TODOS' || p.category === activeCategory).map((product, index) => (
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
										src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${API_URL}${product.imageUrl}`}
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
																if (product.isCustomizable) {
																	setCustomizingProduct({ product, size });
																} else {
																	addToCart({
																		productId: product.id,
																		name: product.name,
																		price: product.price,
																		imageUrl: product.imageUrl,
																		size: size
																	});
																}
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
													if (product.isCustomizable) {
														setCustomizingProduct({ product });
													} else {
														addToCart({
															productId: product.id,
															name: product.name,
															price: product.price,
															imageUrl: product.imageUrl,
														});
													}
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

			{/* Customization Modal */}
			{customizingProduct && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white p-6 max-w-md w-full">
						<h3 className="text-xl font-bold font-mono uppercase mb-4 tracking-wider">Personalize seu Produto</h3>
						<p className="text-gray-500 text-sm mb-6">Nome e número serão gravados no seu {customizingProduct.product.name}.</p>
						
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-bold mb-1">Nome na Camisa</label>
								<input type="text" maxLength={20} value={customData.name} onChange={e => setCustomData({...customData, name: e.target.value.toUpperCase()})} className="w-full border p-2 font-mono uppercase" placeholder="SEU NOME" />
							</div>
							<div>
								<label className="block text-sm font-bold mb-1">Número</label>
								<input type="text" maxLength={3} value={customData.number} onChange={e => setCustomData({...customData, number: e.target.value})} className="w-full border p-2 font-mono" placeholder="10" />
							</div>
							<div>
								<label className="block text-sm font-bold mb-1">Você é?</label>
								<div className="flex gap-4">
									<label className="flex items-center gap-2 cursor-pointer">
										<input type="radio" name="type" value="TORCEDOR" checked={customData.type === 'TORCEDOR'} onChange={() => setCustomData({...customData, type: 'TORCEDOR'})} />
										<span>Torcedor</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<input type="radio" name="type" value="ATLETA" checked={customData.type === 'ATLETA'} onChange={() => setCustomData({...customData, type: 'ATLETA'})} />
										<span>Atleta da Atlética</span>
									</label>
								</div>
							</div>
						</div>

						<div className="mt-8 flex gap-3">
							<button onClick={() => setCustomizingProduct(null)} className="flex-1 py-3 border border-black font-bold hover:bg-gray-50">CANCELAR</button>
							<button 
								onClick={() => {
									addToCart({
										productId: customizingProduct.product.id,
										name: customizingProduct.product.name,
										price: customizingProduct.product.price,
										imageUrl: customizingProduct.product.imageUrl,
										size: customizingProduct.size,
										isCustomizable: true,
										customName: customData.name,
										customNumber: customData.number,
										playerType: customData.type
									});
									setCustomizingProduct(null);
									setCustomData({ name: '', number: '', type: 'TORCEDOR' });
								}} 
								disabled={!customData.name || !customData.number}
								className="flex-1 py-3 bg-black text-white font-bold hover:bg-neutral-800 disabled:opacity-50"
							>
								ADICIONAR
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
