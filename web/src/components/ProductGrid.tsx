import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";
import FadeIn from "./FadeIn";

// Imports das Imagens
import adsShirtImg from "../assets/merchs/camisas/camiseta-ads-v1.jpg";
import federadaShirtImg from "../assets/merchs/camisas/camiseta-federada-v2.jpg";
import atleticaShirtImg from "../assets/merchs/camisas/camiseta-atletica-v1-front.jpg";
import mugImg from "../assets/merchs/canecas/caneca-federada-v1.jpeg";

const products = [
	{
		id: "CAM-ESP-001",
		name: "CAMISA DRY-FIT FEDERADA",
		price: "R$ 69,90",
		rawPrice: 69.90,
		image: federadaShirtImg,
		specs: [
			"Tecido Dry-Fit Tecnológico",
			"Cor: Azul Oficial",
			"Tamanhos: P, M, G, GG",
		],
		stock: 25,
		varName: "dryfit_federada_azul",
	},
	{
		id: "CAM-ESP-002",
		name: "CAMISA DRY-FIT ADS",
		price: "R$ 69,90",
		rawPrice: 69.90,
		image: adsShirtImg,
		specs: [
			"Malha Esportiva Premium",
			"Cor: Preta (Edição Curso)",
			"Tamanhos: P, M, G, GG",
		],
		stock: 30,
		varName: "dryfit_ads_preta",
	},
	{
		id: "CAM-ESP-003",
		name: "CAMISA OFICIAL ATLÉTICA",
		price: "R$ 59,90",
		rawPrice: 59.90,
		image: atleticaShirtImg,
		specs: [
			"Tecido Leve e Respirável",
			"Design Minimalista",
			"Ideal para treinos",
		],
		stock: 40,
		varName: "dryfit_atletica_v1",
	},
	{
		id: "CAN-001",
		name: "CANECA TÉRMICA FEDERADA",
		price: "R$ 45,90",
		rawPrice: 45.90,
		image: mugImg,
		specs: [
			"Cerâmica de Alta Qualidade",
			"350ml - Capacidade Ideal",
			"Mantém a temperatura",
		],
		stock: 48,
		varName: "caneca_federada_v1",
	},
];

export default function ProductGrid() {
	const [checkoutProduct, setCheckoutProduct] = useState<{name: string, price: string, rawPrice: number} | null>(null);

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

				<div className="grid md:grid-cols-3 gap-12">
					{products.map((product, index) => (
						<FadeIn key={product.id} delay={index * 100}>
							<div className="group cursor-pointer" onClick={() => setCheckoutProduct(product)}>
								{/* Image Container */}
								<div className="relative aspect-[3/4] bg-neutral-100 mb-6 overflow-hidden transition-all duration-500 border border-transparent group-hover:border-black/10 shadow-sm group-hover:shadow-lg">
									<div className="absolute top-4 left-4 font-bold text-xs bg-black text-white px-3 py-1 z-10">
										NOVO
									</div>

									{/* Inventory - Clear Language */}
									<div className="absolute bottom-4 left-4 font-sans text-xs bg-white/90 backdrop-blur px-3 py-1 border border-black/10 shadow-sm z-10 text-gray-800 font-bold">
										Restam apenas {product.stock} unidades
									</div>

									{/* Product Image */}
									<img
										src={product.image}
										alt={product.name}
										className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-700"
									/>

									<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 z-20 p-6">
										<button
											className="bg-black text-white w-full py-4 font-sans font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
										>
											<ShoppingBag size={18} />
											COMPRAR AGORA
										</button>
									</div>
								</div>

								{/* Info */}
								<div className="pt-2">
									{/* Header: Name & Price */}
									<div className="flex justify-between items-start mb-3">
										<div>
											<div className="font-mono text-[10px] text-gray-400 mb-1 flex items-center gap-2">
												<span>[{product.id}]</span>
												<span className="w-px h-3 bg-gray-200"></span>
												<span
													className={
														product.stock < 20 ? "text-orange-500" : "text-green-600"
													}
												>
													STOCK: {product.stock}
												</span>
											</div>
											<h3 className="text-lg font-bold leading-tight uppercase max-w-[80%]">
												{product.name}
											</h3>
										</div>
										<span className="font-mono font-bold text-sm text-black bg-gray-100 px-2 py-1 border border-gray-200 min-w-max">
											{product.price}
										</span>
									</div>

									{/* Technical Specs Box */}
									<div className="border-t border-dashed border-gray-300 py-3 mt-2">
										<ul className="space-y-1">
											{product.specs.map((spec, i) => (
												<li
													key={i}
													className="text-xs font-mono text-gray-600 flex items-start gap-2"
												>
													<span className="text-neon-cyan/50 font-bold">
														{">"}
													</span>
													{spec}
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						</FadeIn>
					))}
				</div>
			</div>

			<CheckoutModal
				isOpen={!!checkoutProduct}
				onClose={() => setCheckoutProduct(null)}
				product={checkoutProduct}
			/>
		</section>
	);
}
